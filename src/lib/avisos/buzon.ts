// =====================================================================
// Avisos de la app (notificaciones) · lado de la página
// ---------------------------------------------------------------------
// Cómo funciona, en tres piezas:
//
// 1. La PÁGINA (este archivo + GestorAvisos) prepara un "buzón": una
//    lista de avisos candidatos con la fecha a partir de la que se
//    pueden enseñar y hasta cuándo valen. Lo guarda en Cache Storage,
//    que es lo único que el service worker puede leer (no ve localStorage).
// 2. El SERVICE WORKER (public/sw.js) se despierta de vez en cuando con
//    Periodic Background Sync, lee el buzón y decide si enseña UNO,
//    aplicando las reglas anti-pesadez de abajo.
// 3. Los AJUSTES (AjustesAvisos) dejan activar/desactivar cada tipo.
//
// Reglas para no ser pesados (las aplica el service worker):
//   · Nunca se pide permiso al abrir la app: solo si el usuario lo pide.
//   · Como mucho 1 aviso cada 20 horas y 3 por semana.
//   · Solo entre las 12:00 y las 23:30 (hora de Málaga).
//   · Cada aviso concreto se enseña una sola vez.
//   · Nada si tienes la app abierta en pantalla.
//   · "Te echamos de menos" solo dos veces (a los 7 y a los 21 días) y
//     se reinicia cuando vuelves.
//   · Sin sonido por defecto.
// =====================================================================

import type { EventoEspecial, MisionCreador } from '@/lib/creador/contexto';

export type TipoAviso = 'evento' | 'mision' | 'inactividad';

export type PreferenciasAvisos = {
  /** Interruptor general (además del permiso del navegador). */
  activos: boolean;
  eventos: boolean;
  misiones: boolean;
  inactividad: boolean;
  /** true = la notificación llega sin sonido ni vibración. */
  silencio: boolean;
};

export type AvisoCandidato = {
  /** Identificador estable: el mismo aviso nunca se repite. */
  id: string;
  tipo: TipoAviso;
  titulo: string;
  cuerpo: string;
  url: string;
  /** Epoch ms a partir del cual se puede mostrar. */
  desde: number;
  /** Epoch ms a partir del cual ya no tiene sentido. */
  hasta: number;
};

export type Buzon = {
  version: 1;
  actualizado: number;
  ultimaVisita: number;
  preferencias: PreferenciasAvisos;
  candidatos: AvisoCandidato[];
};

export const PREFERENCIAS_INICIALES: PreferenciasAvisos = {
  activos: false,
  eventos: true,
  misiones: true,
  inactividad: true,
  silencio: true,
};

const CLAVE_PREFERENCIAS = 'kebabscore_avisos_v1';
const CLAVE_VISITAS = 'kebabscore_avisos_visitas_v1';
const CLAVE_SUGERENCIA = 'kebabscore_avisos_sugerencia_v1';

/** Deben coincidir con public/sw.js */
export const CACHE_AVISOS = 'kebabscore-avisos';
export const URL_BUZON = '/__avisos/buzon.json';
export const ETIQUETA_SYNC = 'kebabscore-avisos';

const HORA = 60 * 60 * 1000;
const DIA = 24 * HORA;

// ---------------------------------------------------------------------
// Preferencias y visitas (localStorage, con try/catch por modo privado)
// ---------------------------------------------------------------------
export function leerPreferencias(): PreferenciasAvisos {
  try {
    const raw = localStorage.getItem(CLAVE_PREFERENCIAS);
    if (raw) return { ...PREFERENCIAS_INICIALES, ...JSON.parse(raw) };
  } catch {
    // sin almacenamiento: valores por defecto
  }
  return PREFERENCIAS_INICIALES;
}

export function guardarPreferencias(p: PreferenciasAvisos): void {
  try {
    localStorage.setItem(CLAVE_PREFERENCIAS, JSON.stringify(p));
  } catch {
    // modo privado estricto
  }
}

type RegistroVisitas = { ultima: number; dias: string[] };

/** Apunta la visita de hoy y devuelve la visita ANTERIOR y los días distintos con visita. */
export function registrarVisita(ahora: number): { anterior: number | null; diasDistintos: number } {
  let registro: RegistroVisitas = { ultima: 0, dias: [] };
  try {
    const raw = localStorage.getItem(CLAVE_VISITAS);
    if (raw) registro = JSON.parse(raw);
  } catch {
    // ignorar
  }
  const hoy = new Date(ahora).toISOString().slice(0, 10);
  const dias = registro.dias.includes(hoy) ? registro.dias : [...registro.dias, hoy].slice(-30);
  try {
    localStorage.setItem(CLAVE_VISITAS, JSON.stringify({ ultima: ahora, dias }));
  } catch {
    // ignorar
  }
  return { anterior: registro.ultima || null, diasDistintos: dias.length };
}

/** Cuántos días distintos has abierto la app (de los últimos 30). */
export function diasConVisita(): number {
  try {
    const raw = localStorage.getItem(CLAVE_VISITAS);
    return raw ? (JSON.parse(raw) as RegistroVisitas).dias.length : 0;
  } catch {
    return 0;
  }
}

/** La tarjeta "¿Te avisamos?" se puede cerrar y no vuelve en 30 días. */
export function sugerenciaDescartadaRecientemente(ahora: number): boolean {
  try {
    const raw = localStorage.getItem(CLAVE_SUGERENCIA);
    return raw !== null && ahora - Number(raw) < 30 * DIA;
  } catch {
    return true;
  }
}

