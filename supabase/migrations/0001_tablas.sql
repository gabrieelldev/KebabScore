-- =====================================================================
-- KebabScore · Migración 0001 · Tablas
-- ---------------------------------------------------------------------
-- Cómo ejecutarla: Supabase → SQL Editor → pega este archivo → Run.
-- Después ejecuta 0002, 0003 y 0004 EN ORDEN.
--
-- Convención: tablas y columnas en inglés (estándar en SQL),
-- comentarios y textos para el usuario en español.
-- =====================================================================


-- ============ PERFILES ============
-- auth.users la gestiona Supabase (contraseñas, proveedores...). Nunca la
-- tocamos. Aquí guardamos solo los datos PÚBLICOS del usuario.
-- El perfil se crea automáticamente con un trigger (ver 0002).
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  -- Solo minúsculas, números y guion bajo: así sirve directamente en la URL /perfil/[usuario]
  username     text unique not null check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text check (char_length(display_name) <= 40),
  -- Google y Apple nos dan una URL de avatar. El usuario NO puede cambiarla a mano
  -- (ver permisos por columna en 0003) para evitar imágenes de terceros maliciosas.
  avatar_url   text,
  role         text not null default 'user' check (role in ('user', 'admin')),
  created_at   timestamptz not null default now()
);


-- ============ BARRIOS ============
create table public.neighborhoods (
  id       smallint generated always as identity primary key,
  slug     text unique not null check (slug ~ '^[a-z0-9-]+$'),  -- 'el-palo'
  name     text not null,                                         -- 'El Palo'
  district text not null,                                         -- distrito oficial: 'Este'
  city     text not null default 'Málaga'  -- preparado por si algún día hay más ciudades
);


-- ============ LOCALES ============
create table public.venues (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null check (slug ~ '^[a-z0-9-]+$'),
  name              text not null check (char_length(name) between 2 and 80),
  neighborhood_id   smallint not null references public.neighborhoods (id),
  address           text not null,
  -- Comprobación de cordura: impide colocar un local fuera del área de Málaga
  -- por un error al copiar coordenadas (p. ej. intercambiar lat y lng).
  lat               double precision not null check (lat between 36.60 and 36.90),
  lng               double precision not null check (lng between -4.65 and -4.25),
  -- El dinero SIEMPRE en céntimos y como entero: en coma flotante 0.1 + 0.2 ≠ 0.3
  durum_price_cents integer check (durum_price_cents between 100 and 3000),
  is_halal          boolean not null default false,
  has_vegetarian    boolean not null default false,
  has_delivery      boolean not null default false,
  cover_photo_path  text,  -- ruta dentro del bucket 'venue-photos'
  is_published      boolean not null default false,
  created_at        timestamptz not null default now()
);
-- ⚠️ A propósito NO hay columna "score": la nota de un local no se puede
-- escribir, solo CALCULAR a partir de las reseñas (vista venue_scores en 0002).

create index venues_neighborhood_idx on public.venues (neighborhood_id);


-- ============ HORARIOS ============
-- Una fila por franja horaria. Así un local puede abrir 13:00-16:00 y 20:00-04:00.
create table public.opening_hours (
  id        bigint generated always as identity primary key,
  venue_id  uuid not null references public.venues (id) on delete cascade,
  weekday   smallint not null check (weekday between 1 and 7),  -- ISO 8601: 1 = lunes, 7 = domingo
  opens_at  time not null,
  -- Si closes_at <= opens_at, la franja termina al día SIGUIENTE (típico del kebab:
  -- "viernes de 20:00 a 04:00" se guarda con weekday = 5).
  closes_at time not null,
  unique (venue_id, weekday, opens_at)
);


-- ============ RESEÑAS ============
create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  venue_id   uuid not null references public.venues (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,

  -- Las 6 subnotas, enteros de 0 a 10
  meat       smallint not null check (meat      between 0 and 10),  -- carne
  bread      smallint not null check (bread     between 0 and 10),  -- pan
  sauces     smallint not null check (sauces    between 0 and 10),  -- salsas
  freshness  smallint not null check (freshness between 0 and 10),  -- verdura / frescura
  value      smallint not null check (value     between 0 and 10),  -- tamaño / precio
  night      smallint not null check (night     between 0 and 10),  -- horario nocturno

  comment    text not null check (char_length(comment) between 20 and 1000),

  -- KebabScore de la reseña. Es una COLUMNA GENERADA: la calcula PostgreSQL
  -- a partir de las subnotas. Aunque alguien manipule el formulario, no puede
  -- enviar un "TOTAL: 10" falso. Los pesos están duplicados en src/lib/puntuacion.ts
  -- para la vista previa del ticket: si los cambias aquí, cámbialos allí.
  score      numeric(3, 1) generated always as (
    round(
      (meat * 0.30 + sauces * 0.20 + bread * 0.15 + value * 0.15 + freshness * 0.10 + night * 0.10)::numeric,
      1
    )
  ) stored,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Máximo UNA reseña por usuario y local. Lo garantiza la base de datos,
  -- no el frontend: es imposible saltárselo.
  unique (venue_id, user_id)
);

create index reviews_venue_idx on public.reviews (venue_id);
create index reviews_user_created_idx on public.reviews (user_id, created_at desc);


-- ============ FOTOS DE RESEÑAS ============
create table public.review_photos (
  id           uuid primary key default gen_random_uuid(),
  review_id    uuid not null references public.reviews (id) on delete cascade,
  storage_path text not null unique,  -- '{user_id}/{review_id}/1.webp' dentro del bucket 'review-photos'
  alt_text     text check (char_length(alt_text) <= 150),  -- texto alternativo (accesibilidad)
  -- Guardar el tamaño permite reservar el hueco de la imagen y evitar saltos de layout (CLS)
  width        integer check (width > 0),
  height       integer check (height > 0),
  created_at   timestamptz not null default now()
);

create index review_photos_review_idx on public.review_photos (review_id);
