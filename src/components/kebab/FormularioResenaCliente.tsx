// =====================================================================
// FormularioResenaCliente · Los 6 Sliders de Salsa + Ticket en Vivo
// ---------------------------------------------------------------------
// Reproduce la pantalla 3 de Stitch (formulario_de_rese_a_dejar_ticket):
//   - Selector de plato ("Dürüm Mixto", "Dürüm Pollo", etc.)
//   - Los 6 Sliders de Salsa interactivos con gota inclinada (.slider-salsa)
//   - Previsualización en vivo del ticket térmico que recalcula al vuelo
//     la media ponderada (30% carne, 20% salsas, 15% pan, 15% precio,
//     10% verdura, 10% nocturno) y anima la impresión (.receipt-feed-anim)
//   - Subida/previsualización de hasta 3 fotos y etiquetas rápidas
// =====================================================================

'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Icono } from '@/components/ui/Icono';
import { FOTOS_STITCH } from '@/lib/datos/demo';
import type { LocalResumen, MediasSubnotas } from '@/lib/datos/tipos';
import {
  calcularKebabScore,
  formatearNota,
  formatearPrecio,
  infoNivelPicante,
} from '@/lib/puntuacion';

type Props = {
  local: LocalResumen;
};

const VARIANTES_PLATO = [
  'Dürüm Mixto',
  'Dürüm Pollo',
  'Dürüm Ternera',
  'Falafel / Veggie',
  'Plato Kebab',
];

const FOTOS_DEMO_ADICIONALES = [
  FOTOS_STITCH.durumMano,
  FOTOS_STITCH.platoCobre,
  FOTOS_STITCH.corteLavash,
];

type ConfigSlider = {
  clave: keyof MediasSubnotas;
  titulo: string;
  subtitulo: string;
  pesoTexto: string;
  etiquetaTicket: string;
  icono: 'local_fire_department' | 'water_drop' | 'bakery_dining' | 'scale' | 'eco' | 'dark_mode';
  colorAcento: string;
  colorTexto: string;
  gradiente: string;
  describirValor: (v: number) => string;
};

