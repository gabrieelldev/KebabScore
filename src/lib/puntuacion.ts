// =====================================================================
// Todo lo relacionado con NOTAS: pesos, niveles de "picante" y formatos.
// Es código puro (sin React ni base de datos), así que sirve igual en el
// servidor, en el navegador y en los tests.
// =====================================================================

/** Las 6 subnotas, en el orden en que se apilan las capas del dürüm (de dentro a fuera). */
export const SUBNOTAS = [
  { clave: 'meat', nombre: 'Carne', peso: 0.3 },
  { clave: 'sauces', nombre: 'Salsas', peso: 0.2 },
  { clave: 'bread', nombre: 'Pan', peso: 0.15 },
  { clave: 'value', nombre: 'Tamaño / precio', peso: 0.15 },
  { clave: 'freshness', nombre: 'Verdura / frescura', peso: 0.1 },
  { clave: 'night', nombre: 'Horario nocturno', peso: 0.1 },
] as const;
// ⚠️ Estos pesos están también en supabase/migrations/0001_tablas.sql (columna "score").
// La BD es la que manda; aquí solo los usamos para la vista previa del ticket.

export type ClaveSubnota = (typeof SUBNOTAS)[number]['clave'];

/** Calcula el KebabScore de una reseña (igual que la columna generada de la BD). */
export function calcularKebabScore(notas: Record<ClaveSubnota, number>): number {
  const total = SUBNOTAS.reduce((suma, s) => suma + notas[s.clave] * s.peso, 0);
  return Math.round(total * 10) / 10;
}

// ---------- Media bayesiana (para ordenar rankings) ----------
// Mismos valores que la vista venue_scores (0002_vistas_y_triggers.sql).
export const C_BAYES = 5; // reseñas "imaginarias" con las que empieza cada local
export const M_BAYES = 6.5; // nota de esas reseñas imaginarias

export function notaBayesiana(media: number | null, numResenas: number): number {
  if (media === null || numResenas === 0) return M_BAYES;
  return (C_BAYES * M_BAYES + media * numResenas) / (C_BAYES + numResenas);
}

/** Por debajo de este número de reseñas mostramos la nota como "provisional". */
export const RESENAS_MINIMAS_FIABLES = 3;

// ---------- Niveles de picante ----------
// Cuanto más picante, mejor. El color NUNCA va solo: siempre con número y nombre
// (hay personas que no distinguen bien los colores).
export type Nivel = 'sosa' | 'suave' | 'picante' | 'fuego';

export function nivelDeNota(nota: number): Nivel {
  if (nota >= 8.5) return 'fuego';
  if (nota >= 7) return 'picante';
  if (nota >= 5) return 'suave';
  return 'sosa';
}

export const NOMBRE_NIVEL: Record<Nivel, string> = {
  sosa: 'Sosa',
  suave: 'Suave',
  picante: 'Picante',
  fuego: 'Fuego',
};

/** Devuelve tanto la clave como la etiqueta legible del nivel de picante. */
export function infoNivelPicante(nota: number | null): {
  nivel: Nivel;
  etiqueta: string;
} {
  const valor = nota ?? 6.5;
  const nivel = nivelDeNota(valor);
  return {
    nivel,
    etiqueta: NOMBRE_NIVEL[nivel],
  };
}

// ---------- Formatos en español ----------
// Intl.NumberFormat usa la coma decimal española: 8.7 → "8,7".
const formatoNota = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const formatoPrecio = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

export function formatearNota(nota: number | null): string {
  if (nota === null) return '—';
  return formatoNota.format(nota);
}

export function formatearPrecio(centimos: number | null): string {
  if (centimos === null) return '—';
  return formatoPrecio.format(centimos / 100);
}
