// =====================================================================
// RadarAsadores · radar real de kebabs alrededor de ti (o del centro)
// ---------------------------------------------------------------------
// Cada local se coloca según su distancia y rumbo REALES respecto al
// centro del radar: tu ubicación si has pulsado "Cerca de mí", o la
// Plaza de la Constitución si no. Los anillos marcan distancias y el
// alcance se ajusta solo para que quepan todos los locales filtrados.
//
// El barrido gira y cada pin "hace eco" justo cuando la aguja pasa por
// encima: su retraso de animación sale de su rumbo (0° = norte).
//
// Pulsar el radar abre el mapa a pantalla completa; pulsar un pin lo
// abre centrado en ese kebab.
// =====================================================================

'use client';

import { useMemo } from 'react';
import { Icono } from '@/components/ui/Icono';
import type { LocalResumen } from '@/lib/datos/tipos';
import {
  alcanceRadarKm,
  distanciaKm,
  formatearDistancia,
  proyectarKm,
  rumboGrados,
  type Coordenadas,
} from '@/lib/geo';
import { formatearNota, nivelDeNota, type Nivel } from '@/lib/puntuacion';

/** Radio del círculo exterior del radar en píxeles. */
const RADIO_PX = 108;
/** Una vuelta completa del barrido (debe coincidir con .radar-barrido en globals.css). */
const VUELTA_S = 4;

const CLASE_NIVEL: Record<Nivel | 'sinNota', string> = {
  fuego: 'bg-guindilla-red text-carbon',
  picante: 'bg-primario text-carbon',
  suave: 'bg-mostaza-gold text-carbon',
  sosa: 'bg-crema-300 text-carbon',
  sinNota: 'bg-crema-500 text-carbon',
};

type Props = {
  locales: LocalResumen[];
  centro: Coordenadas;
  /** true si el centro es la ubicación real del usuario. */
  esUbicacionReal: boolean;
  seleccionadoId: string | null;
  onAbrirMapa: (localId: string | null) => void;
};

