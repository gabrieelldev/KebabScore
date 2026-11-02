// =====================================================================
// Tipos del "dominio" de KebabScore: cómo representa la APP los datos.
// Incluye el desglose de las 6 subnotas (CapasKebab) y los tickets de
// reseñas para alimentar todas las pantallas de Stitch.
// =====================================================================

import type { ClaveSubnota } from '../puntuacion';

/** Franja de apertura. dia: 1 = lunes … 7 = domingo (ISO 8601). Horas "HH:MM". */
export type Franja = {
  dia: number;
  abre: string;
  /** Si cierra <= abre, la franja termina al día siguiente. */
  cierra: string;
};

export type Barrio = {
  slug: string;
  nombre: string;
  distrito: string;
};

export type MediasSubnotas = Record<ClaveSubnota, number>;

export type ResenaTicket = {
  id: string;
  codigoTicket: string;
  autorNombre: string;
  autorIniciales: string;
  autorRol?: string;
  plato: string;
  horaTexto: string;
  notas: MediasSubnotas;
  notaTotal: number;
  comentario: string;
  fotoUrl: string | null;
};

/** Información de un local para el inicio, el ranking y la ficha de detalle. */
export type LocalResumen = {
  id: string;
  slug: string;
  nombre: string;
  barrio: Pick<Barrio, 'slug' | 'nombre'>;
  direccion: string;
  lat: number;
  lng: number;
  precioDurumCentimos: number | null;
  halal: boolean;
  vegetariano: boolean;
  domicilio: boolean;
  panCasero?: boolean;
  insignia?: string;
  pesoGramos?: number;
  /** URL pública de la foto de portada (hotlink de Stitch o Supabase Storage). */
  fotoPortada: string | null;
  horario: Franja[];
  /** KebabScore medio del local, o null si aún no tiene reseñas. */
  nota: number | null;
  numResenas: number;
  /** Nota "justa" para ordenar rankings (media bayesiana). */
  notaRanking: number;
  /** Medias de las 6 capas del dürüm. */
  subnotas: MediasSubnotas;
  /** Últimos tickets auditados de ese local. */
  tickets: ResenaTicket[];
};