const CONFIG_SLIDERS: ConfigSlider[] = [
  {
    clave: 'meat',
    titulo: '1. Carne y Tueste',
    subtitulo: 'Sabor, jugosidad y corte directo del trompo',
    pesoTexto: 'PESO 30%',
    etiquetaTicket: '01 CARNE & TUESTE (30%)',
    icono: 'local_fire_department',
    colorAcento: '#FF7A1F',
    colorTexto: 'text-[#FF7A1F]',
    gradiente: 'linear-gradient(90deg, #44372E 0%, #FF7A1F 60%, #FF3B30 100%)',
    describirValor: (v) =>
      v >= 9
        ? 'Crujiente al corte'
        : v >= 7.5
          ? 'Bien asada y jugosa'
          : v >= 5
            ? 'Cumple sin alardes'
            : 'Seca o recalentada',
  },
  {
    clave: 'sauces',
    titulo: '2. Salsas (Yogur y Picante)',
    subtitulo: 'Cremosidad, ajo real, picor y reparto hasta el final',
    pesoTexto: 'PESO 20%',
    etiquetaTicket: '02 SALSAS CASERAS (20%)',
    icono: 'water_drop',
    colorAcento: '#FFF6E8',
    colorTexto: 'text-[#FFF6E8]',
    gradiente: 'linear-gradient(90deg, #44372E 0%, #C9B9A6 40%, #FFF6E8 100%)',
    describirValor: (v) =>
      v >= 9
        ? 'Chorreo bendito'
        : v >= 7.5
          ? 'Bien repartida'
          : v >= 5
            ? 'Algo justa al final'
            : 'Bote industrial',
  },
  {
    clave: 'bread',
    titulo: '3. Pan / Lavash Tostado',
    subtitulo: 'Sellado en plancha, elasticidad y resistencia sin romperse',
    pesoTexto: 'PESO 15%',
    etiquetaTicket: '03 PAN / LAVASH (15%)',
    icono: 'bakery_dining',
    colorAcento: '#F2C14E',
    colorTexto: 'text-[#F2C14E]',
    gradiente: 'linear-gradient(90deg, #44372E 0%, #D99B26 50%, #F2C14E 100%)',
    describirValor: (v) =>
      v >= 8.5
        ? 'Sellado al carbón'
        : v >= 7
          ? 'Aguanta sin fugas'
          : v >= 5
            ? 'Un poco blando'
            : 'Se rompe a mitad',
  },
  {
    clave: 'value',
    titulo: '4. Tamaño / Precio',
    subtitulo: 'Calibre del rollo, peso en mano y honestidad por euro',
    pesoTexto: 'PESO 15%',
    etiquetaTicket: '04 TAMAÑO / PRECIO (15%)',
    icono: 'scale',
    colorAcento: '#FF3B30',
    colorTexto: 'text-[#FF3B30]',
    gradiente: 'linear-gradient(90deg, #44372E 0%, #FF7A1F 50%, #FF3B30 100%)',
    describirValor: (v) =>
      v >= 8.5
        ? 'No te quedas con hambre'
        : v >= 7
          ? 'Buen calibre por su precio'
          : v >= 5
            ? 'Tamaño estándar'
            : 'Escaso para lo que cuesta',
  },
  {
    clave: 'freshness',
    titulo: '5. Verdura y Frescura',
    subtitulo: 'Crujiente de lechuga, lombarda, cebolla morada y tomate',
    pesoTexto: 'PESO 10%',
    etiquetaTicket: '05 VERDURA FRESCA (10%)',
    icono: 'eco',
    colorAcento: '#35C759',
    colorTexto: 'text-[#35C759]',
    gradiente: 'linear-gradient(90deg, #44372E 0%, #248A3D 50%, #35C759 100%)',
    describirValor: (v) =>
      v >= 8.5
        ? 'Cruje al morder'
        : v >= 7
          ? 'Fresca del día'
          : v >= 5
            ? 'Correcta'
            : 'Mustia o aguada',
  },
  {
    clave: 'night',
    titulo: '6. Horario Nocturno Golfo',
    subtitulo: 'Servicio de madrugada, rapidez en barra y trato a las 3 AM',
    pesoTexto: 'PESO 10%',
    etiquetaTicket: '06 HORARIO GOLFO (10%)',
    icono: 'dark_mode',
    colorAcento: '#FF7A1F',
    colorTexto: 'text-[#FF7A1F]',
    gradiente: 'linear-gradient(90deg, #44372E 0%, #FF7A1F 60%, #F2C14E 100%)',
    describirValor: (v) =>
      v >= 9
        ? 'Salvavidas 4 AM'
        : v >= 7.5
          ? 'Rápido de madrugada'
          : v >= 5
            ? 'Cierra temprano'
            : 'Solo horario diurno',
  },
];

