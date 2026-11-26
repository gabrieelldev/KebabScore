// =====================================================================
// MapaAsadores · mapa a pantalla completa con los kebabs y sus números
// ---------------------------------------------------------------------
// Se abre al pulsar el Radar de Asadores. Arriba, el callejero real
// (Leaflet + OpenStreetMap) con un pin por local; abajo, una hoja con las
// estadísticas del kebab elegido: KebabScore, nivel de picante, tickets,
// precio, peso, horario, distancia, las 6 capas del dürüm y extras.
// Una tira horizontal permite saltar de un local a otro sin tocar el mapa.
//
// Accesibilidad: es un diálogo modal (Escape cierra, el foco entra en el
// botón de cerrar y vuelve al radar al salir) y bloquea el scroll de fondo.
// =====================================================================

'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TrompoCarga } from '@/components/kebab/TrompoCarga';
import { Icono } from '@/components/ui/Icono';
import type { LocalResumen } from '@/lib/datos/tipos';
import { distanciaKm, formatearDistancia, type Coordenadas } from '@/lib/geo';
import type { EstadoHorario } from '@/lib/horario';
import {
  NOMBRE_NIVEL,
  RESENAS_MINIMAS_FIABLES,
  SUBNOTAS,
  formatearNota,
  formatearPrecio,
  nivelDeNota,
  type Nivel,
} from '@/lib/puntuacion';

const MapaLeaflet = dynamic(() => import('@/components/mapa/MapaLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-fondo">
      <TrompoCarga mensaje="Encendiendo el callejero de Málaga…" />
    </div>
  ),
});

const CLASE_NIVEL: Record<Nivel | 'sinNota', string> = {
  fuego: 'bg-guindilla-red text-carbon',
  picante: 'bg-primario text-carbon',
  suave: 'bg-mostaza-gold text-carbon',
  sosa: 'bg-crema-300 text-carbon',
  sinNota: 'bg-superficie-alta text-texto',
};

/** Color de la barra de cada capa según su nota. */
function colorBarra(nota: number): string {
  const nivel = nivelDeNota(nota);
  if (nivel === 'fuego') return 'bg-guindilla-red';
  if (nivel === 'picante') return 'bg-primario';
  if (nivel === 'suave') return 'bg-mostaza-gold';
  return 'bg-crema-500';
}

type Props = {
  locales: LocalResumen[];
  seleccionadoId: string | null;
  onSeleccionar: (id: string) => void;
  onCerrar: () => void;
  horarios: Map<string, EstadoHorario>;
  /** Tu ubicación real, si la has compartido. */
  ubicacion: Coordenadas | null;
  /** Centro del radar (tu ubicación o la plaza): para las distancias. */
  centro: Coordenadas;
  destinoInicial: { lat: number; lng: number; zoom: number } | null;
};

