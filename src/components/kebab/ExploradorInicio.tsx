// =====================================================================
// ExploradorInicio · Buscador + Filtros + Radar de Asadores / Mapa OSM
// ---------------------------------------------------------------------
// Diseño extraído de Stitch (inicio_explorador_nocturno_kebabscore):
//   1. Buscador "¿Dónde cenas esta noche?" con icono y botón "Filtrar"
//   2. Dos botones rápidos en 2 columnas: "Abierto ahora" y "Cerca de mí"
//   3. Pastillas horizontales de barrios de Málaga
//   4. "Radar de Asadores": radar real (distancia y rumbo de cada local
//      respecto a ti o al centro). Al pulsarlo se abre el mapa a pantalla
//      completa (Leaflet + OpenStreetMap) con las estadísticas de cada kebab.
// =====================================================================

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Brocheta } from '@/components/kebab/Brocheta';
import { MapaAsadores } from '@/components/mapa/MapaAsadores';
import { RadarAsadores } from '@/components/mapa/RadarAsadores';
import { Icono } from '@/components/ui/Icono';
import type { Barrio, LocalResumen } from '@/lib/datos/tipos';
import { CENTRO_MALAGA, distanciaKm } from '@/lib/geo';
import { estadoHorario, type EstadoHorario } from '@/lib/horario';
import { TEXTOS } from '@/lib/textos';

/** Quita tildes y pasa a minúsculas para que "perchel" encuentre "El Perchel". */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

type Props = {
  locales: LocalResumen[];
  barrios: Barrio[];
};

export function ExploradorInicio({ locales, barrios }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [barrioActivo, setBarrioActivo] = useState<string>('todos');
  const [soloAbiertos, setSoloAbiertos] = useState(true);
  const [mapaAbierto, setMapaAbierto] = useState(false);
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
          return distanciaKm(ubicacion, a) - distanciaKm(ubicacion, b);
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

  const centroRadar = ubicacion ?? CENTRO_MALAGA;

  function abrirMapa(localId: string | null) {
    if (localId) {
      const l = locales.find((x) => x.id === localId);
      setSeleccionadoId(localId);
      if (l) setDestinoCamara({ lat: l.lat, lng: l.lng, zoom: 16 });
    } else {
      setDestinoCamara(null); // el mapa encuadra todos los locales
    }
    setMapaAbierto(true);
  }
  const cerrarMapa = useCallback(() => setMapaAbierto(false), []);

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
        <div className="rounded-xl border border-linea/10 bg-superficie-baja p-4 shadow-xl">
          <label
            htmlFor="buscador-kebab"
            className="mb-2 block font-rotulo text-xl uppercase tracking-wide text-texto"
          >
            {TEXTOS.buscadorPregunta}
          </label>

          {/* Input de búsqueda con lupa y botón Filtrar */}
          <div className="relative flex items-center">
            <Icono
              nombre="search"
              className="pointer-events-none absolute left-3.5 h-5 w-5 text-acento"
            />
            <input
              id="buscador-kebab"
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Barrio, calle o nombre (ej. Teatinos, Carretería)..."
              autoComplete="off"
              className="w-full rounded-lg border border-linea/15 bg-fondo py-3.5 pl-11 pr-24 text-sm text-texto placeholder:text-texto-suave/50 focus:border-acento focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (busqueda) setBusqueda('');
              }}
              className="absolute right-2 rounded bg-primario px-3 py-1.5 font-rotulo text-xs uppercase tracking-wider text-carbon transition-colors hover:bg-primario/90"
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
                  ? 'border-lechuga/40 bg-lechuga-green/15'
                  : 'border-linea/10 bg-superficie hover:border-lechuga/40'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-lechuga-green shadow-[0_0_8px_#35C759]" />
                <span
                  className={`text-xs font-bold ${
                    soloAbiertos ? 'text-lechuga' : 'text-texto'
                  }`}
                >
                  Abierto ahora
                </span>
              </span>
              <span className="rounded bg-lechuga-green/20 px-1.5 py-0.5 font-ticket text-[11px] font-bold text-lechuga">
                {cuantosAbiertos}
              </span>
            </button>

            <button
              type="button"
              onClick={pedirUbicacion}
              className="flex items-center justify-center gap-2 rounded-lg border border-linea/10 bg-superficie px-3.5 py-2.5 transition-all hover:border-acento/40 active:scale-95"
            >
              <Icono nombre="near_me" className="h-4 w-4 text-acento" />
              <span className="text-xs font-semibold text-texto">
                {ubicacion ? 'Por cercanía' : 'Cerca de mí'}
              </span>
            </button>
          </div>

          {mensajeGeo && (
            <p role="status" className="mt-2 font-ticket text-[11px] text-texto-suave">
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
                  ? 'bg-primario text-carbon'
                  : 'border border-linea/10 bg-superficie text-texto-suave hover:text-texto'
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
                      ? 'bg-primario font-bold text-carbon'
                      : 'border border-linea/10 bg-superficie text-texto-suave hover:text-texto'
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
            <h2 className="font-rotulo text-lg uppercase tracking-wide text-texto">
              Radar de Asadores
            </h2>
            <Brocheta className="my-0.5" />
            <p className="font-ticket text-[11px] text-texto-suave">
              {localesFiltrados.length}{' '}
              {localesFiltrados.length === 1
                ? 'local humeando ahora'
                : 'locales humeando ahora'}
            </p>
          </div>

          {/* Leyenda de colores (el color siempre va con su número) */}
          <div className="flex flex-col items-start gap-0.5 rounded-lg border border-linea/5 bg-superficie-baja px-2.5 py-1.5 font-ticket text-[10px] sm:flex-row sm:items-center sm:gap-2.5 sm:rounded-full">
            <span className="flex items-center gap-1 text-guindilla">
              <span className="h-2 w-2 rounded-full bg-guindilla-red" /> ≥8,5 Fuego
            </span>
            <span className="flex items-center gap-1 text-acento">
              <span className="h-2 w-2 rounded-full bg-primario" /> 7-8,4
            </span>
            <span className="flex items-center gap-1 text-mostaza">
              <span className="h-2 w-2 rounded-full bg-mostaza-gold" /> 5-6,9
            </span>
          </div>
        </div>

        <RadarAsadores
          locales={localesFiltrados}
          centro={centroRadar}
          esUbicacionReal={Boolean(ubicacion)}
          seleccionadoId={localSeleccionado?.id ?? null}
          onAbrirMapa={abrirMapa}
        />
        {!ubicacion && (
          <button
            type="button"
            onClick={pedirUbicacion}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-linea/10 bg-superficie-baja px-3 py-2 font-ticket text-[11px] font-bold text-texto-suave hover:text-texto"
          >
            <Icono nombre="near_me" className="h-3.5 w-3.5 text-acento" />
            Centrar el radar en mi ubicación
          </button>
        )}

        {mapaAbierto &&
          createPortal(
            <MapaAsadores
              locales={localesFiltrados}
              seleccionadoId={localSeleccionado?.id ?? null}
              onSeleccionar={setSeleccionadoId}
              onCerrar={cerrarMapa}
              horarios={horariosActuales}
              ubicacion={ubicacion}
              centro={centroRadar}
              destinoInicial={destinoCamara}
            />,
            document.body,
          )}
      </section>
    </>
  );
}
