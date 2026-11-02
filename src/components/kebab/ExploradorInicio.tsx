// =====================================================================
// ExploradorInicio · Buscador + Filtros + Radar de Asadores / Mapa OSM
// ---------------------------------------------------------------------
// Diseño extraído de Stitch (inicio_explorador_nocturno_kebabscore):
//   1. Buscador "¿Dónde cenas esta noche?" con icono y botón "Filtrar"
//   2. Dos botones rápidos en 2 columnas: "Abierto ahora" y "Cerca de mí"
//   3. Pastillas horizontales de barrios de Málaga
//   4. "Radar de Asadores": permite alternar entre el Radar Nocturno de
//      Stitch (anillos de calor + pines luminosos interactivos) y el
//      Mapa Callejero real con Leaflet + OpenStreetMap.
// =====================================================================

'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Icono } from '@/components/ui/Icono';
import type { Barrio, LocalResumen } from '@/lib/datos/tipos';
import { estadoHorario, type EstadoHorario } from '@/lib/horario';
import { formatearNota, formatearPrecio } from '@/lib/puntuacion';
import { TEXTOS } from '@/lib/textos';
import { TrompoCarga } from './TrompoCarga';

// Cargamos Leaflet SOLO en el navegador cuando el usuario activa la vista OSM
const MapaLeaflet = dynamic(() => import('@/components/mapa/MapaLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[260px] w-full items-center justify-center rounded-xl border border-white/10 bg-[#120d0a]">
      <TrompoCarga mensaje="Encendiendo el callejero de Málaga…" />
    </div>
  ),
});

