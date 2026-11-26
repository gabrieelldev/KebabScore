// =====================================================================
// Geometría para el Radar de Asadores y el mapa: distancias, rumbos y
// proyección a un plano local. Código puro (sin React).
// =====================================================================

export type Coordenadas = { lat: number; lng: number };

/** Plaza de la Constitución: centro del radar si no sabemos dónde estás. */
export const CENTRO_MALAGA: Coordenadas = { lat: 36.7213, lng: -4.4214 };

const aRad = (g: number) => (g * Math.PI) / 180;

/** Distancia aproximada en km entre dos coordenadas (fórmula de Haversine). */
export function distanciaKm(a: Coordenadas, b: Coordenadas): number {
  const dLat = aRad(b.lat - a.lat);
  const dLng = aRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(aRad(a.lat)) * Math.cos(aRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Proyecta `punto` en km respecto a `centro` (x hacia el este, y hacia el
 * norte). A escala de ciudad la aproximación equirectangular es de sobra.
 */
export function proyectarKm(centro: Coordenadas, punto: Coordenadas): { x: number; y: number } {
  return {
    x: (punto.lng - centro.lng) * 111.32 * Math.cos(aRad(centro.lat)),
    y: (punto.lat - centro.lat) * 110.57,
  };
}

/** Rumbo en grados (0 = norte, 90 = este), en sentido horario. */
export function rumboGrados(centro: Coordenadas, punto: Coordenadas): number {
  const { x, y } = proyectarKm(centro, punto);
  return ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360;
}

/** "350 m", "1,2 km", "12 km". */
export function formatearDistancia(km: number): string {
  if (km < 1) return `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m`;
  return `${km.toLocaleString('es-ES', { maximumFractionDigits: km < 10 ? 1 : 0 })} km`;
}

/**
 * Alcance "redondo" del radar. Los anillos van a 1/3, 2/3 y 3/3, así que
 * los escalones están elegidos para que los tres salgan en números limpios
 * (0,6 km → 200 m · 400 m · 600 m; 3 km → 1 · 2 · 3 km…).
 */
export function alcanceRadarKm(distancia: number): number {
  const escalones = [0.3, 0.6, 0.9, 1.5, 3, 4.5, 6, 9, 15, 30, 60];
  return escalones.find((e) => distancia <= e * 0.92) ?? escalones[escalones.length - 1];
}
