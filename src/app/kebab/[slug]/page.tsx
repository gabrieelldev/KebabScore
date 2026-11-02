// =====================================================================
// Ficha de Local (/kebab/[slug]) · Diseño Stitch "El Trompo de Oro"
// ---------------------------------------------------------------------
// Reproduce la pantalla 2 de Stitch (ficha_local_el_trompo_de_oro):
//   1. Hero con imagen hotlinked del trompo girando, brasas flotantes y
//      placa colgante "Dürüm Mixto · 6,50 €".
//   2. Estado en neón verde, título Anton, dirección y 3 chapas metálicas
//      (HALAL CERTIFICADO, PAN CASERO AL MOMENTO, OPCIÓN FALAFEL).
//   3. Corte Anatómico del Dürüm (las 6 capas apiladas con sus notas).
//   4. Últimos Tickets Auditados en papel térmico + botón "Story 9:16".
//   5. Barra fija inferior para el pulgar: "DEJAR MI TICKET (VALORAR)".
//   6. Datos estructurados JSON-LD (schema.org Restaurant + Review) para SEO.
// =====================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BotonCheckinRapido24h } from '@/components/kebab/BotonCheckinRapido24h';
import { TicketsLocalCliente } from '@/components/kebab/TicketsLocalCliente';
import { Icono } from '@/components/ui/Icono';
import { obtenerLocalPorSlug } from '@/lib/datos/consultas';
import { FOTOS_STITCH, LOCALES_DEMO } from '@/lib/datos/demo';
import { formatearNota, formatearPrecio, infoNivelPicante } from '@/lib/puntuacion';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return LOCALES_DEMO.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const local = await obtenerLocalPorSlug(slug);
  if (!local) {
    return { title: '404: Este kebab se ha acabado' };
  }
  return {
    title: `${local.nombre} (${local.barrio.nombre}) · Nota ${formatearNota(local.nota)}`,
    description: `${local.insignia ?? 'Asador auditado'} · Dürüm desde ${formatearPrecio(local.precioDurumCentimos)} en ${local.direccion}, Málaga.`,
  };
}

