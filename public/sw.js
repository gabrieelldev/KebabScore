// =====================================================================
// Service Worker de KebabScore Málaga (public/sw.js)
// ---------------------------------------------------------------------
// 1. Hace que KebabScore sea instalable (PWA) y guarda una caché rápida.
// 2. Entrega los AVISOS (notificaciones) sin ser pesado. La página deja
//    en Cache Storage un "buzón" con avisos candidatos
//    (src/lib/avisos/buzon.ts); aquí decidimos si toca enseñar uno.
//
// Reglas anti-pesadez:
//   · como mucho 1 aviso cada 20 h y 3 por semana;
//   · solo entre las 12:00 y las 23:30, hora de Málaga;
//   · cada aviso concreto, una sola vez;
//   · nunca si tienes la app abierta en pantalla;
//   · respetando los tipos que has desactivado y el modo sin sonido.
// =====================================================================

const CACHE_NAME = 'kebabscore-pwa-v3';
const URLS_BASE = ['/', '/ranking', '/misiones', '/icons/icon-192.png'];

// Deben coincidir con src/lib/avisos/buzon.ts
const CACHE_AVISOS = 'kebabscore-avisos';
const URL_BUZON = '/__avisos/buzon.json';
const URL_HISTORIAL = '/__avisos/historial.json';
const ETIQUETA_SYNC = 'kebabscore-avisos';

const HORA = 60 * 60 * 1000;
const SEPARACION_MINIMA = 20 * HORA;
const MAXIMO_SEMANAL = 3;
const VENTANA_INICIO = 12 * 60; // 12:00
const VENTANA_FIN = 23 * 60 + 30; // 23:30
const PRIORIDAD = { evento: 0, mision: 1, inactividad: 2 };
const PREFERENCIA_DE_TIPO = { evento: 'eventos', mision: 'misiones', inactividad: 'inactividad' };

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS_BASE))
      .catch(() => {}),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            // El buzón de avisos NO es caché de páginas: no se borra
            .filter((k) => k !== CACHE_NAME && k !== CACHE_AVISOS)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  );
});

// ---------------------------------------------------------------------
// Avisos
// ---------------------------------------------------------------------
async function leerJson(url, porDefecto) {
  try {
    const cache = await caches.open(CACHE_AVISOS);
    const res = await cache.match(url);
    return res ? await res.json() : porDefecto;
  } catch {
    return porDefecto;
  }
}

async function guardarJson(url, datos) {
  const cache = await caches.open(CACHE_AVISOS);
  await cache.put(url, new Response(JSON.stringify(datos), { headers: { 'Content-Type': 'application/json' } }));
}

/** Hora de Málaga en minutos desde medianoche. */
function minutosEnMalaga(fecha) {
  const partes = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(fecha);
  const h = Number(partes.find((p) => p.type === 'hour').value);
  const m = Number(partes.find((p) => p.type === 'minute').value);
  return h * 60 + m;
}

async function appEnPantalla() {
  const ventanas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  return ventanas.some((c) => c.visibilityState === 'visible');
}

/**
 * Elige el aviso que toca (o null) sin efectos secundarios: así se puede
 * probar aparte. `historial.mostrados` = [{ id, en }].
 */
function elegirAviso(buzon, historial, ahora) {
  if (!buzon || !buzon.preferencias || !buzon.preferencias.activos) return null;

  const minutos = minutosEnMalaga(new Date(ahora));
  if (minutos < VENTANA_INICIO || minutos > VENTANA_FIN) return null;

  const recientes = historial.mostrados.filter((m) => ahora - m.en < 7 * 24 * HORA);
  if (recientes.length >= MAXIMO_SEMANAL) return null;
  if (recientes.some((m) => ahora - m.en < SEPARACION_MINIMA)) return null;

  const yaVistos = new Set(historial.mostrados.map((m) => m.id));
  const p = buzon.preferencias;
  return (
    (buzon.candidatos || [])
      .filter((c) => p[PREFERENCIA_DE_TIPO[c.tipo]])
      .filter((c) => c.desde <= ahora && ahora < c.hasta && !yaVistos.has(c.id))
      .sort((a, b) => PRIORIDAD[a.tipo] - PRIORIDAD[b.tipo] || a.desde - b.desde)[0] || null
  );
}

/** Decide y, si toca, enseña UN aviso del buzón. */
async function revisarAvisos() {
  if (self.Notification && Notification.permission !== 'granted') return;
  if (await appEnPantalla()) return;

  const ahora = Date.now();
  const buzon = await leerJson(URL_BUZON, null);
  const historial = await leerJson(URL_HISTORIAL, { mostrados: [] });
  const aviso = elegirAviso(buzon, historial, ahora);
  if (!aviso) return;

  await self.registration.showNotification(aviso.titulo, {
    body: aviso.cuerpo,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-96.png',
    // Un aviso nuevo del mismo tipo sustituye al anterior en vez de apilarse
    tag: 'kebabscore-' + aviso.tipo,
    silent: Boolean(buzon.preferencias.silencio),
    data: { url: aviso.url },
  });

  historial.mostrados = [...historial.mostrados, { id: aviso.id, en: ahora }].slice(-50);
  await guardarJson(URL_HISTORIAL, historial);
}

// El navegador nos despierta cada ~12 h (apps instaladas en Chrome/Edge/Android)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === ETIQUETA_SYNC) event.waitUntil(revisarAvisos());
});

// Preparado para avisos enviados desde un servidor (Web Push) en el futuro,
// con las mismas reglas. Formato: {"id","tipo","titulo","cuerpo","url"}
self.addEventListener('push', (event) => {
  let datos = {};
  try {
    datos = event.data ? event.data.json() : {};
  } catch {
    datos = {};
  }
  event.waitUntil(
    (async () => {
      if (datos.titulo) {
        const buzon = await leerJson(URL_BUZON, null);
        if (!buzon) return;
        buzon.candidatos = [
          {
            id: datos.id || 'push:' + Date.now(),
            tipo: PRIORIDAD[datos.tipo] === undefined ? 'evento' : datos.tipo,
            titulo: String(datos.titulo),
            cuerpo: String(datos.cuerpo || ''),
            url: String(datos.url || '/'),
            desde: 0,
            hasta: Date.now() + 24 * HORA,
          },
          ...(buzon.candidatos || []),
        ];
        await guardarJson(URL_BUZON, buzon);
      }
      await revisarAvisos();
    })(),
  );
});

// Pulsar el aviso abre (o enfoca) la app en la pantalla que toca
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const ruta = (event.notification.data && event.notification.data.url) || '/';
  const destino = new URL(ruta, self.location.origin);
  // Solo rutas de la propia app
  const url = destino.origin === self.location.origin ? destino.href : self.location.origin + '/';
  event.waitUntil(
    (async () => {
      const ventanas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const ventana = ventanas.find((v) => 'focus' in v);
      if (ventana) {
        await ventana.focus();
        if ('navigate' in ventana) await ventana.navigate(url).catch(() => {});
        return;
      }
      await self.clients.openWindow(url);
    })(),
  );
});
