// =====================================================================
// MapaLeaflet · mapa real con Leaflet + OpenStreetMap y pines de mini dürüm
// ---------------------------------------------------------------------
// ⚠️ Leaflet necesita `window`, así que este archivo NUNCA debe ejecutarse
// en el servidor. El componente padre (ExploradorInicio) lo importa con
// `next/dynamic` y `ssr: false`.
//
// ¿Por qué `L.divIcon`? Nos permite dibujar cada pin como un SVG con forma
// de mini dürüm y la nota dentro, coloreado según su nivel de "picante".
// =====================================================================

'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { LocalResumen } from '@/lib/datos/tipos';
import { formatearNota, formatearPrecio, nivelDeNota, type Nivel } from '@/lib/puntuacion';

const CENTRO_MALAGA: [number, number] = [36.7213, -4.4214];

const COLOR_PIN: Record<Nivel | 'sinNota', { fondo: string; texto: string; borde: string }> = {
  fuego:   { fondo: '#FF4A3D', texto: '#FFF8EB', borde: '#FFF8EB' },
  picante: { fondo: '#FF7A1F', texto: '#1A1411', borde: '#FFF8EB' },
  suave:   { fondo: '#F2C14E', texto: '#1A1411', borde: '#1A1411' },
  sosa:    { fondo: '#352922', texto: '#F7EEDB', borde: '#C9B9A0' },
  sinNota: { fondo: '#251D18', texto: '#C9B9A0', borde: '#C9B9A0' },
};

/** Construye el HTML del pin con forma de mini dürüm + banderola con la nota. */
function crearIconoDurum(nota: number | null, seleccionado: boolean): L.DivIcon {
  const clave = nota === null ? 'sinNota' : nivelDeNota(nota);
  const c = COLOR_PIN[clave];
  const textoNota = nota === null ? '—' : formatearNota(nota);
  const escala = seleccionado ? 'scale(1.18)' : 'scale(1)';

  const html = `
    <div style="transform:${escala};transform-origin:bottom center;transition:transform 150ms ease;display:flex;flex-direction:column;align-items:center;">
      <div style="background:${c.fondo};color:${c.texto};border:2px solid ${c.borde};border-radius:999px;padding:2px 7px;font-family:'Space Mono',monospace;font-weight:700;font-size:12px;line-height:1.1;box-shadow:0 3px 10px rgba(0,0,0,.45);display:flex;align-items:center;gap:4px;white-space:nowrap;">
        <svg width="12" height="16" viewBox="0 0 12 16" aria-hidden="true">
          <ellipse cx="6" cy="3" rx="4.5" ry="2" fill="#EADBC0"/>
          <circle cx="5" cy="3" r="1" fill="#A9430A"/>
          <circle cx="7.5" cy="3" r="0.9" fill="#7ED957"/>
          <path d="M1.5 3 L10.5 3 L9.5 9 L2.5 9 Z" fill="#EADBC0"/>
          <path d="M2.5 9 L9.5 9 L8.5 15 L3.5 15 Z" fill="#C9B9A0"/>
        </svg>
        <span>${textoNota}</span>
      </div>
      <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${c.borde};margin-top:-1px;"></div>
    </div>
  `;

  return L.divIcon({
    className: 'pin-durum-icono',
    html,
    iconSize: [64, 34],
    iconAnchor: [32, 34],
    popupAnchor: [0, -32],
  });
}

/** Subcomponente que mueve la cámara cuando el usuario elige un local o usa su ubicación. */
function ControladorVista({ destino }: { destino: { lat: number; lng: number; zoom: number } | null }) {
  const mapa = useMap();
  useEffect(() => {
    if (destino) {
      mapa.flyTo([destino.lat, destino.lng], destino.zoom, { duration: 0.6 });
    }
  }, [destino, mapa]);
  return null;
}

type Props = {
  locales: LocalResumen[];
  seleccionadoId: string | null;
  onSeleccionar: (id: string) => void;
  destinoCamara: { lat: number; lng: number; zoom: number } | null;
};

export default function MapaLeaflet({
  locales,
  seleccionadoId,
  onSeleccionar,
  destinoCamara,
}: Props) {
  return (
    <MapContainer
      center={CENTRO_MALAGA}
      zoom={13}
      scrollWheelZoom={false}
      className="h-[360px] w-full rounded-xl border border-borde sm:h-[440px]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ControladorVista destino={destinoCamara} />

      {locales.map((local) => (
        <Marker
          key={local.id}
          position={[local.lat, local.lng]}
          icon={crearIconoDurum(local.nota, local.id === seleccionadoId)}
          eventHandlers={{
            click: () => onSeleccionar(local.id),
          }}
        >
          <Popup>
            <div className="min-w-44 font-sans text-carbon">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5A4A3E]">
                {local.barrio.nombre}
              </p>
              <p className="mt-0.5 text-base font-bold leading-tight">{local.nombre}</p>
              <p className="text-xs text-[#5A4A3E]">{local.direccion}</p>
              <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#D8C6A8] pt-2 font-ticket text-xs">
                <span className="font-bold">
                  TOTAL: {local.nota !== null ? formatearNota(local.nota) : '—'}
                </span>
                {local.precioDurumCentimos !== null && (
                  <span>{formatearPrecio(local.precioDurumCentimos)}</span>
                )}
              </div>
              <Link
                href={`/kebab/${local.slug}`}
                className="mt-2 block rounded bg-brasa px-2.5 py-1 text-center font-ticket text-xs font-bold uppercase text-carbon hover:opacity-90"
              >
                Ver ficha y tickets →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