/** Quita tildes y pasa a minúsculas para que "perchel" encuentre "El Perchel". */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/** Distancia aproximada en km entre dos coordenadas (fórmula de Haversine). */
function distanciaKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const aRad = (g: number) => (g * Math.PI) / 180;
  const dLat = aRad(lat2 - lat1);
  const dLng = aRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRad(lat1)) * Math.cos(aRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Posiciones relativas en el radar nocturno para los primeros pines */
const POSICIONES_RADAR = [
  { top: '34%', left: '42%' },
  { top: '62%', left: '68%' },
  { top: '24%', left: '20%' },
  { top: '70%', left: '26%' },
  { top: '26%', left: '74%' },
  { top: '50%', left: '18%' },
];

type Props = {
  locales: LocalResumen[];
  barrios: Barrio[];
};

export function ExploradorInicio({ locales, barrios }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [barrioActivo, setBarrioActivo] = useState<string>('todos');
  const [soloAbiertos, setSoloAbiertos] = useState(true);
  const [vistaMapa, setVistaMapa] = useState<'radar' | 'leaflet'>('radar');
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(locales[0]?.id ?? null);
  const [destinoCamara, setDestinoCamara] = useState<{
    lat: number;
    lng: number;
    zoom: number;
  } | null>(null);

  // Geolocalización opcional ("Cerca de mí")
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null);
  const [mensajeGeo, setMensajeGeo] = useState<string | null>(null);

  // Reloj en el cliente para calcular "¿Abierto ahora?" en tiempo real
  const [ahora, setAhora] = useState<Date | null>(null);
  useEffect(() => {
    const actualizar = () => setAhora(new Date());
    actualizar();
    const id = window.setInterval(actualizar, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const horariosActuales = useMemo(() => {
    const mapa = new Map<string, EstadoHorario>();
    if (!ahora) return mapa;
    for (const l of locales) {
      mapa.set(l.id, estadoHorario(l.horario, ahora));
    }
    return mapa;
  }, [locales, ahora]);

  const cuantosAbiertos = useMemo(() => {
    let n = 0;
    for (const h of horariosActuales.values()) if (h.abierto) n++;
    return n || locales.length;
  }, [horariosActuales, locales.length]);

  const localesFiltrados = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return locales
      .filter((l) => {
        if (barrioActivo !== 'todos' && l.barrio.slug !== barrioActivo) return false;
        if (soloAbiertos && ahora) {
          const estado = horariosActuales.get(l.id);
          // En modo demo nocturno mostramos todos si a la hora actual cerraron todos
          const hayAlgunoAbierto = Array.from(horariosActuales.values()).some((h) => h.abierto);
          if (hayAlgunoAbierto && !estado?.abierto) return false;
        }
        if (!q) return true;
        const pajar = normalizar(`${l.nombre} ${l.barrio.nombre} ${l.direccion}`);
        return pajar.includes(q);
      })
      .sort((a, b) => {
        if (ubicacion) {
          return (
            distanciaKm(ubicacion.lat, ubicacion.lng, a.lat, a.lng) -
            distanciaKm(ubicacion.lat, ubicacion.lng, b.lat, b.lng)
          );
        }
        return b.notaRanking - a.notaRanking;
      });
  }, [locales, busqueda, barrioActivo, soloAbiertos, ahora, horariosActuales, ubicacion]);

  const localSeleccionado = useMemo(
    () =>
      localesFiltrados.find((l) => l.id === seleccionadoId) ??
      localesFiltrados[0] ??
      null,
    [localesFiltrados, seleccionadoId],
  );

  function elegirBarrio(slug: string) {
    setBarrioActivo(slug);
    if (slug === 'todos') {
      setDestinoCamara({ lat: 36.7213, lng: -4.4214, zoom: 13 });
      return;
    }
    const primero = locales.find((l) => l.barrio.slug === slug);
    if (primero) {
      setSeleccionadoId(primero.id);
      setDestinoCamara({ lat: primero.lat, lng: primero.lng, zoom: 15 });
    }
  }

  function pedirUbicacion() {
    if (!('geolocation' in navigator)) {
      setMensajeGeo(TEXTOS.geoNoDisponible);
      return;
    }
    setMensajeGeo(TEXTOS.geoBuscando);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUbicacion(coords);
        setMensajeGeo(null);
        setDestinoCamara({ ...coords, zoom: 15 });
      },
      () => setMensajeGeo(TEXTOS.geoDenegada),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  return (
    <>
      {/* ============ BUSCADOR & FILTROS (DISEÑO STITCH) ============ */}
      <section aria-label="Buscador de kebabs" className="px-4 py-4">
        <div className="rounded-xl border border-white/10 bg-[#1B1613] p-4 shadow-xl">
          <label
            htmlFor="buscador-kebab"
            className="mb-2 block font-rotulo text-xl uppercase tracking-wide text-[#F5EFE6]"
          >
            {TEXTOS.buscadorPregunta}
          </label>

          {/* Input de búsqueda con lupa y botón Filtrar */}
          <div className="relative flex items-center">
            <Icono
              nombre="search"
              className="pointer-events-none absolute left-3.5 h-5 w-5 text-[#FF7A1F]"
            />
            <input
              id="buscador-kebab"
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Barrio, calle o nombre (ej. Teatinos, Carretería)..."
              autoComplete="off"
              className="w-full rounded-lg border border-white/15 bg-[#120F0D] py-3.5 pl-11 pr-24 text-sm text-[#F5EFE6] placeholder:text-[#C9B9A6]/50 focus:border-[#FF7A1F] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (busqueda) setBusqueda('');
              }}
              className="absolute right-2 rounded bg-[#FF7A1F] px-3 py-1.5 font-rotulo text-xs uppercase tracking-wider text-[#120F0D] transition-colors hover:bg-[#FF7A1F]/90"
            >
              {busqueda ? 'Limpiar' : 'Filtrar'}
            </button>
          </div>

          {/* Dos botones rápidos en 2 columnas: Abierto ahora + Cerca de mí */}
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setSoloAbiertos((v) => !v)}
              aria-pressed={soloAbiertos}
              className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 transition-all active:scale-95 ${
                soloAbiertos
                  ? 'border-[#35C759]/40 bg-[#35C759]/15'
                  : 'border-white/10 bg-[#241D18] hover:border-[#35C759]/40'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#35C759] shadow-[0_0_8px_#35C759]" />
                <span
                  className={`text-xs font-bold ${
                    soloAbiertos ? 'text-[#35C759]' : 'text-[#F5EFE6]'
                  }`}
                >
                  Abierto ahora
                </span>
              </span>
              <span className="rounded bg-[#35C759]/20 px-1.5 py-0.5 font-ticket text-[11px] font-bold text-[#35C759]">
                {cuantosAbiertos}
              </span>
            </button>

            <button
              type="button"
              onClick={pedirUbicacion}
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#241D18] px-3.5 py-2.5 transition-all hover:border-[#FF7A1F]/40 active:scale-95"
            >
              <Icono nombre="near_me" className="h-4 w-4 text-[#FF7A1F]" />
              <span className="text-xs font-semibold text-[#F5EFE6]">
                {ubicacion ? 'Por cercanía' : 'Cerca de mí'}
              </span>
            </button>
          </div>

          {mensajeGeo && (
            <p role="status" className="mt-2 font-ticket text-[11px] text-[#C9B9A6]">
              {mensajeGeo}
            </p>
          )}

          {/* Pastillas horizontales de barrios */}
          <div
            role="group"
            aria-label="Filtrar por barrio de Málaga"
            className="no-scrollbar mt-3.5 flex items-center gap-2 overflow-x-auto pb-1"
          >
            <button
              type="button"
              onClick={() => elegirBarrio('todos')}
              aria-pressed={barrioActivo === 'todos'}
              className={`shrink-0 rounded-full px-3.5 py-1.5 font-ticket text-xs font-bold transition-colors ${
                barrioActivo === 'todos'
                  ? 'bg-[#FF7A1F] text-[#120F0D]'
                  : 'border border-white/10 bg-[#241D18] text-[#C9B9A6] hover:text-[#F5EFE6]'
              }`}
            >
              Toda Málaga ({locales.length})
            </button>
            {barrios.map((b) => {
              const activo = barrioActivo === b.slug;
              return (
                <button
                  key={b.slug}
                  type="button"
                  onClick={() => elegirBarrio(b.slug)}
                  aria-pressed={activo}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 font-ticket text-xs font-medium transition-colors ${
                    activo
                      ? 'bg-[#FF7A1F] font-bold text-[#120F0D]'
                      : 'border border-white/10 bg-[#241D18] text-[#C9B9A6] hover:text-[#F5EFE6]'
                  }`}
                >
                  {b.nombre}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ RADAR DE ASADORES / MAPA INTERACTIVO ============ */}
      <section aria-label="Radar de Asadores" className="px-4 py-3">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div>
            <h2 className="font-rotulo text-lg uppercase tracking-wide text-[#F5EFE6]">
              Radar de Asadores
            </h2>
            <p className="font-ticket text-[11px] text-[#C9B9A6]">
              {localesFiltrados.length}{' '}
              {localesFiltrados.length === 1
                ? 'local humeando ahora'
                : 'locales humeando ahora'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Leyenda de colores */}
            <div className="hidden items-center gap-2.5 rounded-full border border-white/5 bg-[#1B1613] px-2.5 py-1 font-ticket text-[10px] sm:flex">
              <span className="flex items-center gap-1 text-[#FF3B30]">
                <span className="h-2 w-2 rounded-full bg-[#FF3B30]" /> ≥8,5 Fuego
              </span>
              <span className="flex items-center gap-1 text-[#FF7A1F]">
                <span className="h-2 w-2 rounded-full bg-[#FF7A1F]" /> 7-8,4
              </span>
              <span className="flex items-center gap-1 text-[#F2C14E]">
                <span className="h-2 w-2 rounded-full bg-[#F2C14E]" /> 5-6,9
              </span>
            </div>

            {/* Conmutador Radar 3 AM / Mapa OSM */}
            <div className="inline-flex rounded-lg border border-white/10 bg-[#1B1613] p-0.5 font-ticket text-[10px]">
              <button
                type="button"
                onClick={() => setVistaMapa('radar')}
                className={`rounded-md px-2 py-1 font-bold uppercase transition-colors ${
                  vistaMapa === 'radar'
                    ? 'bg-[#FF7A1F] text-[#120F0D]'
                    : 'text-[#C9B9A6] hover:text-[#F5EFE6]'
                }`}
              >
                Radar 3AM
              </button>
              <button
                type="button"
                onClick={() => setVistaMapa('leaflet')}
                className={`rounded-md px-2 py-1 font-bold uppercase transition-colors ${
                  vistaMapa === 'leaflet'
                    ? 'bg-[#FF7A1F] text-[#120F0D]'
                    : 'text-[#C9B9A6] hover:text-[#F5EFE6]'
                }`}
              >
                Callejero
              </button>
            </div>
          </div>
        </div>

        {vistaMapa === 'radar' ? (
          <div className="relative h-60 w-full overflow-hidden rounded-xl border border-white/15 bg-[#120d0a] shadow-inner">
            {/* Rejilla oscura tipo radar nocturno de Málaga */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'radial-gradient(#FF7A1F 1px, transparent 1px), radial-gradient(#241D18 1px, #120F0D 1px)',
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 12px 12px',
              }}
            />

            {/* Trazado arterial estilizado de Málaga */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
              viewBox="0 0 400 200"
            >
              <path
                d="M-20,150 Q120,130 220,90 T420,40"
                fill="none"
                stroke="#C9B9A6"
                strokeWidth="3"
              />
              <path d="M80,-10 L180,220" fill="none" stroke="#C9B9A6" strokeWidth="1.5" />
              <path d="M260,-10 L210,220" fill="none" stroke="#C9B9A6" strokeWidth="1.5" />
              <path
                d="M0,190 Q200,160 400,180"
                fill="none"
                stroke="#FF7A1F"
                strokeDasharray="6 4"
                strokeWidth="2"
              />
            </svg>

            {/* Anillos de calor concéntricos */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FF7A1F]/30 heat-wave" />
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FF3B30]/20 heat-wave"
              style={{ animationDelay: '1.2s' }}
            />

            {/* Pines de locales sobre el radar */}
            {localesFiltrados.slice(0, 6).map((local, idx) => {
              const pos = POSICIONES_RADAR[idx % POSICIONES_RADAR.length];
              const notaNum = local.nota ?? 6.5;
              const esFuego = notaNum >= 8.5;
              const esPicante = notaNum >= 7 && notaNum < 8.5;
              const seleccionado = localSeleccionado?.id === local.id;

              const claseColor = esFuego
                ? 'bg-[#FF3B30] text-[#F5EFE6] border-[#F5EFE6]/80 shadow-[0_0_15px_rgba(255,59,48,0.8)]'
                : esPicante
                  ? 'bg-[#FF7A1F] text-[#120F0D] border-[#120F0D] shadow-lg'
                  : 'bg-[#F2C14E] text-[#120F0D] border-[#120F0D] shadow-md';

              return (
                <button
                  key={local.id}
                  type="button"
                  onClick={() => setSeleccionadoId(local.id)}
                  style={{ top: pos.top, left: pos.left }}
                  className={`group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-transform ${
                    seleccionado ? 'z-20 scale-110' : 'z-10 hover:scale-105'
                  }`}
                >
                  <div
                    className={`flex items-center gap-1 rounded-full border px-2 py-0.5 font-ticket text-[11px] font-bold ${claseColor}`}
                  >
                    {esFuego && (
                      <Icono nombre="local_fire_department" className="h-3 w-3" />
                    )}
                    <span>{formatearNota(local.nota)}</span>
                    <span className="max-w-[78px] truncate text-[9px] opacity-90">
                      {local.barrio.nombre}
                    </span>
                  </div>
                  <div
                    className={`h-2 w-0.5 ${
                      esFuego
                        ? 'bg-[#FF3B30]'
                        : esPicante
                          ? 'bg-[#FF7A1F]'
                          : 'bg-[#F2C14E]'
                    }`}
                  />
                </button>
              );
            })}

            {/* Tarjeta flotante del local seleccionado en la parte inferior del radar */}
            {localSeleccionado && (
              <div className="absolute bottom-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between gap-2 rounded-lg border border-white/15 bg-[#120F0D]/90 px-3 py-2 backdrop-blur-md">
                <div className="min-w-0">
                  <p className="truncate font-rotulo text-sm uppercase tracking-wide text-[#F5EFE6]">
                    {localSeleccionado.nombre}
                  </p>
                  <p className="truncate font-ticket text-[10px] text-[#C9B9A6]">
                    {localSeleccionado.barrio.nombre} · {localSeleccionado.direccion} ·{' '}
                    {formatearPrecio(localSeleccionado.precioDurumCentimos)}
                  </p>
                </div>
                <Link
                  href={`/kebab/${localSeleccionado.slug}`}
                  className="shrink-0 rounded-md bg-[#FF7A1F] px-2.5 py-1.5 font-ticket text-[10px] font-bold uppercase text-[#120F0D] hover:bg-[#FF3B30] hover:text-[#F5EFE6]"
                >
                  Ver ficha →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <MapaLeaflet
            locales={localesFiltrados}
            seleccionadoId={seleccionadoId}
            onSeleccionar={setSeleccionadoId}
            destinoCamara={destinoCamara}
          />
        )}
      </section>
    </>
  );
}
