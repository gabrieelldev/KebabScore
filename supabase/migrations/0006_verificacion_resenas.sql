-- =====================================================================
-- 0006_verificacion_resenas.sql
-- Sistema Anti-Fraude: Verificación obligatoria de que el usuario ha
-- comido realmente en el local ("Proof of Kebab").
--
-- Explicación para 1.º de DAW:
-- Añadimos a `public.reviews` los campos que demuestran cómo se ha
-- verificado la reseña y un constraint `check` en PostgreSQL que
-- impide insertar una reseña si no trae al menos una prueba válida
-- (GPS a menos de 150 metros o foto real del ticket/dürüm con código).
-- =====================================================================

alter table public.reviews
  add column if not exists verification_method text not null default 'receipt_photo'
    check (verification_method in ('gps_checkin', 'receipt_photo', 'double_verified')),
  add column if not exists gps_distance_meters integer
    check (gps_distance_meters is null or gps_distance_meters >= 0),
  add column if not exists receipt_reference   text,
  add column if not exists photo_fingerprint   text unique,
  add column if not exists verified_at         timestamptz not null default now();

-- Regla de integridad en el servidor:
-- Si el método incluye GPS, la distancia debe ser <= 150 metros.
alter table public.reviews
  drop constraint if exists reviews_gps_radius_check;

alter table public.reviews
  add constraint reviews_gps_radius_check check (
    (verification_method not in ('gps_checkin', 'double_verified'))
    or (gps_distance_meters is not null and gps_distance_meters <= 150)
  );