export function FormularioResenaCliente({ local }: Props) {
  const [platoActivo, setPlatoActivo] = useState<string>('Dürüm Mixto');
  const [subnotas, setSubnotas] = useState<MediasSubnotas>({
    meat: 9.2,
    sauces: 9.5,
    bread: 8.6,
    value: 8.8,
    freshness: 7.9,
    night: 9.4,
  });
  const [comentario, setComentario] = useState(
    'Pan recién tostado en plancha que no se rompe ni al final. La salsa blanca casera con toque de eneldo es de otro planeta y a las 3:40 AM el trompo seguía echando chispas.',
  );
  const [etiquetasActivas, setEtiquetasActivas] = useState<string[]>([
    'Picante Bravo',
    'Bien Enrollado',
  ]);
  const [fotos, setFotos] = useState<string[]>([FOTOS_STITCH.corteAluminio]);
  const [animarTicket, setAnimarTicket] = useState(false);
  const [publicado, setPublicado] = useState(false);

  const notaTotal = useMemo(() => calcularKebabScore(subnotas), [subnotas]);
  const infoPicante = useMemo(() => infoNivelPicante(notaTotal), [notaTotal]);

  function cambiarSubnota(clave: keyof MediasSubnotas, valor: number) {
    setSubnotas((prev) => ({ ...prev, [clave]: valor }));
    setAnimarTicket(false);
    window.requestAnimationFrame(() => setAnimarTicket(true));
  }

  function alternarEtiqueta(etiqueta: string) {
    setEtiquetasActivas((prev) =>
      prev.includes(etiqueta) ? prev.filter((e) => e !== etiqueta) : [...prev, etiqueta],
    );
  }

  function anadirFotoDemo() {
    if (fotos.length >= 3) return;
    const siguiente =
      FOTOS_DEMO_ADICIONALES.find((f) => !fotos.includes(f)) ?? FOTOS_STITCH.durumMano;
    setFotos((prev) => [...prev, siguiente]);
  }

  function quitarFoto(indice: number) {
    setFotos((prev) => prev.filter((_, idx) => idx !== indice));
  }

  function manejarPublicacion(e: React.FormEvent) {
    e.preventDefault();
    setPublicado(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <form onSubmit={manejarPublicacion} className="mx-auto max-w-lg px-4 pb-36 pt-5">
      {/* Banner de confirmación tras publicar */}
      {publicado && (
        <div
          role="status"
          className="mb-6 rounded-xl border-2 border-[#35C759] bg-[#1B1613] p-4 shadow-[0_0_30px_rgba(53,199,89,0.25)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 font-ticket text-xs font-bold uppercase text-[#35C759]">
                <Icono nombre="check_circle" className="h-4 w-4" />
                ¡TICKET #402-MLG IMPRESO Y AUDITADO!
              </span>
              <h2 className="mt-1 font-rotulo text-2xl uppercase tracking-wide text-[#F5EFE6]">
                Has sumado +150 XP Nocturnos
              </h2>
              <p className="mt-1 text-xs text-[#C9B9A6]">
                Tu valoración de <strong>{formatearNota(notaTotal)}/10</strong> para{' '}
                <strong>{local.nombre}</strong> ya cuenta en la Carta Luminosa de Málaga.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/kebab/${local.slug}`}
              className="rounded-lg bg-[#35C759] px-3.5 py-2 font-rotulo text-xs uppercase tracking-wider text-[#120F0D]"
            >
              Ver ficha del local →
            </Link>
            <Link
              href="/misiones"
              className="rounded-lg border border-white/15 bg-[#241D18] px-3.5 py-2 font-ticket text-xs font-bold text-[#F5EFE6]"
            >
              Ver mis misiones (+150 XP)
            </Link>
          </div>
        </div>
      )}

      {/* ============ 1. CONTEXTO DEL LOCAL SELECCIONADO ============ */}
      <section className="mb-6">
        <div className="relative overflow-hidden rounded-xl border border-[#44372E]/50 bg-[#1B1613] p-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[#FF7A1F]/10 blur-2xl"
          />
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#35C759]" />
                <span className="font-ticket text-[11px] uppercase tracking-widest text-[#35C759]">
                  Local Seleccionado · {local.barrio.nombre}
                </span>
              </div>
              <h1 className="font-rotulo text-2xl uppercase leading-tight tracking-wide text-[#F5EFE6]">
                {local.nombre}
              </h1>
              <p className="mt-0.5 text-xs text-[#C9B9A6]">
                {local.direccion} · Dürüm {formatearPrecio(local.precioDurumCentimos)}
              </p>
            </div>
            <div className="shrink-0 rounded-lg border border-[#44372E]/60 bg-[#241D18] px-2.5 py-1.5 text-right">
              <span className="block font-ticket text-[10px] uppercase text-[#C9B9A6]">
                Regla
              </span>
              <span className="font-ticket text-xs font-bold text-[#FF7A1F]">
                1 reseña máx / usuario
              </span>
            </div>
          </div>

          {/* Selector de variante de plato */}
          <div className="mt-4 border-t border-[#44372E]/40 pt-3">
            <span className="mb-2 block font-ticket text-[11px] uppercase tracking-wider text-[#C9B9A6]">
              ¿Qué pediste en barra?
            </span>
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {VARIANTES_PLATO.map((plato) => {
                const activo = platoActivo === plato;
                return (
                  <button
                    key={plato}
                    type="button"
                    onClick={() => setPlatoActivo(plato)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 font-ticket text-xs transition-colors ${
                      activo
                        ? 'bg-[#FF7A1F] font-bold text-[#120F0D] shadow-[0_0_12px_rgba(255,122,31,0.4)]'
                        : 'border border-[#44372E]/60 bg-[#241D18] text-[#C9B9A6] hover:text-[#F5EFE6]'
                    }`}
                  >
                    {plato}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============ 2. CABECERA DE AUDITORÍA ============ */}
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="rotulo-neon font-rotulo text-3xl uppercase leading-none tracking-wide text-[#F5EFE6]">
            AUDITAR DÜRÜM · DEJAR TICKET
          </h2>
          <p className="mt-1 text-xs text-[#C9B9A6]">
            Desliza los chorros de salsa para puntuar las 6 capas oficiales.
          </p>
        </div>
        <div className="text-right">
          <span className="font-ticket text-[10px] uppercase tracking-widest text-[#C9B9A6]">
            Escala
          </span>
          <div className="font-ticket text-xs font-bold text-[#FF7A1F]">0,0 — 10,0</div>
        </div>
      </div>

      {/* ============ 3. LOS 6 SLIDERS DE SALSA ============ */}
      <section aria-label="Los 6 filtros del trompo" className="mb-8 space-y-3.5">
        {CONFIG_SLIDERS.map((cfg) => {
          const valor = subnotas[cfg.clave];
          return (
            <div
              key={cfg.clave}
              className="rounded-xl border border-[#44372E]/40 bg-[#1B1613] p-4 transition-colors focus-within:border-[#FF7A1F]"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#241D18]">
                    <Icono
                      nombre={cfg.icono}
                      className={`h-5 w-5 ${cfg.colorTexto}`}
                    />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        htmlFor={`slider-${cfg.clave}`}
                        className="font-rotulo text-lg uppercase tracking-wide text-[#F5EFE6]"
                      >
                        {cfg.titulo}
                      </label>
                      <span className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-ticket text-[10px] font-bold text-[#FF7A1F]">
                        {cfg.pesoTexto}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#C9B9A6]">{cfg.subtitulo}</p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <output
                    htmlFor={`slider-${cfg.clave}`}
                    className={`font-ticket text-2xl font-bold leading-none ${cfg.colorTexto}`}
                  >
                    {formatearNota(valor)}
                  </output>
                  <span className="mt-0.5 block font-ticket text-[10px] text-[#35C759]">
                    {cfg.describirValor(valor)}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <input
                  id={`slider-${cfg.clave}`}
                  type="range"
                  min={0}
                  max={10}
                  step={0.1}
                  value={valor}
                  onChange={(e) =>
                    cambiarSubnota(cfg.clave, Number.parseFloat(e.target.value))
                  }
                  style={{ background: cfg.gradiente }}
                  className="slider-salsa w-full"
                />
                <div className="mt-1.5 flex justify-between font-ticket text-[10px] text-[#C9B9A6]/60">
                  <span>0,0 Flojo</span>
                  <span>5,0 Cumple</span>
                  <span>10,0 Leyenda</span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ============ 4. PREVISUALIZACIÓN EN VIVO DEL TICKET TÉRMICO ============ */}
      <section aria-label="Previsualización en vivo del ticket" className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icono nombre="receipt_long" className="h-5 w-5 text-[#FF7A1F]" />
            <h3 className="font-rotulo text-xl uppercase tracking-wide text-[#F5EFE6]">
              Previsualización en Vivo
            </h3>
          </div>
          <span className="flex items-center gap-1.5 font-ticket text-[11px] text-[#35C759]">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-[#35C759]" />
            Impresora Térmica Lista
          </span>
        </div>

        {/* Ranura de salida de la impresora térmica */}
        <div className="mx-auto h-3 w-[96%] rounded-t-full border-x border-t border-[#44372E] bg-[#090706] shadow-inner" />

        {/* Papel térmico con borde dentado e inclinación sutil */}
        <div className="px-2">
          <div
            className={`relative mx-auto - rotate-[0.8deg] bg-[#EFE6D5] px-5 py-5 font-ticket text-[#181411] shadow-[0_18px_40px_rgba(0,0,0,0.65)] transition-transform duration-300 ${
              animarTicket ? 'receipt-feed-anim' : ''
            }`}
          >
            {/* Sello de agua */}
            <div className="pointer-events-none absolute right-4 top-14 rotate-12 select-none border-2 border-[#FF3B30]/20 px-2 py-0.5 font-rotulo text-xs uppercase tracking-widest text-[#FF3B30]/25">
              VERIFICADO 3 AM
            </div>

            <div className="border-b border-dashed border-[#5C4E41]/60 pb-3 text-center">
              <p className="text-[11px] font-bold tracking-widest">
                *** KEBABSCORE AUDITORIA TICKET ***
              </p>
              <p className="mt-0.5 text-sm font-bold uppercase">{local.nombre}</p>
              <p className="text-[10px] text-[#5C4E41]">
                {local.direccion.toUpperCase()} · MÁLAGA
              </p>
              <div className="mt-2 flex justify-between text-[10px] text-[#5C4E41]">
                <span>TICKET #402-MLG</span>
                <span>PLATO: {platoActivo.toUpperCase()}</span>
              </div>
            </div>

            {/* Desglose punteado en tiempo real */}
            <div className="space-y-1.5 border-b border-dashed border-[#5C4E41]/60 py-3 text-xs">
              {CONFIG_SLIDERS.map((cfg) => (
                <div key={cfg.clave} className="flex items-baseline justify-between">
                  <span className="font-semibold">{cfg.etiquetaTicket}</span>
                  <span className="mx-1.5 flex-1 border-b border-dotted border-[#5C4E41]/50" />
                  <span className="font-bold">{formatearNota(subnotas[cfg.clave])}</span>
                </div>
              ))}
            </div>

            {/* Total ponderado en vivo */}
            <div className="flex items-center justify-between border-b-2 border-[#181411] py-3">
              <div>
                <span className="block text-xs font-bold uppercase">
                  TOTAL AUDITADO (PONDERADO)
                </span>
                <span className="text-[10px] text-[#5C4E41]">
                  Escala de Picante:{' '}
                  <strong className="uppercase text-[#FF3B30]">
                    {infoPicante.etiqueta}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded bg-[#181411] px-2.5 py-1 text-[#EFE6D5]">
                <span className="text-xl font-bold tracking-tight text-[#FF7A1F]">
                  {formatearNota(notaTotal)}
                </span>
                <span className="text-[10px] text-[#C9B9A6]">/ 10</span>
              </div>
            </div>

            {/* Extracto del comentario en vivo */}
            <div className="pt-2.5 text-[11px] leading-snug text-[#5C4E41]">
              <span className="font-bold uppercase text-[#181411]">NOTA DE BARRA: </span>
              <span className="italic">
                &ldquo;{comentario || 'Sin comentario todavía...'}&rdquo;
              </span>
            </div>

            {/* Código de barras */}
            <div className="mt-3 flex flex-col items-center pt-2">
              <div
                aria-hidden="true"
                className="h-6 w-48 opacity-80"
                style={{
                  background:
                    'repeating-linear-gradient(90deg, #181411 0px, #181411 2px, transparent 2px, transparent 4px, #181411 4px, #181411 5px, transparent 5px, transparent 8px, #181411 8px, #181411 11px, transparent 11px, transparent 13px)',
                }}
              />
              <span className="mt-1 text-[9px] tracking-[0.25em] text-[#5C4E41]">
                KS-29004-MLG-0342AM
              </span>
            </div>

            {/* Dientes inferiores */}
            <div
              aria-hidden="true"
              className="serrated-edge absolute -bottom-2 left-0 right-0 h-2.5 rotate-180"
            />
          </div>
        </div>
      </section>

      {/* ============ 5. EVIDENCIA VISUAL (FOTOS) + VEREDICTO ============ */}
      <section aria-label="Fotos y veredicto escrito" className="space-y-5">
        {/* Subida de fotos (máximo 3) */}
        <div className="rounded-xl border border-[#44372E]/40 bg-[#1B1613] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-rotulo text-lg uppercase tracking-wide text-[#F5EFE6]">
                Evidencia Visual (Opcional · Máx 3)
              </h3>
              <p className="text-[11px] text-[#C9B9A6]">
                Enseña el corte transversal, el papel de plata o el ticket real.
              </p>
            </div>
            <span className="rounded bg-[#241D18] px-2 py-1 font-ticket text-[10px] text-[#FF7A1F]">
              {fotos.length} / 3 FOTOS
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {fotos.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className="group relative aspect-square overflow-hidden rounded-lg border border-[#FF7A1F]/50 bg-[#241D18]"
              >
                <img
                  src={url}
                  alt={`Evidencia #${idx + 1} del dürüm`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute bottom-1.5 left-1.5 font-ticket text-[9px] font-bold text-[#F5EFE6]">
                  CORTE #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => quitarFoto(idx)}
                  aria-label={`Quitar foto ${idx + 1}`}
                  className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/75 text-[#F5EFE6] hover:bg-[#FF3B30]"
                >
                  <Icono nombre="close" className="h-3 w-3" />
                </button>
              </div>
            ))}

            {fotos.length < 3 && (
              <button
                type="button"
                onClick={anadirFotoDemo}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#44372E] bg-[#241D18]/60 text-[#C9B9A6] transition-colors hover:border-[#FF7A1F] hover:text-[#FF7A1F]"
              >
                <Icono nombre="add_a_photo" className="h-5 w-5" />
                <span className="font-ticket text-[10px] uppercase">Añadir foto</span>
              </button>
            )}

            {fotos.length < 2 && (
              <button
                type="button"
                onClick={anadirFotoDemo}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#44372E]/60 bg-[#241D18]/30 text-[#C9B9A6]/70 transition-colors hover:border-[#FF7A1F] hover:text-[#FF7A1F]"
              >
                <Icono nombre="receipt" className="h-5 w-5" />
                <span className="font-ticket text-[10px] uppercase">Ticket caja</span>
              </button>
            )}
          </div>
        </div>

        {/* Comentario / Crónica Nocturna */}
        <div className="rounded-xl border border-[#44372E]/40 bg-[#1B1613] p-4">
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="comentario-barra"
              className="font-rotulo text-lg uppercase tracking-wide text-[#F5EFE6]"
            >
              Veredicto a pie de calle
            </label>
            <span className="font-ticket text-[10px] text-[#C9B9A6]">
              {comentario.length} / 280
            </span>
          </div>
          <textarea
            id="comentario-barra"
            rows={3}
            maxLength={280}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="¿Estaba crujiente la carne? ¿Pica de verdad la salsa roja? ¿Te llamaron 'amigo' o 'jefe'?"
            className="w-full rounded-lg border border-[#44372E]/70 bg-[#120F0D] p-3 text-sm leading-relaxed text-[#F5EFE6] placeholder:text-[#C9B9A6]/40 focus:border-[#FF7A1F] focus:outline-none"
          />

          {/* Etiquetas rápidas nocturnas */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[
              { nombre: 'Picante Bravo', icono: 'local_fire_department' as const },
              { nombre: 'Cola Rápida', icono: 'bolt' as const },
              { nombre: 'Bien Enrollado', icono: 'verified' as const },
            ].map((tag) => {
              const activa = etiquetasActivas.includes(tag.nombre);
              return (
                <button
                  key={tag.nombre}
                  type="button"
                  onClick={() => alternarEtiqueta(tag.nombre)}
                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 font-ticket text-[11px] transition-colors ${
                    activa
                      ? 'border-[#FF7A1F]/60 bg-[#FF7A1F]/15 font-bold text-[#FF7A1F]'
                      : 'border-[#44372E]/60 bg-[#241D18] text-[#C9B9A6] hover:text-[#F5EFE6]'
                  }`}
                >
                  <Icono nombre={tag.icono} className="h-3.5 w-3.5" />
                  {tag.nombre}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ 6. BARRA FIJA INFERIOR PARA PUBLICAR ============ */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-[#44372E]/40 bg-[#120F0D]/95 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="hidden rounded-lg border border-[#44372E]/60 bg-[#1B1613] px-3 py-2 sm:block">
            <span className="block font-ticket text-[9px] uppercase text-[#C9B9A6]">
              KebabScore
            </span>
            <span className="font-ticket text-lg font-bold text-[#FF7A1F]">
              {formatearNota(notaTotal)}
            </span>
          </div>
          <button
            type="submit"
            className="flex flex-1 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#FF3B30] via-[#FF5126] to-[#FF7A1F] px-5 py-3.5 font-rotulo text-xl uppercase tracking-wider text-[#F5EFE6] shadow-[0_0_24px_rgba(255,59,48,0.45)] transition-transform active:scale-[0.98]"
          >
            <Icono nombre="print" className="h-5 w-5" />
            <span>IMPRIMIR TICKET Y PUBLICAR ({formatearNota(notaTotal)})</span>
          </button>
        </div>
      </div>
    </form>
  );
}
