// =====================================================================
// CartaLuminosaCliente · Ranking "Carta Luminosa" interactivo (Stitch)
// ---------------------------------------------------------------------
// Reproduce la pantalla 4 de Stitch (carta_luminosa_rankings_kebabscore_m_laga):
//   - Cabecera retroiluminada "TABLÓN EN VIVO · CARTA LUMINOSA · TOP MÁLAGA"
//   - Filtro "Abierto Ahora", pastillas de barrio y selector de criterio
//     de ordenación ("KebabScore", "Mejor Salsa", "Carne Crujiente", "Gramo/€")
//   - Platos numerados (#01, #02, #03...) con vapor sutil (.kebab-steam),
//     etiqueta térmica de precio inclinada, barra de 6 estratos con brillo
//     (.strata-shimmer) y modal interactivo "Ver Ticket Detalle".
// =====================================================================

'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Icono } from '@/components/ui/Icono';
import { useCreador } from '@/lib/creador/contexto';
import { FOTOS_STITCH } from '@/lib/datos/demo';
import type { Barrio, LocalResumen } from '@/lib/datos/tipos';
import { formatearNota, formatearPrecio, infoNivelPicante } from '@/lib/puntuacion';

type CriterioOrden = 'kebabscore' | 'salsa' | 'carne' | 'precio';

type Props = {
  locales: LocalResumen[];
  barrios: Barrio[];
  barrioInicial?: string;
  tituloPersonalizado?: string;
};

const FOTOS_RESPALDO = [
  FOTOS_STITCH.plato01Oro,
  FOTOS_STITCH.plato02Plata,
  FOTOS_STITCH.plato03Bronce,
  FOTOS_STITCH.corteLavash,
  FOTOS_STITCH.platoCobre,
];

