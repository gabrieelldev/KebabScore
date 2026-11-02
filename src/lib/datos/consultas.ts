// =====================================================================
// Consultas de datos para las páginas (Server Components)
// ---------------------------------------------------------------------
// Si has configurado .env.local con Supabase → lee la base de datos real.
// Si no → usa los datos de demo.ts (con las fotos hotlinked de Stitch).
// =====================================================================

import 'server-only';
import { BARRIOS_DEMO, FOTOS_STITCH, LOCALES_DEMO } from './demo';
import type { Barrio, LocalResumen, MediasSubnotas } from './tipos';
import { notaBayesiana } from '../puntuacion';
import { crearClienteServidor, supabaseConfigurado } from '../supabase/server';

const SUBNOTAS_POR_DEFECTO: MediasSubnotas = {
  meat: 8.5,
  sauces: 8.4,
  bread: 8.2,
  value: 8.3,
  freshness: 7.9,
  night: 8.6,
};

function localesDesdeDemo(): LocalResumen[] {
  const barriosPorSlug = new Map(BARRIOS_DEMO.map((b) => [b.slug, b]));
  return LOCALES_DEMO.map((l) => {
    const barrio = barriosPorSlug.get(l.barrioSlug) ?? {
      slug: l.barrioSlug,
      nombre: l.barrioSlug,
    };
    return {
      id: `demo-${l.slug}`,
      slug: l.slug,
      nombre: l.nombre,
      barrio: { slug: barrio.slug, nombre: barrio.nombre },
      direccion: l.direccion,
      lat: l.lat,
      lng: l.lng,
      precioDurumCentimos: l.precioDurumCentimos,
      halal: l.halal,
      vegetariano: l.vegetariano,
      domicilio: l.domicilio,
      panCasero: l.panCasero,
      insignia: l.insignia,
      pesoGramos: l.pesoGramos,
      fotoPortada: l.fotoPortada,
      horario: l.horario,
      nota: l.notaDemo,
      numResenas: l.resenasDemo,
      notaRanking: Math.round(notaBayesiana(l.notaDemo, l.resenasDemo) * 100) / 100,
      subnotas: l.subnotas,
      tickets: l.tickets,
    };
  });
}

export type DatosInicio = {
  locales: LocalResumen[];
  barrios: Barrio[];
  esDemo: boolean;
};

/** Carga todo lo que necesita la portada y la carta luminosa en paralelo. */
export async function obtenerDatosInicio(): Promise<DatosInicio> {
  const supabase = crearClienteServidor();
  if (!supabase) {
    return { locales: localesDesdeDemo(), barrios: BARRIOS_DEMO, esDemo: true };
  }

  const [barriosRes, localesRes, horariosRes, notasRes] = await Promise.all([
    supabase.from('neighborhoods').select('id, slug, name, district').order('name'),
    supabase
      .from('venues')
      .select(
        'id, slug, name, neighborhood_id, address, lat, lng, durum_price_cents, is_halal, has_vegetarian, has_delivery, cover_photo_path',
      )
      .eq('is_published', true),
    supabase.from('opening_hours').select('venue_id, weekday, opens_at, closes_at'),
    supabase
      .from('venue_scores')
      .select(
        'venue_id, review_count, kebab_score, meat_avg, bread_avg, sauces_avg, freshness_avg, value_avg, night_avg, ranking_score',
      ),
  ]);

  if (barriosRes.error || localesRes.error || horariosRes.error || notasRes.error) {
    return { locales: localesDesdeDemo(), barrios: BARRIOS_DEMO, esDemo: true };
  }

  const barriosPorId = new Map(barriosRes.data.map((b) => [b.id, b]));
  const notasPorLocal = new Map(notasRes.data.map((n) => [n.venue_id, n]));
  const demosPorSlug = new Map(LOCALES_DEMO.map((d) => [d.slug, d]));

  const horariosPorLocal = new Map<string, LocalResumen['horario']>();
  for (const h of horariosRes.data) {
    const lista = horariosPorLocal.get(h.venue_id) ?? [];
    lista.push({ dia: h.weekday, abre: h.opens_at.slice(0, 5), cierra: h.closes_at.slice(0, 5) });
    horariosPorLocal.set(h.venue_id, lista);
  }

  const locales: LocalResumen[] = localesRes.data.map((v) => {
    const b = barriosPorId.get(v.neighborhood_id);
    const n = notasPorLocal.get(v.id);
    const demoRef = demosPorSlug.get(v.slug);
    const fotoPortada = v.cover_photo_path
      ? supabase.storage.from('venue-photos').getPublicUrl(v.cover_photo_path).data.publicUrl
      : (demoRef?.fotoPortada ?? FOTOS_STITCH.plato01);

    const subnotas: MediasSubnotas = n?.kebab_score
      ? {
          meat: Number(n.meat_avg ?? 8),
          sauces: Number(n.sauces_avg ?? 8),
          bread: Number(n.bread_avg ?? 8),
          value: Number(n.value_avg ?? 8),
          freshness: Number(n.freshness_avg ?? 8),
          night: Number(n.night_avg ?? 8),
        }
      : (demoRef?.subnotas ?? SUBNOTAS_POR_DEFECTO);

    return {
      id: v.id,
      slug: v.slug,
      nombre: v.name,
      barrio: { slug: b?.slug ?? 'centro', nombre: b?.name ?? 'Centro Histórico' },
      direccion: v.address,
      lat: v.lat,
      lng: v.lng,
      precioDurumCentimos: v.durum_price_cents,
      halal: v.is_halal,
      vegetariano: v.has_vegetarian,
      domicilio: v.has_delivery,
      panCasero: demoRef?.panCasero ?? true,
      insignia: demoRef?.insignia,
      pesoGramos: demoRef?.pesoGramos ?? 620,
      fotoPortada,
      horario: horariosPorLocal.get(v.id) ?? [],
      nota: n?.kebab_score !== null && n?.kebab_score !== undefined ? Number(n.kebab_score) : null,
      numResenas: n?.review_count ?? 0,
      notaRanking: n?.ranking_score ? Number(n.ranking_score) : notaBayesiana(null, 0),
      subnotas,
      tickets: demoRef?.tickets ?? [],
    };
  });

  const barrios: Barrio[] = barriosRes.data.map((b) => ({
    slug: b.slug,
    nombre: b.name,
    distrito: b.district,
  }));

  return { locales, barrios, esDemo: !supabaseConfigurado() };
}

/** Busca un local por su slug (para /kebab/[slug] y /kebab/[slug]/resenar). */
export async function obtenerLocalPorSlug(slug: string): Promise<LocalResumen | null> {
  const { locales } = await obtenerDatosInicio();
  return locales.find((l) => l.slug === slug) ?? null;
}