export function MapaAsadores({
  locales,
  seleccionadoId,
  onSeleccionar,
  onCerrar,
  horarios,
  ubicacion,
  centro,
  destinoInicial,
}: Props) {
  const botonCerrar = useRef<HTMLButtonElement>(null);
  const [destino, setDestino] = useState(destinoInicial);

  // Escape cierra · foco al botón de cerrar · sin scroll detrás
  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    botonCerrar.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', alPulsar);
    return () => {
      window.removeEventListener('keydown', alPulsar);
      document.body.style.overflow = overflow;
      anterior?.focus();
    };
  }, [onCerrar]);

  const ordenados = useMemo(
    () =>
      locales
        .map((l) => ({ local: l, km: distanciaKm(centro, l) }))
        .sort((a, b) => (ubicacion ? a.km - b.km : b.local.notaRanking - a.local.notaRanking)),
    [locales, centro, ubicacion],
  );

  const actual = ordenados.find((o) => o.local.id === seleccionadoId) ?? ordenados[0] ?? null;

  // Mantiene visible en la tira el local elegido
  const tira = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!actual) return;
    tira.current
      ?.querySelector<HTMLElement>(`[data-local="${actual.local.id}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [actual]);

  function elegir(local: LocalResumen) {
    onSeleccionar(local.id);
    setDestino({ lat: local.lat, lng: local.lng, zoom: 16 });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-mapa-asadores"
      className="mapa-asadores fixed inset-0 z-[70] flex flex-col bg-fondo"
    >
      {/* Cabecera del mapa */}
      <div className="cabecera-mapa flex items-center justify-between gap-3 border-b border-linea/10 bg-fondo px-4 py-3">
        <div className="min-w-0">
          <h2
            id="titulo-mapa-asadores"
            className="font-rotulo text-xl uppercase leading-none tracking-wide text-texto"
          >
            Mapa de asadores
          </h2>
          <p className="mt-1 font-ticket text-[11px] text-texto-suave">
            {locales.length} {locales.length === 1 ? 'kebab' : 'kebabs'} ·{' '}
            {ubicacion ? 'ordenados por cercanía' : 'ordenados por KebabScore'}
          </p>
        </div>
        <button
          ref={botonCerrar}
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar el mapa y volver al radar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-linea/15 bg-superficie text-texto transition-transform active:scale-90"
        >
          <Icono nombre="close" className="h-5 w-5" />
        </button>
      </div>

      {/* Mapa */}
      <div className="relative min-h-[180px] flex-1">
        <MapaLeaflet
          locales={locales}
          seleccionadoId={actual?.local.id ?? null}
          onSeleccionar={(id) => {
            const l = locales.find((x) => x.id === id);
            if (l) elegir(l);
          }}
          destinoCamara={destino}
          ubicacion={ubicacion}
          className="absolute inset-0 h-full w-full"
        />
      </div>

      {/* Hoja de estadísticas */}
      <div className="pb-safe relative z-10 -mt-3 max-h-[58vh] overflow-y-auto rounded-t-2xl border-t border-linea/15 bg-superficie shadow-[0_-12px_30px_rgba(0,0,0,0.45)]">
        <div aria-hidden="true" className="mx-auto mt-2 h-1 w-10 rounded-full bg-linea/20" />

        {/* Tira de locales */}
        <div
          ref={tira}
          role="group"
          aria-label="Elegir kebab"
          className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1 pt-3"
        >
          {ordenados.map(({ local, km }) => {
            const activo = local.id === actual?.local.id;
            const clave = local.nota === null ? 'sinNota' : nivelDeNota(local.nota);
            return (
              <button
                key={local.id}
                data-local={local.id}
                type="button"
                onClick={() => elegir(local)}
                aria-pressed={activo}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-left transition-colors ${
                  activo
                    ? 'border-acento bg-primario/15'
                    : 'border-linea/10 bg-superficie-baja hover:border-acento/40'
                }`}
              >
                <span
                  className={`rounded-full px-1.5 py-px font-ticket text-[11px] font-bold ${CLASE_NIVEL[clave]}`}
                >
                  {formatearNota(local.nota)}
                </span>
                <span className="max-w-[140px] truncate text-xs font-semibold text-texto">
                  {local.nombre}
                </span>
                <span className="font-ticket text-[10px] text-texto-suave">
                  {formatearDistancia(km)}
                </span>
              </button>
            );
          })}
        </div>

        {actual ? (
          <FichaEstadisticas
            local={actual.local}
            km={actual.km}
            desdeTi={Boolean(ubicacion)}
            horario={horarios.get(actual.local.id) ?? null}
          />
        ) : (
          <p className="px-4 py-6 text-center text-sm text-texto-suave">
            Ningún kebab coincide con los filtros. Prueba con otro barrio.
          </p>
        )}
      </div>
    </div>
  );
}