export function descartarSugerencia(ahora: number): void {
  try {
    localStorage.setItem(CLAVE_SUGERENCIA, String(ahora));
  } catch {
    // ignorar
  }
}

// ---------------------------------------------------------------------
// Soporte del dispositivo
// ---------------------------------------------------------------------
export type SoporteAvisos = {
  notificaciones: boolean;
  /** Avisos aunque la app esté cerrada (Periodic Background Sync). */
  segundoPlano: boolean;
  /** Abierta como app instalada (no en una pestaña). */
  instalada: boolean;
  permiso: NotificationPermission | 'no-disponible';
};

export async function comprobarSoporte(): Promise<SoporteAvisos> {
  const notificaciones = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
  const instalada =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true);
  let segundoPlano = false;
  if (notificaciones) {
    try {
      const reg = await navigator.serviceWorker.ready;
      segundoPlano = 'periodicSync' in reg;
    } catch {
      segundoPlano = false;
    }
  }
  return {
    notificaciones,
    segundoPlano,
    instalada,
    permiso: notificaciones ? Notification.permission : 'no-disponible',
  };
}

type RegistroConSync = ServiceWorkerRegistration & {
  periodicSync?: {
    register: (etiqueta: string, opciones: { minInterval: number }) => Promise<void>;
    unregister: (etiqueta: string) => Promise<void>;
  };
};

/** Pide al navegador que despierte al service worker cada ~12 h (si lo permite). */
export async function programarRevisiones(activar: boolean): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = (await navigator.serviceWorker.ready) as RegistroConSync;
    if (!reg.periodicSync) return;
    if (activar) {
      const estado = await navigator.permissions
        .query({ name: 'periodic-background-sync' as PermissionName })
        .catch(() => null);
      if (estado && estado.state === 'denied') return;
      await reg.periodicSync.register(ETIQUETA_SYNC, { minInterval: 12 * HORA });
    } else {
      await reg.periodicSync.unregister(ETIQUETA_SYNC);
    }
  } catch {
    // el navegador no lo permite (p. ej. app sin instalar): no pasa nada
  }
}

// ---------------------------------------------------------------------
// Construcción del buzón
// ---------------------------------------------------------------------
export function construirCandidatos(
  eventosActivos: EventoEspecial[],
  misionesActivas: MisionCreador[],
  ahora: number,
  ultimaVisita: number,
): AvisoCandidato[] {
  const candidatos: AvisoCandidato[] = [];

  // Eventos: un recordatorio por evento, a partir de mañana (hoy ya has
  // visto el banner dentro de la app) y durante 5 días.
  for (const e of eventosActivos) {
    candidatos.push({
      id: `evento:${e.id}`,
      tipo: 'evento',
      titulo: e.titulo,
      cuerpo: e.terminaTexto || e.subtitulo,
      url: e.enlaceBoton || '/',
      desde: ahora + 18 * HORA,
      hasta: ahora + 5 * DIA,
    });
  }

  // Misiones: solo las que tienes a punto (te falta 1 paso o llevas ≥ 2/3).
  for (const m of misionesActivas) {
    const faltan = m.progresoMeta - m.progresoActual;
    if (faltan <= 0) continue;
    if (faltan > 1 && m.progresoActual / m.progresoMeta < 2 / 3) continue;
    candidatos.push({
      id: `mision:${m.id}:${m.progresoActual}`,
      tipo: 'mision',
      titulo: faltan === 1 ? `Te falta 1 para «${m.titulo}»` : `«${m.titulo}» está a tiro`,
      cuerpo: `${m.progresoActual}/${m.progresoMeta} · +${m.xp} XP y ${m.recompensa}.`,
      url: m.enlaceAccion || '/misiones',
      desde: ahora + 20 * HORA,
      hasta: ahora + 7 * DIA,
    });
  }

  // Inactividad: dos toques como mucho, ligados a la visita de hoy.
  // El id incluye la visita, así se "reinicia" cada vez que vuelves.
  candidatos.push(
    {
      id: `inactividad:7:${ultimaVisita}`,
      tipo: 'inactividad',
      titulo: 'La plancha sigue encendida',
      cuerpo: 'Hace una semana que no pasas. Mira qué locales han subido en la Carta Luminosa.',
      url: '/ranking',
      desde: ultimaVisita + 7 * DIA,
      hasta: ultimaVisita + 14 * DIA,
    },
    {
      id: `inactividad:21:${ultimaVisita}`,
      tipo: 'inactividad',
      titulo: '¿Sigues cenando kebab?',
      cuerpo: 'Tus misiones siguen ahí. Un ticket y vuelves a sumar XP.',
      url: '/misiones',
      desde: ultimaVisita + 21 * DIA,
      hasta: ultimaVisita + 30 * DIA,
    },
  );

  return candidatos;
}

export async function escribirBuzon(buzon: Buzon): Promise<void> {
  if (typeof caches === 'undefined') return;
  try {
    const cache = await caches.open(CACHE_AVISOS);
    await cache.put(
      URL_BUZON,
      new Response(JSON.stringify(buzon), { headers: { 'Content-Type': 'application/json' } }),
    );
  } catch {
    // sin Cache Storage (p. ej. navegación privada): no hay avisos en segundo plano
  }
}

/** Notificación de prueba inmediata (no cuenta para los límites). */
export async function enviarAvisoDePrueba(silencio: boolean): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification('Así te llegarán los avisos', {
      body: 'Pocos y a buena hora: eventos, misiones a punto y algún recordatorio si desapareces.',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-96.png',
      tag: 'kebabscore-prueba',
      silent: silencio,
      data: { url: '/misiones' },
    });
    return true;
  } catch {
    return false;
  }
}
