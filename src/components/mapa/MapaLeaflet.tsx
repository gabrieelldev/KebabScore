// =====================================================================
// MapaLeaflet · mapa real con Leaflet + OpenStreetMap y pines de mini dürüm
// ---------------------------------------------------------------------
// ⚠️ Leaflet necesita `window`, así que este archivo NUNCA debe ejecutarse
// en el servidor. El componente padre (ExploradorInicio) lo importa con
// `next/dynamic` y `ssr: false`.
//
// Las estadísticas del local seleccionado NO van en un popup: las enseña
// la hoja inferior de MapaAsadores, que tiene sitio para las 6 capas.
//
// ¿Por qué `L.divIcon`? Nos permite dibujar cada pin como un SVG con forma
// de mini dürüm y la nota dentro, coloreado según su nivel de "picante".
// =====================================================================

'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import type { LocalResumen } from '@/lib/datos/tipos';
import { formatearNota, nivelDeNota, type Nivel } from '@/lib/puntuacion';

const CENTRO_MALAGA: [number, number] = [36.7213, -4.4214];

const COLOR_PIN: Record<Nivel | 'sinNota', { fondo: string; texto: string; borde: string }> = {
  fuego:   { fondo: '#FF4A3D', texto: '#1A1411', borde: '#FFF8EB' },
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
      <div style="background:${c.fondo};color:${c.texto};border:2px solid ${c.borde};border-radius:999px;padding:2px 7px;font-family:'Recursive Variable',monospace;font-variation-settings:'MONO' 1;font-weight:700;font-size:12px;line-height:1.1;box-shadow:0 3px 10px rgba(0,0,0,.45);display:flex;align-items:center;gap:4px;white-space:nowrap;">
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

/** Punto verde pulsante de "estás aquí". */
const ICONO_TU = L.divIcon({
  className: 'pin-durum-icono',
  html: `<div style="width:16px;height:16px;border-radius:999px;background:#7ED957;border:3px solid #120D0A;box-shadow:0 0 0 2px #7ED957,0 0 14px #7ED957;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

/**
 * Mueve la cámara: al montar encuadra todos los puntos y después vuela a
 * cada destino nuevo (local elegido, barrio o tu ubicación).
 */
function ControladorVista({
  destino,
  encuadre,
}: {
  destino: { lat: number; lng: number; zoom: number } | null;
  encuadre: Array<[number, number]>;
}) {
  const mapa = useMap();
  const encuadrado = useRef(false);
  useEffect(() => {
    if (encuadrado.current || encuadre.length === 0) return;
    encuadrado.current = true;
    if (destino) return; // si ya hay destino, manda el destino
    mapa.fitBounds(L.latLngBounds(encuadre), { padding: [36, 36], maxZoom: 15 });
  }, [encuadre, destino, mapa]);
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
  /** Tu ubicación real, si la has compartido. */
  ubicacion?: { lat: number; lng: number } | null;
  className?: string;
};

export default function MapaLeaflet({
  locales,
  seleccionadoId,
  onSeleccionar,
  destinoCamara,
  ubicacion = null,
  className = 'h-[360px] w-full rounded-xl border border-borde sm:h-[440px]',
}: Props) {
  const encuadre = useMemo<Array<[number, number]>>(
    () => [
      ...locales.map((l) => [l.lat, l.lng] as [number, number]),
      ...(ubicacion ? [[ubicacion.lat, ubicacion.lng] as [number, number]] : []),
    ],
    [locales, ubicacion],
  );

  return (
    <MapContainer center={CENTRO_MALAGA} zoom={13} scrollWheelZoom className={className}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ControladorVista destino={destinoCamara} encuadre={encuadre} />

      {ubicacion && (
        <Marker position={[ubicacion.lat, ubicacion.lng]} icon={ICONO_TU} title="Estás aquí" />
      )}

      {locales.map((local) => (
        <Marker
          key={local.id}
          position={[local.lat, local.lng]}
          icon={crearIconoDurum(local.nota, local.id === seleccionadoId)}
          title={`${local.nombre} · ${formatearNota(local.nota)}`}
          zIndexOffset={local.id === seleccionadoId ? 1000 : 0}
          eventHandlers={{
            click: () => onSeleccionar(local.id),
          }}
        />
      ))}
    </MapContainer>
  );
}
