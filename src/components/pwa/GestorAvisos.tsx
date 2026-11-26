// =====================================================================
// GestorAvisos · mantiene al día el buzón de avisos (no pinta nada)
// ---------------------------------------------------------------------
// Va en el layout. Cada vez que abres la app, vuelves a ella o cambian
// los eventos, las misiones o tus preferencias, reescribe el buzón que
// lee el service worker (ver src/lib/avisos/buzon.ts).
// =====================================================================

'use client';

import { useEffect } from 'react';
import {
  construirCandidatos,
  escribirBuzon,
  leerPreferencias,
  programarRevisiones,
  registrarVisita,
} from '@/lib/avisos/buzon';
import { EVENTO_CAMBIO_AVISOS } from '@/lib/avisos/useAvisos';
import { useCreador } from '@/lib/creador/contexto';

export function GestorAvisos() {
  const { hidratado, eventosActivos, misionesActivas } = useCreador();

  useEffect(() => {
    if (!hidratado) return;

    const actualizarBuzon = () => {
      const ahora = Date.now();
      const preferencias = leerPreferencias();
      void escribirBuzon({
        version: 1,
        actualizado: ahora,
        ultimaVisita: ahora,
        preferencias,
        candidatos: construirCandidatos(eventosActivos, misionesActivas, ahora, ahora),
      });
      // Si el usuario los tiene activados, nos aseguramos de que el
      // navegador siga despertando al service worker.
      if (preferencias.activos && 'Notification' in window && Notification.permission === 'granted') {
        void programarRevisiones(true);
      }
    };

    registrarVisita(Date.now());
    actualizarBuzon();

    const alVolver = () => {
      if (document.visibilityState === 'visible') {
        registrarVisita(Date.now());
        actualizarBuzon();
      }
    };
    document.addEventListener('visibilitychange', alVolver);
    window.addEventListener(EVENTO_CAMBIO_AVISOS, actualizarBuzon);
    return () => {
      document.removeEventListener('visibilitychange', alVolver);
      window.removeEventListener(EVENTO_CAMBIO_AVISOS, actualizarBuzon);
    };
  }, [hidratado, eventosActivos, misionesActivas]);

  return null;
}