export function CartaLuminosaCliente({
  locales,
  barrios,
  barrioInicial = 'todos',
  tituloPersonalizado,
}: Props) {
  const { hidratado, locales: localesCreador } = useCreador();
  const catalogoLocales = hidratado ? localesCreador : locales;
  const [barrioActivo, setBarrioActivo] = useState<string>(barrioInicial);
  const [soloAbiertos, setSoloAbiertos] = useState<boolean>(false);
  const [orden, setOrden] = useState<CriterioOrden>('kebabscore');
  const [localModal, setLocalModal] = useState<LocalResumen | null>(null);

  const localesOrdenados = useMemo(() => {
    return catalogoLocales
      .filter((l) => {
        if (barrioActivo !== 'todos' && l.barrio.slug !== barrioActivo) return false;
        if (soloAbiertos) {
          const cierreViernes = l.horario.find((f) => f.dia === 5)?.cierra ?? '02:00';
          return cierreViernes >= '03:00';
        }
        return true;
      })
      .sort((a, b) => {
        if (orden === 'salsa') return b.subnotas.sauces - a.subnotas.sauces;
        if (orden === 'carne') return b.subnotas.meat - a.subnotas.meat;
        if (orden === 'precio') return b.subnotas.value - a.subnotas.value;
        return b.notaRanking - a.notaRanking;
      });
  }, [catalogoLocales, barrioActivo, soloAbiertos, orden]);

  const destacados = localesOrdenados.slice(0, 3);
  const resto = localesOrdenados.slice(3);

  return (
    <div className="mx-auto max-w-lg pb-12">
      {/* ============ 1. MARQUESINA SUPERIOR DE LA CARTA LUMINOSA ============ */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#241D18] to-[#120F0D] px-4 pb-4 pt-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#FF7A1F]/15 blur-3xl"
        />

        <div className="relative flex items-end justify-between gap-2">
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <Icono nombre="bolt" className="h-4 w-4 text-[#FF7A1F]" />
              <span className="font-ticket text-[10px] uppercase tracking-[0.2em] text-[#FF7A1F]">
                TABLÓN EN VIVO · RANKING BAYESIANO
              </span>
            </div>
            <h1 className="rotulo-neon font-rotulo text-3xl uppercase leading-none tracking-wide text-[#F5EFE6] sm:text-4xl">
              {tituloPersonalizado ?? 'CARTA LUMINOSA · TOP MÁLAGA'}
            </h1>
          </div>

          <div className="shrink-0 text-right font-ticket">
            <span className="block text-[10px] text-[#C9B9A6]">
              {localesOrdenados.length} LOCALES AUDITADOS
            </span>
            <span className="text-[11px] font-bold text-[#35C759]">
              ACTUALIZADO 04:12 AM
            </span>
          </div>
        </div>

        {/* Filtros deslizables: Abierto Ahora + Barrios */}
        <div className="no-scrollbar -mx-4 mt-4 flex items-center gap-2 overflow-x-auto px-4 pb-1">
          <button
            type="button"
            onClick={() => setSoloAbiertos((v) => !v)}
            aria-pressed={soloAbiertos}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 font-ticket text-xs font-bold transition-all active:scale-95 ${
              soloAbiertos
                ? 'border-[#35C759] bg-[#35C759] text-[#120F0D]'
                : 'border-[#35C759]/50 bg-[#35C759]/15 text-[#35C759] shadow-[0_0_12px_rgba(53,199,89,0.2)]'
            }`}
          >
            <span
              className={`h-2 w-2 animate-pulse rounded-full ${
                soloAbiertos ? 'bg-[#120F0D]' : 'bg-[#35C759]'
              }`}
            />
            Abierto Ahora (23)
          </button>

          <div className="mx-0.5 h-5 w-px shrink-0 bg-white/10" />

          <button
            type="button"
            onClick={() => setBarrioActivo('todos')}
            className={`shrink-0 rounded-full px-3.5 py-1.5 font-ticket text-xs font-bold transition-colors ${
              barrioActivo === 'todos'
                ? 'bg-[#FF7A1F] text-[#120F0D] shadow-[0_0_12px_rgba(255,122,31,0.35)]'
                : 'border border-white/10 bg-[#1B1613] text-[#C9B9A6] hover:text-[#F5EFE6]'
            }`}
          >
            Toda Málaga
          </button>

          {barrios.map((b) => {
            const activo = barrioActivo === b.slug;
            return (
              <button
                key={b.slug}
                type="button"
                onClick={() => setBarrioActivo(b.slug)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 font-ticket text-xs font-medium transition-colors ${
                  activo
                    ? 'bg-[#FF7A1F] font-bold text-[#120F0D] shadow-[0_0_12px_rgba(255,122,31,0.35)]'
                    : 'border border-white/10 bg-[#1B1613] text-[#C9B9A6] hover:text-[#F5EFE6]'
                }`}
              >
                {b.nombre}
              </button>
            );
          })}
        </div>

        {/* Barra de ordenación por subnota */}
        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5">
          <span className="font-ticket text-[10px] uppercase tracking-wider text-[#C9B9A6]">
            ORDENAR POR:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'kebabscore' as const, texto: 'KebabScore' },
              { id: 'salsa' as const, texto: 'Mejor Salsa' },
              { id: 'carne' as const, texto: 'Carne Crujiente' },
              { id: 'precio' as const, texto: 'Gramo/€' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setOrden(item.id)}
                className={`rounded px-2 py-0.5 font-ticket text-[11px] transition-colors ${
                  orden === item.id
                    ? 'border border-[#FF7A1F]/40 bg-[#FF7A1F]/20 font-bold text-[#FF7A1F]'
                    : 'text-[#C9B9A6] hover:text-[#F5EFE6]'
                }`}
              >
                {item.texto}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 2. PANELES RETROILUMINADOS DEL MENÚ ============ */}
      <div className="space-y-4 px-3 pt-4">
        {destacados.map((local, idx) => {
          const numeroPlato = `#0${idx + 1}`;
          const foto =
            local.fotoPortada ?? FOTOS_RESPALDO[idx % FOTOS_RESPALDO.length];
          const horaCierre = local.horario.find((f) => f.dia === 5)?.cierra ?? '05:00';
          const infoPicante = infoNivelPicante(local.nota);
          const sub = local.subnotas;

          const estiloNumero =
            idx === 0
              ? 'border-[#F2C14E] bg-[#120F0D]/90 text-[#F2C14E] shadow-[0_0_15px_rgba(242,193,78,0.4)]'
              : idx === 1
                ? 'border-[#C9B9A6] bg-[#120F0D]/90 text-[#F5EFE6]'
                : 'border-[#FF7A1F] bg-[#120F0D]/90 text-[#FF7A1F]';

          const estiloBorde =
            idx === 0
              ? 'border-2 border-[#FF7A1F]/70 shadow-[0_0_25px_rgba(255,122,31,0.18),inset_0_0_20px_rgba(255,122,31,0.08)]'
              : 'border border-white/15 shadow-[0_0_20px_rgba(0,0,0,0.5)]';

          return (
            <article
              key={local.id}
              className={`relative overflow-hidden rounded-xl bg-[#1B1613] transition-all duration-300 ${estiloBorde}`}
            >
              {/* Barra fluorescente superior en el #01 */}
              {idx === 0 && (
                <div className="h-1 w-full bg-gradient-to-r from-[#FF3B30] via-[#FF7A1F] to-[#F2C14E]" />
              )}

              <div className="relative h-44 w-full overflow-hidden bg-[#0E0B0A]">
                <img
                  src={foto}
                  alt={local.nombre}
                  className="h-full w-full object-cover object-center brightness-90 contrast-110"
                />
                <div className="kebab-steam absolute inset-0" />

                {/* Número de plato + estado de apertura */}
                <div className="absolute left-3 top-3 flex items-center gap-2">
                  <div
                    className={`flex h-10 w-12 items-center justify-center rounded-lg border-2 backdrop-blur-md ${estiloNumero}`}
                  >
                    <span className="font-rotulo text-2xl tracking-wider">
                      {numeroPlato}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 rounded bg-[#120F0D]/85 px-2 py-1 font-ticket text-[10px] font-bold text-[#35C759] backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#35C759]" />
                    ABIERTO · HASTA {horaCierre}
                  </span>
                </div>

                {/* Sello de nota */}
                <div className="absolute right-3 top-3 flex flex-col items-end">
                  <div
                    className={`flex items-center gap-1.5 rounded-lg border border-white/30 px-2.5 py-1 shadow-lg ${
                      (local.nota ?? 0) >= 8.5
                        ? 'bg-[#FF3B30] text-white'
                        : 'bg-[#FF7A1F] text-[#120F0D]'
                    }`}
                  >
                    <Icono nombre="local_fire_department" className="h-4 w-4" />
                    <span className="font-ticket text-lg font-bold leading-none">
                      {formatearNota(local.nota)}
                    </span>
                  </div>
                  <span className="mt-1 rounded bg-[#120F0D]/90 px-1.5 py-0.5 font-ticket text-[9px] font-bold uppercase tracking-wider text-[#FF7A1F]">
                    NIVEL: {infoPicante.etiqueta} ({local.numResenas} VOTOS)
                  </span>
                </div>

                {/* Identidad + precio térmico inclinado */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2">
                  <div>
                    <span className="inline-block rounded bg-[#FF7A1F] px-1.5 py-0.5 font-ticket text-[9px] font-bold uppercase tracking-wider text-[#120F0D]">
                      {local.insignia ?? 'Especialidad Nocturna'}
                    </span>
                    <h2 className="mt-0.5 font-rotulo text-2xl uppercase leading-none tracking-wide text-[#F5EFE6] drop-shadow">
                      {local.nombre}
                    </h2>
                    <p className="font-sans text-xs text-[#C9B9A6]">
                      {local.barrio.nombre} · {local.direccion}
                    </p>
                  </div>

                  <div className="shrink-0 rotate-[-2deg] rounded-sm border border-[#181411]/20 bg-[#EFE6D5] px-2.5 py-1 text-[#181411] shadow-md">
                    <span className="block font-ticket text-[8px] uppercase leading-none text-[#5C4E41]">
                      DÜRÜM MIXTO
                    </span>
                    <span className="font-ticket text-sm font-bold">
                      {formatearPrecio(local.precioDurumCentimos)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estratos de las 6 subnotas + botones */}
              <div className="p-3.5">
                <div className="mb-1.5 flex items-center justify-between font-ticket text-[10px] text-[#C9B9A6]">
                  <span>DESGLOSE DE CAPAS (KEBABSCORE)</span>
                  <span className="text-[#F5EFE6]">
                    CARNE <strong>{formatearNota(sub.meat)}</strong> · SALSA{' '}
                    <strong>{formatearNota(sub.sauces)}</strong> · PAN{' '}
                    <strong>{formatearNota(sub.bread)}</strong>
                  </span>
                </div>

                {/* Barra de 6 segmentos con brillo strata-shimmer */}
                <div className="strata-shimmer flex h-3 w-full overflow-hidden rounded-full border border-white/10 bg-[#120F0D] p-0.5">
                  <div
                    style={{ width: `${Math.round(sub.bread * 1.5)}%` }}
                    className="h-full bg-[#F2C14E]"
                    title={`Pan: ${formatearNota(sub.bread)}`}
                  />
                  <div
                    style={{ width: `${Math.round(sub.sauces * 2)}%` }}
                    className="h-full bg-[#FFF6E8]"
                    title={`Salsas: ${formatearNota(sub.sauces)}`}
                  />
                  <div
                    style={{ width: `${Math.round(sub.meat * 3)}%` }}
                    className="h-full bg-[#FF7A1F]"
                    title={`Carne: ${formatearNota(sub.meat)}`}
                  />
                  <div
                    style={{ width: `${Math.round(sub.freshness)}%` }}
                    className="h-full bg-[#35C759]"
                    title={`Verdura: ${formatearNota(sub.freshness)}`}
                  />
                  <div
                    style={{ width: `${Math.round(sub.value * 1.5)}%` }}
                    className="h-full bg-[#FF3B30]"
                    title={`Tamaño/Precio: ${formatearNota(sub.value)}`}
                  />
                  <div
                    style={{ width: `${Math.round(sub.night)}%` }}
                    className="h-full flex-1 bg-[#9E8C7A]"
                    title={`Horario 3 AM: ${formatearNota(sub.night)}`}
                  />
                </div>

                {/* Pie de tarjeta con acciones */}
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-2.5">
                  <button
                    type="button"
                    onClick={() => setLocalModal(local)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#241D18] px-3 py-1.5 font-ticket text-xs font-bold text-[#EFE6D5] transition-colors hover:border-[#FF7A1F]"
                  >
                    <Icono nombre="receipt_long" className="h-4 w-4 text-[#FF7A1F]" />
                    Ver Ticket Detalle
                  </button>

                  <Link
                    href={`/kebab/${local.slug}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#FF7A1F] px-3.5 py-1.5 font-rotulo text-sm uppercase tracking-wider text-[#120F0D] transition-colors hover:bg-[#FF3B30] hover:text-[#F5EFE6]"
                  >
                    Inspeccionar
                    <Icono nombre="arrow_forward" className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}

        {/* Filas compactas del tablero para los puestos #04 en adelante */}
        {resto.length > 0 && (
          <div className="space-y-2.5 pt-1">
            {resto.map((local, idx) => {
              const puesto = `#0${idx + 4}`;
              const foto =
                local.fotoPortada ??
                FOTOS_RESPALDO[(idx + 3) % FOTOS_RESPALDO.length];
              return (
                <article
                  key={local.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#1B1613] p-3 transition-colors hover:border-[#FF7A1F]/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/15">
                      <img
                        src={foto}
                        alt={local.nombre}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute left-1 top-1 rounded bg-[#120F0D]/90 px-1.5 py-0.5 font-rotulo text-xs text-[#F2C14E]">
                        {puesto}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <Link
                        href={`/kebab/${local.slug}`}
                        className="block truncate font-rotulo text-lg uppercase tracking-wide text-[#F5EFE6] hover:text-[#FF7A1F]"
                      >
                        {local.nombre}
                      </Link>
                      <p className="truncate text-xs text-[#C9B9A6]">
                        {local.barrio.nombre} · {local.direccion}
                      </p>
                      <div className="mt-1 flex items-center gap-2 font-ticket text-[10px]">
                        <span className="rounded bg-[#EFE6D5] px-1.5 py-0.5 font-bold text-[#181411]">
                          {formatearPrecio(local.precioDurumCentimos)}
                        </span>
                        <span className="text-[#C9B9A6]">
                          {local.numResenas} tickets
                        </span>
                        <button
                          type="button"
                          onClick={() => setLocalModal(local)}
                          className="text-[#FF7A1F] underline-offset-2 hover:underline"
                        >
                          Ticket
                        </button>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/kebab/${local.slug}`}
                    className="shrink-0 rounded-lg border border-[#FF7A1F]/40 bg-[#120F0D] px-2.5 py-1.5 text-center"
                  >
                    <span className="block font-ticket text-lg font-bold leading-none text-[#FF7A1F]">
                      {formatearNota(local.nota)}
                    </span>
                    <span className="font-ticket text-[9px] uppercase text-[#C9B9A6]">
                      {infoNivelPicante(local.nota).etiqueta}
                    </span>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* ============ 3. LEYENDA DE LA ESCALA DE PICANTE ============ */}
      <section aria-label="Guía de picante y temperatura" className="mt-6 px-3">
        <div className="rounded-xl border border-white/10 bg-[#1B1613] p-4">
          <h2 className="font-ticket text-[11px] font-bold uppercase tracking-widest text-[#C9B9A6]">
            GUÍA DE PICANTE & TEMPERATURA (ESCALA KEBABSCORE)
          </h2>
          <div className="mt-2.5 grid grid-cols-2 gap-2 font-ticket text-xs sm:grid-cols-4">
            <div className="rounded-lg border border-[#FF3B30]/30 bg-[#120F0D] p-2">
              <span className="block font-bold text-[#FF3B30]">8,5 – 10,0 · FUEGO</span>
              <span className="text-[10px] text-[#C9B9A6]">Imprescindible</span>
            </div>
            <div className="rounded-lg border border-[#FF7A1F]/30 bg-[#120F0D] p-2">
              <span className="block font-bold text-[#FF7A1F]">7,0 – 8,4 · PICANTE</span>
              <span className="text-[10px] text-[#C9B9A6]">Acierto seguro</span>
            </div>
            <div className="rounded-lg border border-[#F2C14E]/30 bg-[#120F0D] p-2">
              <span className="block font-bold text-[#F2C14E]">5,0 – 6,9 · SUAVE</span>
              <span className="text-[10px] text-[#C9B9A6]">Te salva la noche</span>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#120F0D] p-2">
              <span className="block font-bold text-[#9E8C7A]">0,0 – 4,9 · DUDOSO</span>
              <span className="text-[10px] text-[#C9B9A6]">Solo emergencias</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MODAL DE TICKET DETALLE DE AUDITORÍA ============ */}
      {localModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Ticket de auditoría de ${localModal.nombre}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-sm rotate-[-0.5deg] rounded-sm bg-[#EFE6D5] p-5 font-ticket text-[#181411] shadow-2xl">
            <div
              aria-hidden="true"
              className="serrated-edge absolute -top-2 left-0 right-0 h-2.5"
            />

            <div className="flex items-start justify-between border-b border-dashed border-[#5C4E41]/50 pb-2.5">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#5C4E41]">
                  *** DESGLOSE CARTA LUMINOSA ***
                </span>
                <h3 className="font-rotulo text-2xl uppercase leading-none text-[#181411]">
                  {localModal.nombre}
                </h3>
                <p className="text-[10px] text-[#5C4E41]">
                  {localModal.barrio.nombre} · {localModal.direccion}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLocalModal(null)}
                aria-label="Cerrar ticket"
                className="rounded bg-[#181411] p-1 text-[#EFE6D5]"
              >
                <Icono nombre="close" className="h-4 w-4" />
              </button>
            </div>

            <div className="my-3 space-y-1.5 border-b border-dashed border-[#5C4E41]/50 pb-3 text-xs">
              <div className="flex justify-between">
                <span>01. CARNE & TUESTE (30%)</span>
                <strong>{formatearNota(localModal.subnotas.meat)}</strong>
              </div>
              <div className="flex justify-between">
                <span>02. SALSAS CASERAS (20%)</span>
                <strong>{formatearNota(localModal.subnotas.sauces)}</strong>
              </div>
              <div className="flex justify-between">
                <span>03. PAN / LAVASH (15%)</span>
                <strong>{formatearNota(localModal.subnotas.bread)}</strong>
              </div>
              <div className="flex justify-between">
                <span>04. TAMAÑO / PRECIO (15%)</span>
                <strong>{formatearNota(localModal.subnotas.value)}</strong>
              </div>
              <div className="flex justify-between">
                <span>05. VERDURA FRESCA (10%)</span>
                <strong>{formatearNota(localModal.subnotas.freshness)}</strong>
              </div>
              <div className="flex justify-between">
                <span>06. HORARIO GOLFO (10%)</span>
                <strong>{formatearNota(localModal.subnotas.night)}</strong>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="block text-[10px] text-[#5C4E41]">
                  MEDIA PONDERADA ({localModal.numResenas} TICKETS)
                </span>
                <span className="text-lg font-bold text-[#181411]">
                  TOTAL: {formatearNota(localModal.nota)} / 10
                </span>
              </div>
              <Link
                href={`/kebab/${localModal.slug}`}
                className="rounded bg-[#FF3B30] px-3.5 py-2 font-rotulo text-sm uppercase tracking-wider text-white"
              >
                Abrir ficha →
              </Link>
            </div>

            <div
              aria-hidden="true"
              className="serrated-edge absolute -bottom-2 left-0 right-0 h-2.5 rotate-180"
            />
          </div>
        </div>
      )}
    </div>
  );
}