export default async function PaginaFichaLocal({ params }: { params: Params }) {
  const { slug } = await params;
  const local = await obtenerLocalPorSlug(slug);

  if (!local) {
    notFound();
  }

  const infoPicante = infoNivelPicante(local.nota);
  const sub = local.subnotas;
  const fotoHero = local.fotoPortada ?? FOTOS_STITCH.trompoHero;
  const horaCierre = local.horario.find((f) => f.dia === 5)?.cierra ?? '04:30';

  // Capas anatómicas del dürüm en el orden exacto de la pantalla de Stitch
  const capasDurum = [
    {
      numero: '1. Pan / Lavash',
      icono: 'bakery_dining' as const,
      peso: '15%',
      descripcion: local.panCasero
        ? 'Pan tandoor recién pegado al horno, sellado crujiente sin grietas'
        : 'Pan lavash tostado en plancha doble, sellado firme sin fugas',
      nota: sub.bread,
      colorTexto: 'text-[#F2C14E]',
      colorIcono: 'text-[#F2C14E] border-[#F2C14E]/30 bg-[#1B1613]',
      colorBarra: 'from-[#F2C14E]/60 to-[#F2C14E]',
      colorBorde: 'border-[#44372E]/50 bg-[#241D18]/90',
    },
    {
      numero: '2. Salsas',
      icono: 'water_drop' as const,
      peso: '20%',
      descripcion: 'Yogur espeso con ajo real y salsa brava casera que pica de verdad',
      nota: sub.sauces,
      colorTexto: 'text-[#FFF6E8]',
      colorIcono: 'text-[#FFF6E8] border-[#FFF6E8]/30 bg-[#1B1613]',
      colorBarra: 'from-[#FFF6E8]/60 to-[#FFF6E8]',
      colorBorde: 'border-[#44372E]/50 bg-[#241D18]/90',
    },
    {
      numero: '3. Carne (El Trompo)',
      icono: 'kebab_dining' as const,
      peso: '30%',
      descripcion: 'Láminas finas con borde tostado al carbón, jugosa y cero grasa blanda',
      nota: sub.meat,
      colorTexto: 'text-[#FF7A1F]',
      colorIcono: 'text-[#FF7A1F] border-[#FF7A1F]/40 bg-[#1B1613]',
      colorBarra: 'from-[#FF7A1F] to-[#FF3B30] shadow-[0_0_8px_rgba(255,122,31,0.6)]',
      colorBorde: 'border-[#FF7A1F]/40 bg-[#2E251F] shadow-[0_0_15px_rgba(255,122,31,0.08)]',
    },
    {
      numero: '4. Verdura y Frescura',
      icono: 'eco' as const,
      peso: '10%',
      descripcion: 'Lombarda crujiente, tomate maduro y cebolla morada con zumaque',
      nota: sub.freshness,
      colorTexto: 'text-[#35C759]',
      colorIcono: 'text-[#35C759] border-[#35C759]/30 bg-[#1B1613]',
      colorBarra: 'from-[#35C759]/60 to-[#35C759]',
      colorBorde: 'border-[#44372E]/50 bg-[#241D18]/90',
    },
    {
      numero: '5. Tamaño / Precio',
      icono: 'scale' as const,
      peso: '15%',
      descripcion: `Calibre ${local.pesoGramos ?? 620}g pesados en báscula por ${formatearPrecio(local.precioDurumCentimos)} · No te quedas con hambre`,
      nota: sub.value,
      colorTexto: 'text-[#FF3B30]',
      colorIcono: 'text-[#FF3B30] border-[#FF3B30]/30 bg-[#1B1613]',
      colorBarra: 'from-[#FF3B30]/70 to-[#FF3B30]',
      colorBorde: 'border-[#44372E]/50 bg-[#241D18]/90',
    },
    {
      numero: '6. Horario Nocturno Golfo',
      icono: 'dark_mode' as const,
      peso: '10%',
      descripcion: `A las 03:45 AM el trompo sigue encendido y cierra a las ${horaCierre}`,
      nota: sub.night,
      colorTexto: 'text-[#C9B9A6]',
      colorIcono: 'text-[#FF7A1F] border-[#C9B9A6]/30 bg-[#1B1613]',
      colorBarra: 'from-[#C9B9A6]/50 to-[#F5EFE6]',
      colorBorde: 'border-[#44372E]/50 bg-[#241D18]/90',
    },
  ];

  // Datos estructurados Schema.org para buscadores
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: local.nombre,
    servesCuisine: 'Kebab, Döner, Dürüm',
    priceRange: '€',
    address: {
      '@type': 'PostalAddress',
      streetAddress: local.direccion,
      addressLocality: 'Málaga',
      addressCountry: 'ES',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: local.lat,
      longitude: local.lng,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: local.nota,
      bestRating: 10,
      worstRating: 0,
      reviewCount: local.numResenas,
    },
  };

  return (
    <div className="mx-auto max-w-md pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />

      {/* ============ 1. HERO SHOWCASE ============ */}
      <section className="relative h-[340px] w-full overflow-hidden">
        <img
          src={fotoHero}
          alt={`${local.nombre} en ${local.barrio.nombre}`}
          className="h-full w-full object-cover object-center scale-105 brightness-90 contrast-110"
        />

        {/* Brasas flotantes */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <span
            className="ember bottom-12 left-1/4 h-1.5 w-1.5"
            style={{ animationDelay: '0.2s' }}
          />
          <span
            className="ember bottom-20 left-1/2 h-2 w-2"
            style={{ animationDelay: '1.1s' }}
          />
          <span
            className="ember bottom-16 right-1/3 h-1 w-1"
            style={{ animationDelay: '2.3s' }}
          />
        </div>

        {/* Degradado oscuro de lectura */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#120F0D] via-[#120F0D]/55 to-transparent"
        />

        {/* Placa colgante de precio del Dürüm en estilo ticket */}
        <div className="absolute right-4 top-4 z-10 rotate-[2deg] rounded-sm bg-[#EFE6D5] px-3 py-1.5 text-[#181411] shadow-[0_8px_20px_rgba(0,0,0,0.65)] border-b-2 border-dashed border-[#181411]/30">
          <div className="mx-auto mb-1 h-1.5 w-1.5 rounded-full bg-[#120F0D]" />
          <span className="block text-center font-ticket text-[10px] uppercase tracking-widest text-[#5C4E41]">
            Dürüm Mixto
          </span>
          <span className="block font-ticket text-lg font-bold leading-none tracking-tight text-[#181411]">
            {formatearPrecio(local.precioDurumCentimos)}
          </span>
        </div>

        {/* Identidad del local sobre la imagen */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#35C759]/40 bg-[#120F0D]/90 px-2.5 py-1 font-ticket text-[11px] font-bold tracking-wider text-[#35C759] shadow-[0_0_12px_rgba(53,199,89,0.25)] backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#35C759]" />
              ABIERTO AHORA · CIERRA A LAS {horaCierre}
            </span>
          </div>

          <h1 className="rotulo-neon font-rotulo text-4xl uppercase leading-[0.95] tracking-wider text-[#F5EFE6]">
            {local.nombre}
          </h1>

          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[#C9B9A6]">
            <Icono nombre="location_on" className="h-4 w-4 text-[#FF7A1F]" />
            {local.direccion} ·{' '}
            <Link
              href={`/barrio/${local.barrio.slug}`}
              className="underline decoration-[#FF7A1F]/60 underline-offset-2 hover:text-[#FF7A1F]"
            >
              {local.barrio.nombre}
            </Link>
            , Málaga
          </p>

          {/* 3 chapas metálicas de escaparate */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {local.halal && (
              <span className="inline-flex items-center gap-1 rounded border border-[#44372E] bg-[#241D18]/90 px-2 py-0.5 font-ticket text-[10px] uppercase tracking-wider text-[#F5EFE6]">
                <Icono nombre="verified" className="h-3.5 w-3.5 text-[#35C759]" />
                HALAL CERTIFICADO
              </span>
            )}
            {local.panCasero && (
              <span className="inline-flex items-center gap-1 rounded border border-[#44372E] bg-[#241D18]/90 px-2 py-0.5 font-ticket text-[10px] uppercase tracking-wider text-[#F5EFE6]">
                <Icono
                  nombre="local_fire_department"
                  className="h-3.5 w-3.5 text-[#FF7A1F]"
                />
                PAN CASERO AL MOMENTO
              </span>
            )}
            {local.vegetariano && (
              <span className="inline-flex items-center gap-1 rounded border border-[#44372E] bg-[#241D18]/90 px-2 py-0.5 font-ticket text-[10px] uppercase tracking-wider text-[#F5EFE6]">
                <Icono nombre="eco" className="h-3.5 w-3.5 text-[#F2C14E]" />
                OPCIÓN FALAFEL
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ============ 1B. PASE GPS RÁPIDO 24H EN MOSTRADOR ============ */}
      <BotonCheckinRapido24h
        localSlug={local.slug}
        localNombre={local.nombre}
        lat={local.lat}
        lng={local.lng}
      />

      {/* ============ 2. KEBABSCORE EN CAPAS (CORTE ANATÓMICO) ============ */}
      <section aria-label="KebabScore en capas" className="mt-2 px-4">
        <div className="relative overflow-hidden rounded-xl border border-[#44372E]/60 bg-[#1B1613] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,246,232,0.08)]">
          {/* Resplandor superior tipo carta luminosa */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 left-1/2 h-24 w-3/4 -translate-x-1/2 rounded-full bg-[#FF7A1F]/15 blur-2xl"
          />

          {/* Cabecera del KebabScore */}
          <div className="flex items-center justify-between border-b border-[#44372E]/40 pb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-rotulo text-xl uppercase tracking-wider text-[#F5EFE6]">
                  KEBABSCORE
                </span>
                <span className="inline-flex items-center gap-0.5 rounded border border-[#FF3B30]/40 bg-[#FF3B30]/20 px-1.5 py-0.5 font-ticket text-[10px] font-bold uppercase text-[#FF3B30]">
                  <Icono nombre="local_fire_department" className="h-3 w-3" />
                  {infoPicante.etiqueta.toUpperCase()}
                </span>
              </div>
              <p className="mt-0.5 font-ticket text-[11px] text-[#C9B9A6]">
                Basado en {local.numResenas} tickets auditados
              </p>
            </div>

            {/* Nota gigante en neón */}
            <div className="flex items-baseline gap-1 rounded-lg border border-[#FF3B30]/50 bg-[#120F0D] px-3.5 py-2 shadow-[0_0_20px_rgba(255,59,48,0.25)]">
              <span className="font-ticket text-3xl font-bold tracking-tighter text-[#FF3B30]">
                {formatearNota(local.nota)}
              </span>
              <span className="font-ticket text-xs text-[#C9B9A6]">/10</span>
            </div>
          </div>

          {/* Barra horizontal de estratos del dürüm */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-ticket text-[10px] uppercase tracking-widest text-[#C9B9A6]">
                CORTE ANATÓMICO DEL DÜRÜM · 6 CAPAS REGISTRADAS
              </span>
              <span className="font-ticket text-[10px] text-[#FF7A1F]">100% PONDERADO</span>
            </div>

            <div className="mb-4 flex h-5 w-full overflow-hidden rounded-full border border-[#44372E] bg-[#120F0D] p-0.5 shadow-inner">
              <div
                style={{ width: '15%' }}
                className="flex h-full items-center justify-center rounded-l-full bg-[#F2C14E] font-ticket text-[8px] font-bold text-[#120F0D]"
              >
                PAN
              </div>
              <div
                style={{ width: '20%' }}
                className="flex h-full items-center justify-center bg-[#FFF6E8] font-ticket text-[8px] font-bold text-[#120F0D]"
              >
                SALSA
              </div>
              <div
                style={{ width: '30%' }}
                className="flex h-full items-center justify-center bg-[#FF7A1F] font-ticket text-[8px] font-bold text-[#120F0D]"
              >
                CARNE
              </div>
              <div
                style={{ width: '10%' }}
                className="flex h-full items-center justify-center bg-[#35C759] font-ticket text-[8px] font-bold text-[#120F0D]"
              >
                VERD.
              </div>
              <div
                style={{ width: '15%' }}
                className="flex h-full items-center justify-center bg-[#FF3B30] font-ticket text-[8px] font-bold text-[#F5EFE6]"
              >
                PRECIO
              </div>
              <div
                style={{ width: '10%' }}
                className="flex h-full items-center justify-center rounded-r-full bg-[#5C4E41] font-ticket text-[8px] font-bold text-[#F5EFE6]"
              >
                3AM
              </div>
            </div>

            {/* Pila de las 6 capas del dürüm */}
            <div className="space-y-2.5">
              {capasDurum.map((capa) => (
                <div
                  key={capa.numero}
                  className={`relative overflow-hidden rounded-lg border p-2.5 ${capa.colorBorde}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${capa.colorIcono}`}
                      >
                        <Icono nombre={capa.icono} className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-rotulo text-sm uppercase tracking-wider text-[#F5EFE6]">
                            {capa.numero}
                          </span>
                          <span className="rounded bg-[#120F0D] px-1.5 py-0.2 font-ticket text-[9px] text-[#C9B9A6]">
                            {capa.peso}
                          </span>
                        </div>
                        <p className="truncate text-[11px] text-[#C9B9A6]">
                          {capa.descripcion}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 font-ticket text-base font-bold ${capa.colorTexto}`}
                    >
                      {formatearNota(capa.nota)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#120F0D]">
                    <div
                      style={{ width: `${Math.round(capa.nota * 10)}%` }}
                      className={`h-full rounded-full bg-gradient-to-r ${capa.colorBarra}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ 3. ÚLTIMOS TICKETS AUDITADOS ============ */}
      <TicketsLocalCliente
        nombreLocal={local.nombre}
        barrioNombre={local.barrio.nombre}
        numResenasTotal={local.numResenas}
        tickets={local.tickets}
      />

      {/* ============ 4. BOTÓN FIJO AL ALCANCE DEL PULGAR ============ */}
      <div className="fixed bottom-16 left-0 right-0 z-40 mx-auto max-w-md bg-gradient-to-t from-[#120F0D] via-[#120F0D]/95 to-transparent px-4 pb-3 pt-4">
        <Link
          href={`/kebab/${local.slug}/resenar`}
          className="flex w-full items-center justify-between rounded-xl border border-[#FF7A1F]/40 bg-[#FF3B30] px-5 py-3.5 text-[#F5EFE6] shadow-[0_8px_28px_rgba(255,59,48,0.45)] transition-all hover:bg-[#FF4A3D] active:scale-[0.98]"
        >
          <span className="flex items-center gap-2.5">
            <Icono nombre="receipt_long" className="h-5 w-5" />
            <span className="font-rotulo text-xl uppercase tracking-wider">
              DEJAR MI TICKET (VALORAR)
            </span>
          </span>
          <span className="flex items-center gap-1 rounded bg-[#120F0D]/30 px-2 py-1 font-ticket text-xs font-bold">
            +150 XP
            <Icono nombre="arrow_forward" className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
