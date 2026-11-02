-- =====================================================================
-- 0005_panel_creador.sql
-- Tablas y políticas de seguridad (RLS) para el PANEL DE CREADOR.
--
-- ¿Cómo garantizamos en producción que SOLO TÚ puedas editar?
-- 1. Añadimos la columna `is_creator` a `public.profiles`.
-- 2. Creamos la función `public.es_creador()` que comprueba en el
--    servidor de PostgreSQL si el usuario autenticado (`auth.uid()`)
--    tiene `is_creator = true`.
-- 3. Las políticas RLS permiten que cualquiera LEA (`SELECT`) las
--    misiones y eventos activos, pero SOLO `public.es_creador()` puede
--    hacer `INSERT`, `UPDATE` o `DELETE`.
-- =====================================================================

-- 1. Columna de rol de creador en perfiles
alter table public.profiles
  add column if not exists is_creator boolean not null default false;

-- Función auxiliar para usar en las políticas RLS
create or replace function public.es_creador()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select p.is_creator from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

-- 2. Tabla de Misiones y Retos Nocturnos creados desde el panel
create table if not exists public.missions (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  description  text not null,
  category     text not null check (category in ('horario', 'barrio', 'picante', 'calibre')),
  difficulty   text not null check (difficulty in ('facil', 'media', 'leyenda')),
  xp_reward    integer not null default 150 check (xp_reward >= 10),
  badge_reward text not null,
  target_steps integer not null default 3 check (target_steps >= 1),
  action_href  text not null default '/kebab/el-trompo-de-oro/resenar',
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- 3. Tabla de Eventos Especiales (Temporadas, Doble XP, Guerras de Barrios)
create table if not exists public.special_events (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  subtitle      text not null,
  badge_text    text not null default 'EVENTO ESPECIAL 3 AM',
  xp_multiplier numeric(3,1) not null default 2.0 check (xp_multiplier >= 1.0),
  accent_color  text not null default '#FF3B30',
  cta_label     text not null default 'Participar ahora',
  cta_href      text not null default '/misiones',
  ends_at_label text not null default 'Termina este domingo 05:00 AM',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- 4. Tabla de Ajustes Globales de la Web (Textos de portada, XP por ticket...)
create table if not exists public.site_settings (
  id                 integer primary key default 1 check (id = 1),
  hero_badge         text not null default 'Málaga · Abierto hasta que cierre el último asador',
  hero_title_line1   text not null default 'Kebabs de Málaga,',
  hero_title_accent  text not null default 'puntuados capa a capa',
  hero_subtitle      text not null default 'Aquí no valoramos la decoración del local: auditamos la carne, el chorreo de las salsas, el sellado del pan y quién te salva la vida a las 3 de la mañana.',
  golden_rule_quote  text not null default 'Un local nunca puede pagar para subir su nota. Solo mandan los tickets a las 3 de la mañana.',
  xp_per_review      integer not null default 150,
  updated_at         timestamptz not null default now()
);

-- 5. Activamos Row-Level Security (RLS)
alter table public.missions enable row level security;
alter table public.special_events enable row level security;
alter table public.site_settings enable row level security;

-- Políticas de lectura pública
create policy "missions_select_public"
  on public.missions for select
  using (is_active = true or public.es_creador());

create policy "special_events_select_public"
  on public.special_events for select
  using (is_active = true or public.es_creador());

create policy "site_settings_select_public"
  on public.site_settings for select
  using (true);

-- Políticas de escritura EXCLUSIVAS para el creador
create policy "missions_write_creator_only"
  on public.missions for all
  using (public.es_creador())
  with check (public.es_creador());

create policy "special_events_write_creator_only"
  on public.special_events for all
  using (public.es_creador())
  with check (public.es_creador());

create policy "site_settings_write_creator_only"
  on public.site_settings for all
  using (public.es_creador())
  with check (public.es_creador());

create policy "venues_write_creator_only"
  on public.venues for all
  using (public.es_creador())
  with check (public.es_creador());

-- Para darte permisos de creador en Supabase SQL Editor, ejecuta:
-- update public.profiles set is_creator = true where id = 'TU-UUID-DE-USUARIO';
