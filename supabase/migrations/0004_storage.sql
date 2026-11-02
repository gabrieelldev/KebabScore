-- =====================================================================
-- KebabScore · Migración 0004 · Almacenamiento de fotos (Supabase Storage)
-- =====================================================================
-- Dos "buckets" (carpetas raíz):
--   review-photos → fotos que suben los usuarios con su reseña
--   venue-photos  → foto de portada de cada local (solo admin)
-- Son públicos para LEER (las fotos se ven sin iniciar sesión),
-- pero para SUBIR o BORRAR hay que cumplir las políticas de abajo.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('review-photos', 'review-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('venue-photos',  'venue-photos',  true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
-- 5242880 bytes = 5 MB. Igualmente comprimiremos en el navegador antes de subir.


-- ============ FOTOS DE RESEÑAS ============
-- Cada usuario solo puede escribir dentro de SU carpeta: review-photos/{su_id}/...
-- storage.foldername('abc/def/1.webp') devuelve {abc, def} → [1] es la primera carpeta.
create policy "Fotos reseña: subir a mi carpeta"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'review-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Fotos reseña: borrar de mi carpeta"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'review-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );


-- ============ FOTOS DE LOCALES ============
create policy "Fotos local: solo admin sube"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'venue-photos' and public.is_admin());

create policy "Fotos local: solo admin borra"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'venue-photos' and public.is_admin());
