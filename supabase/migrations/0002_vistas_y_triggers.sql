-- =====================================================================
-- KebabScore · Migración 0002 · Funciones, triggers y vistas
-- =====================================================================
-- Nota de seguridad: las funciones "security definer" se ejecutan con los
-- permisos de quien las CREÓ (no de quien las llama). Por eso siempre fijamos
-- "set search_path = ''" y escribimos los nombres completos (public.tabla):
-- así nadie puede colarnos una tabla falsa con el mismo nombre.


-- ============ ¿ES ADMIN? ============
-- La usamos en las políticas RLS (0003).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;


-- ============ CREAR PERFIL AL REGISTRARSE ============
-- Se dispara cuando Supabase Auth crea un usuario (email, Google o Apple).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    -- Usuario provisional único: kebabero_ + 8 caracteres del id. Se puede cambiar luego.
    'kebabero_' || substr(replace(new.id::text, '-', ''), 1, 8),
    -- Google manda 'full_name' o 'name'; Apple solo lo manda la primera vez.
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), 40),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============ ANTIFRAUDE: MÁXIMO 5 RESEÑAS CADA 24 H ============
create or replace function public.limit_reviews_per_day()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*) from public.reviews
    where user_id = new.user_id
      and created_at > now() - interval '24 hours'
  ) >= 5 then
    -- El texto llega hasta el usuario: le ponemos humor
    raise exception 'Llevas 5 kebabs hoy. Tu estómago pide tregua: vuelve mañana.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger limit_reviews_per_day
  before insert on public.reviews
  for each row execute function public.limit_reviews_per_day();


-- ============ ANTIFRAUDE: MÁXIMO 3 FOTOS POR RESEÑA ============
create or replace function public.limit_photos_per_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.review_photos where review_id = new.review_id) >= 3 then
    raise exception 'Máximo 3 fotos por reseña. Es un kebab, no una boda.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger limit_photos_per_review
  before insert on public.review_photos
  for each row execute function public.limit_photos_per_review();


-- ============ ACTUALIZAR updated_at AL EDITAR ============
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_reviews_updated_at
  before update on public.reviews
  for each row execute function public.touch_updated_at();


-- ============ VISTA: NOTA DE CADA LOCAL ============
-- Una vista es una "consulta guardada": no almacena datos, los calcula al leerla.
-- Por eso la nota de un local SIEMPRE coincide con sus reseñas y nadie puede editarla.
--
-- security_invoker = true → la vista respeta las políticas RLS de quien consulta.
--
-- ranking_score usa una MEDIA BAYESIANA: es como si cada local empezara con
-- 5 reseñas "imaginarias" de nota 6,5. Con pocas reseñas reales la nota se queda
-- cerca de 6,5; con muchas, manda la media real. Así un único 10 no gana el ranking.
-- (Mismos valores en src/lib/puntuacion.ts → C_BAYES y M_BAYES.)
create view public.venue_scores
with (security_invoker = true)
as
select
  v.id                                    as venue_id,
  count(r.id)::int                        as review_count,
  round(avg(r.score), 1)                  as kebab_score,
  round(avg(r.meat), 1)                   as meat_avg,
  round(avg(r.bread), 1)                  as bread_avg,
  round(avg(r.sauces), 1)                 as sauces_avg,
  round(avg(r.freshness), 1)              as freshness_avg,
  round(avg(r.value), 1)                  as value_avg,
  round(avg(r.night), 1)                  as night_avg,
  round((5 * 6.5 + coalesce(sum(r.score), 0)) / (5 + count(r.id)), 2) as ranking_score
from public.venues v
left join public.reviews r on r.venue_id = v.id
where v.is_published
group by v.id;


-- ============ VISTA: ESTADÍSTICAS DE USUARIO (para las insignias) ============
-- Las insignias no se guardan: se deducen de aquí.
--   1.ª reseña    → review_count >= 1
--   10 reseñas    → review_count >= 10
--   5 barrios     → neighborhood_count >= 5
create view public.user_stats
with (security_invoker = true)
as
select
  p.id                                  as user_id,
  p.username,
  count(r.id)::int                      as review_count,
  count(distinct v.neighborhood_id)::int as neighborhood_count,
  min(r.created_at)                     as first_review_at
from public.profiles p
left join public.reviews r on r.user_id = p.id
left join public.venues v on v.id = r.venue_id
group by p.id;
