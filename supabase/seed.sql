-- =====================================================================
-- KebabScore · Datos de prueba (seed.sql)
-- ---------------------------------------------------------------------
-- Todos los locales son FICTICIOS (los barrios sí son reales de Málaga).
-- Ejecútalo en el SQL Editor de Supabase DESPUÉS de las 4 migraciones.
-- Se puede ejecutar varias veces sin duplicar datos (ON CONFLICT).
-- =====================================================================

-- 1. Barrios de Málaga
insert into public.neighborhoods (slug, name, district, city) values
  ('centro',              'Centro Histórico',    'Centro',               'Málaga'),
  ('el-perchel',          'El Perchel',          'Centro',               'Málaga'),
  ('la-trinidad',         'La Trinidad',         'Centro',               'Málaga'),
  ('soho',                'Soho',                'Centro',               'Málaga'),
  ('lagunillas',          'Lagunillas',          'Centro',               'Málaga'),
  ('el-palo',             'El Palo',             'Este',                 'Málaga'),
  ('pedregalejo',         'Pedregalejo',         'Este',                 'Málaga'),
  ('huelin',              'Huelin',              'Carretera de Cádiz',   'Málaga'),
  ('teatinos',            'Teatinos',            'Teatinos-Universidad', 'Málaga'),
  ('cruz-de-humilladero', 'Cruz de Humilladero', 'Cruz de Humilladero',  'Málaga'),
  ('ciudad-jardin',       'Ciudad Jardín',       'Ciudad Jardín',        'Málaga')
on conflict (slug) do update
  set name = excluded.name, district = excluded.district;

-- 2. Locales ficticios
with datos (slug, name, barrio_slug, address, lat, lng, price, halal, veg, delivery) as (
  values
    ('el-trompo-de-oro',       'El Trompo de Oro',       'centro',              'Calle del Trompo, 12',        36.7212, -4.4198, 650, true,  false, true),
    ('durum-atlas',            'Dürüm Atlas',            'el-perchel',          'Pasaje de la Lámina, 3',      36.7151, -4.4302, 600, true,  true,  false),
    ('kebab-rompeolas',        'Kebab Rompeolas',        'el-palo',             'Paseo del Asador, 33',        36.7209, -4.3612, 700, false, true,  false),
    ('doner-lunatico',         'Döner Lunático',         'soho',                'Calle de la Medianoche, 4',   36.7169, -4.4241, 750, false, false, false),
    ('asador-bosforo',         'Asador Bósforo',         'huelin',              'Calle Salsa de Yogur, 7',     36.7049, -4.4411, 600, true,  false, true),
    ('pita-pita-trinidad',     'Pita Pita Trinidad',     'la-trinidad',         'Plaza del Pan de Pita, 1',    36.7266, -4.4331, 500, true,  false, false),
    ('anatolia-expres',        'Anatolia Exprés',        'teatinos',            'Avenida del Dürüm, 21',       36.7301, -4.4706, 550, true,  true,  true),
    ('la-esquina-del-falafel', 'La Esquina del Falafel', 'lagunillas',          'Calle Falafel, 15',           36.7236, -4.4139, 550, false, true,  false),
    ('kebab-medianoche',       'Kebab Medianoche',       'cruz-de-humilladero', 'Calle Guindilla, 9',          36.7155, -4.4529, 450, true,  false, true),
    ('kebab-jardin',           'Kebab Jardín',           'ciudad-jardin',       'Callejón del Ajo, 2',         36.7411, -4.4247, 500, false, false, true),
    ('durumcito-pedregalejo',  'Dürümcito',              'pedregalejo',         'Calle del Comino, 18',        36.7203, -4.3791, 550, false, true,  false)
)
insert into public.venues (
  slug, name, neighborhood_id, address, lat, lng,
  durum_price_cents, is_halal, has_vegetarian, has_delivery, is_published
)
select
  d.slug, d.name, n.id, d.address, d.lat, d.lng,
  d.price, d.halal, d.veg, d.delivery, true
from datos d
join public.neighborhoods n on n.slug = d.barrio_slug
on conflict (slug) do update set
  name = excluded.name,
  address = excluded.address,
  lat = excluded.lat,
  lng = excluded.lng,
  durum_price_cents = excluded.durum_price_cents,
  is_halal = excluded.is_halal,
  has_vegetarian = excluded.has_vegetarian,
  has_delivery = excluded.has_delivery,
  is_published = true;

-- 3. Horarios (borramos antes los de estos locales para no duplicar si re-ejecutas)
delete from public.opening_hours
where venue_id in (select id from public.venues);

with franjas (venue_slug, dias, abre, cierra) as (
  values
    ('el-trompo-de-oro',       array[1,2,3,4],     '12:00'::time, '01:00'::time),
    ('el-trompo-de-oro',       array[5,6],         '12:00'::time, '04:00'::time),
    ('el-trompo-de-oro',       array[7],           '13:00'::time, '00:00'::time),
    ('durum-atlas',            array[1,2,3,4],     '13:00'::time, '00:30'::time),
    ('durum-atlas',            array[5,6],         '13:00'::time, '03:00'::time),
    ('kebab-rompeolas',        array[1,2,3,4,5,6,7], '13:00'::time, '16:00'::time),
    ('kebab-rompeolas',        array[1,2,3,4,7],   '20:00'::time, '01:00'::time),
    ('kebab-rompeolas',        array[5,6],         '20:00'::time, '03:00'::time),
    ('doner-lunatico',         array[3,4,5,6],     '21:00'::time, '05:00'::time),
    ('asador-bosforo',         array[1,2,3,4],     '12:30'::time, '00:00'::time),
    ('asador-bosforo',         array[5,6,7],       '12:30'::time, '02:00'::time),
    ('pita-pita-trinidad',     array[1,2,3,4,5,6,7], '18:00'::time, '02:00'::time),
    ('anatolia-expres',        array[1,2,3,4,5,6,7], '12:00'::time, '00:00'::time),
    ('la-esquina-del-falafel', array[2,3,4,5,6],   '13:00'::time, '16:30'::time),
    ('la-esquina-del-falafel', array[2,3,4,5,6],   '20:00'::time, '23:30'::time),
    ('kebab-medianoche',       array[1,2,3,4,5,6,7], '19:00'::time, '05:00'::time),
    ('kebab-jardin',           array[1,2,3,4,5,6], '12:00'::time, '23:00'::time),
    ('durumcito-pedregalejo',  array[4,5,6,7],     '20:00'::time, '02:00'::time)
)
insert into public.opening_hours (venue_id, weekday, opens_at, closes_at)
select v.id, unnest(f.dias), f.abre, f.cierra
from franjas f
join public.venues v on v.slug = f.venue_slug;