function FichaEstadisticas({
  local,
  km,
  desdeTi,
  horario,
}: {
  local: LocalResumen;
  km: number;
  desdeTi: boolean;
  horario: EstadoHorario | null;
}) {
  const clave = local.nota === null ? 'sinNota' : nivelDeNota(local.nota);
  const provisional = local.numResenas < RESENAS_MINIMAS_FIABLES;
  const extras = [
    local.halal && 'Halal',
    local.vegetariano && 'Opción vegetariana',
    local.panCasero && 'Pan casero',
    local.domicilio && 'A domicilio',
  ].filter(Boolean) as string[];

  return (
    <article aria-live="polite" className="px-4 pb-5 pt-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-ticket text-[11px] uppercase tracking-wider text-acento">
            {local.barrio.nombre}
          </p>
          <h3 className="font-rotulo text-2xl uppercase leading-[0.95] text-texto">{local.nombre}</h3>
          <p className="mt-1 truncate text-xs text-texto-suave">{local.direccion}</p>
        </div>
        <div className={`shrink-0 rounded-xl px-3 py-2 text-center ${CLASE_NIVEL[clave]}`}>
          <p className="font-rotulo text-3xl font-black leading-none">{formatearNota(local.nota)}</p>
          <p className="mt-0.5 font-ticket text-[10px] font-bold uppercase">
            {local.nota === null ? 'Sin nota' : NOMBRE_NIVEL[nivelDeNota(local.nota)]}
          </p>
        </div>
      </div>

      {/* Cifras rápidas */}
      <dl className="mt-3 grid grid-cols-4 gap-1.5 text-center">
        {[
          { t: desdeTi ? 'De ti' : 'Del centro', v: formatearDistancia(km) },
          { t: 'Dürüm', v: formatearPrecio(local.precioDurumCentimos) },
          { t: 'Peso', v: local.pesoGramos ? `${local.pesoGramos} g` : '—' },
          { t: 'Tickets', v: String(local.numResenas) },
        ].map((c) => (
          <div key={c.t} className="rounded-lg border border-linea/10 bg-superficie-baja px-1 py-1.5">
            <dt className="font-ticket text-[9px] uppercase text-texto-suave">{c.t}</dt>
            <dd className="font-ticket text-[13px] font-bold text-texto">{c.v}</dd>
          </div>
        ))}
      </dl>

      {horario && (
        <p
          className={`mt-2 flex items-center gap-1.5 font-ticket text-[11px] font-bold ${
            horario.abierto ? 'text-lechuga' : 'text-guindilla'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${horario.abierto ? 'bg-lechuga-green' : 'bg-guindilla-red'}`}
          />
          {horario.texto}
        </p>
      )}

      {/* Las 6 capas */}
      <h4 className="mt-3 font-ticket text-[11px] font-bold uppercase tracking-wider text-texto-suave">
        Capa a capa {provisional && <span className="font-normal normal-case">· nota provisional</span>}
      </h4>
      <ul className="mt-1.5 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {SUBNOTAS.map((s) => {
          const nota = local.subnotas[s.clave];
          return (
            <li key={s.clave} className="grid grid-cols-[1fr_auto] items-center gap-x-2">
              <span className="truncate text-xs text-texto">
                {s.nombre} <span className="text-texto-apagado">· {Math.round(s.peso * 100)}%</span>
              </span>
              <span className="font-ticket text-xs font-bold text-texto">{formatearNota(nota)}</span>
              <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-linea/10">
                <span
                  className={`block h-full rounded-full ${colorBarra(nota)}`}
                  style={{ width: `${Math.max(0, Math.min(10, nota)) * 10}%` }}
                />
              </span>
            </li>
          );
        })}
      </ul>

      {extras.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {extras.map((e) => (
            <li
              key={e}
              className="rounded-full border border-linea/15 px-2 py-0.5 font-ticket text-[10px] text-texto-suave"
            >
              {e}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${local.lat},${local.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-lg border border-linea/15 bg-superficie-baja px-3 py-2.5 font-ticket text-xs font-bold uppercase text-texto"
        >
          <Icono nombre="near_me" className="h-4 w-4 text-acento" />
          Cómo llegar
        </a>
        <Link
          href={`/kebab/${local.slug}`}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-primario px-3 py-2.5 font-ticket text-xs font-bold uppercase text-carbon"
        >
          Ver ficha
          <Icono nombre="arrow_forward" className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
