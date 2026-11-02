-- =====================================================================
-- KebabScore · Migración 0003 · Seguridad con RLS (Row Level Security)
-- ---------------------------------------------------------------------
-- RLS = la BASE DE DATOS decide qué filas puede leer o modificar cada
-- usuario, aunque alguien llame a la API de Supabase saltándose nuestra web.
-- Al activar RLS en una tabla, por defecto NADIE puede hacer NADA; luego
-- vamos abriendo permisos con políticas ("policies").
--
--   using (...)      → qué filas EXISTENTES puedes ver/tocar
--   with check (...) → cómo deben quedar las filas que INSERTAS o EDITAS
--
-- Truco de rendimiento recomendado por Supabase: escribir (select auth.uid())
-- en vez de auth.uid() para que se calcule una sola vez por consulta.
-- =====================================================================

alter table public.profiles      enable row level security;
alter table public.neighborhoods enable row level security;
alter table public.venues        enable row level security;
alter table public.opening_hours enable row level security;
alter table public.reviews       enable row level security;
alter table public.review_photos enable row level security;


-- ============ PERFILES ============
create policy "Perfiles: lectura pública"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Perfiles: cada uno edita el suyo"
  on public.profiles for update
  to authenticated
  using      (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Permisos POR COLUMNA: aunque la política te deje editar tu fila, solo puedes
-- cambiar estas columnas. Sin esto, cualquiera podría hacerse 'admin'.
revoke update on public.profiles from anon, authenticated;
grant  update (username, display_name) on public.profiles to authenticated;
-- No hay política de INSERT: los perfiles solo los crea el trigger handle_new_user.


-- ============ BARRIOS ============
create policy "Barrios: lectura pública"
  on public.neighborhoods for select
  to anon, authenticated
  using (true);

create policy "Barrios: solo admin escribe"
  on public.neighborhoods for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- ============ LOCALES ============
create policy "Locales: lectura pública de los publicados"
  on public.venues for select
  to anon, authenticated
  using (is_published or public.is_admin());

create policy "Locales: solo admin escribe"
  on public.venues for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
-- Los dueños de locales NO tienen cuenta especial: no pueden tocar nada.
-- Y como la nota es una vista calculada, ni siquiera un admin puede "ponerla".


-- ============ HORARIOS ============
create policy "Horarios: lectura pública"
  on public.opening_hours for select
  to anon, authenticated
  using (true);

create policy "Horarios: solo admin escribe"
  on public.opening_hours for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- ============ RESEÑAS ============
create policy "Reseñas: lectura pública"
  on public.reviews for select
  to anon, authenticated
  using (true);

create policy "Reseñas: crear solo en tu nombre y en locales publicados"
  on public.reviews for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.venues v
      where v.id = venue_id and v.is_published
    )
  );

create policy "Reseñas: editar solo las mías"
  on public.reviews for update
  to authenticated
  using      (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Reseñas: borrar las mías (o admin, para moderar)"
  on public.reviews for delete
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- Al editar solo se pueden cambiar las notas y el comentario.
-- Así nadie puede "mover" su reseña a otro local ni cambiar el autor.
revoke update on public.reviews from anon, authenticated;
grant  update (meat, bread, sauces, freshness, value, night, comment)
  on public.reviews to authenticated;


-- ============ FOTOS DE RESEÑAS ============
create policy "Fotos: lectura pública"
  on public.review_photos for select
  to anon, authenticated
  using (true);

create policy "Fotos: añadir solo a mis reseñas"
  on public.review_photos for insert
  to authenticated
  with check (
    exists (
      select 1 from public.reviews r
      where r.id = review_id and r.user_id = (select auth.uid())
    )
  );

create policy "Fotos: borrar las de mis reseñas (o admin)"
  on public.review_photos for delete
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.reviews r
      where r.id = review_id and r.user_id = (select auth.uid())
    )
  );


-- ============ VISTAS ============
-- Las vistas solo se leen. Al ser security_invoker, aplican las políticas de arriba.
grant select on public.venue_scores to anon, authenticated;
grant select on public.user_stats   to anon, authenticated;