export function RadarAsadores({ locales, centro, esUbicacionReal, seleccionadoId, onAbrirMapa }: Props) {
  const { pines, alcanceKm } = useMemo(() => {
    const conDistancia = locales.map((local) => ({
      local,
      km: distanciaKm(centro, local),
      rumbo: rumboGrados(centro, local),
      ...proyectarKm(centro, local),
    }));
    // El alcance se ajusta al 80 % más cercano: un local lejano no debe
    // aplastar a todos los demás en el centro. Los que quedan fuera se
    // pintan en el borde, en su rumbo real y algo apagados.
    const distancias = conDistancia.map((p) => p.km).sort((a, b) => a - b);
    const referencia = distancias[Math.max(0, Math.ceil(distancias.length * 0.8) - 1)] ?? 0;
    const alcance = alcanceRadarKm(referencia);
    const escala = RADIO_PX / alcance; // px por km

    // Los más cercanos se pintan al final para que queden por encima
    const colocados = conDistancia
      .sort((a, b) => b.km - a.km)
      .map((p) => {
        const factor = p.km > alcance ? (alcance * 1.04) / p.km : 1;
        return {
          ...p,
          px: p.x * escala * factor,
          py: -p.y * escala * factor,
          fueraDeAlcance: factor < 1,
        };
      });

    // Si una etiqueta pisa a otra ya colocada, prueba huecos cercanos
    // (abajo, arriba, más lejos…). La posición exacta está en el mapa;
    // aquí manda poder leer cada nota.
    const huecos = [0, 17, -17, 34, -34, 51, -51, 68, -68];
    // Se colocan del más cercano al más lejano: los cercanos conservan su
    // sitio exacto y son los lejanos los que se apartan.
    for (let i = colocados.length - 1; i >= 0; i--) {
      const original = colocados[i].py;
      const choca = (py: number) =>
        colocados
          .slice(i + 1)
          .some((o) => Math.abs(o.px - colocados[i].px) < 32 && Math.abs(o.py - py) < 17);
      const libre = huecos.find((h) => !choca(original + h));
      colocados[i].py = original + (libre ?? 0);
    }
    return { alcanceKm: alcance, pines: colocados };
  }, [locales, centro]);

  const cercano = pines.length ? pines[pines.length - 1] : null;
  const anillos = [1 / 3, 2 / 3, 1];

  return (
    <div className="radar-asadores relative h-72 w-full overflow-hidden rounded-xl border border-linea/15 bg-[#0E0A08] shadow-inner">
      {/* Fondo pulsable: abre el mapa completo */}
      <button
        type="button"
        onClick={() => onAbrirMapa(null)}
        aria-label={`Abrir el mapa con los ${locales.length} kebabs y sus estadísticas`}
        className="absolute inset-0 z-0 cursor-pointer"
      />

      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2">
        {/* Anillos de distancia */}
        {anillos.map((f) => (
          <div
            key={f}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FF7A1F]/25"
            style={{ width: RADIO_PX * 2 * f, height: RADIO_PX * 2 * f }}
          >
            <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded bg-[#0E0A08] px-1 font-ticket text-[9px] text-[#C9B9A0]">
              {formatearDistancia(alcanceKm * f)}
            </span>
          </div>
        ))}
        {/* Ejes en cruz */}
        <div className="absolute h-px -translate-x-1/2 bg-[#FF7A1F]/15" style={{ width: RADIO_PX * 2 }} />
        <div className="absolute w-px -translate-y-1/2 bg-[#FF7A1F]/15" style={{ height: RADIO_PX * 2 }} />
        {/* Barrido */}
        <div
          className="radar-barrido absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: RADIO_PX * 2, height: RADIO_PX * 2 }}
        />
        <span
          className="absolute -translate-x-1/2 font-ticket text-[9px] font-bold text-[#FF9447]"
          style={{ top: -RADIO_PX - 14 }}
        >
          N
        </span>
      </div>

      {/* Centro: tú o la plaza */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      >
        <span className="relative flex h-3 w-3">
          {esUbicacionReal && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7ED957] opacity-70" />
          )}
          <span
            className={`relative inline-flex h-3 w-3 rounded-full border-2 border-[#0E0A08] ${
              esUbicacionReal ? 'bg-[#7ED957]' : 'bg-[#F7EEDB]'
            }`}
          />
        </span>
      </div>

      {/* Pines de locales en su posición real */}
      {pines.map((p) => {
        const clave = p.local.nota === null ? 'sinNota' : nivelDeNota(p.local.nota);
        const seleccionado = p.local.id === seleccionadoId;
        return (
          <button
            key={p.local.id}
            type="button"
            onClick={() => onAbrirMapa(p.local.id)}
            aria-label={`${p.local.nombre}, nota ${formatearNota(p.local.nota)}, a ${formatearDistancia(p.km)}. Abrir en el mapa`}
            className={`absolute -translate-x-1/2 -translate-y-1/2 ${seleccionado ? 'z-30' : 'z-20'} ${
              p.fueraDeAlcance ? 'opacity-60' : ''
            }`}
            style={{ left: `calc(50% + ${p.px}px)`, top: `calc(50% + ${p.py}px)` }}
          >
            <span
              className="radar-eco absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ animationDelay: `${(p.rumbo / 360) * VUELTA_S}s` }}
            />
            <span
              className={`relative flex items-center rounded-full border border-[#0E0A08] px-1.5 py-px font-ticket text-[10px] font-bold leading-tight shadow-[0_0_10px_rgba(255,122,31,0.45)] ${
                CLASE_NIVEL[clave]
              } ${seleccionado ? 'ring-2 ring-[#F7EEDB]' : ''}`}
            >
              {formatearNota(p.local.nota)}
            </span>
          </button>
        );
      })}

      {/* Leyenda inferior: centro + el más cercano + llamada a la acción */}
      <div className="pointer-events-none absolute inset-x-2 bottom-2 z-30 flex items-end justify-between gap-2">
        <p className="min-w-0 rounded-md bg-[#0E0A08]/85 px-2 py-1 font-ticket text-[10px] leading-snug text-[#C9B9A0]">
          <span className="block font-bold text-[#F7EEDB]">
            {esUbicacionReal ? 'Centro: tu ubicación' : 'Centro: Pl. de la Constitución'}
          </span>
          {cercano && (
            <span className="block truncate">
              Más cerca: {cercano.local.nombre} · {formatearDistancia(cercano.km)}
            </span>
          )}
        </p>
        <span className="flex shrink-0 items-center gap-1 rounded-md bg-[#FF7A1F] px-2 py-1 font-ticket text-[10px] font-bold uppercase text-[#120D0A]">
          <Icono nombre="map" className="h-3.5 w-3.5" />
          Abrir mapa
        </span>
      </div>
    </div>
  );
}
