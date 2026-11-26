// =====================================================================
// useAvisos · estado de los avisos para los componentes de ajustes
// ---------------------------------------------------------------------
// Lee preferencias y soporte del dispositivo, y expone activar/desactivar.
// Cada cambio se guarda y se anuncia con un evento del navegador para que
// GestorAvisos (montado en el layout) reescriba el buzón al momento.
// =====================================================================

'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  PREFERENCIAS_INICIALES,
  comprobarSoporte,
  guardarPreferencias,
  leerPreferencias,
  programarRevisiones,
  type PreferenciasAvisos,
  type SoporteAvisos,
} from './buzon';

export const EVENTO_CAMBIO_AVISOS = 'kebabscore:avisos-cambio';

export function useAvisos() {
  // Leer localStorage al iniciar es seguro: lo que se pinta depende también
  // de `soporte`, que es null hasta después de hidratar.
  const [preferencias, setPreferencias] = useState<PreferenciasAvisos>(() =>
    typeof window === 'undefined' ? PREFERENCIAS_INICIALES : leerPreferencias(),
  );
  const [soporte, setSoporte] = useState<SoporteAvisos | null>(null);

  useEffect(() => {
    comprobarSoporte().then(setSoporte);
    const alCambiar = () => setPreferencias(leerPreferencias());
    window.addEventListener(EVENTO_CAMBIO_AVISOS, alCambiar);
    return () => window.removeEventListener(EVENTO_CAMBIO_AVISOS, alCambiar);
  }, []);

  const actualizar = useCallback((parcial: Partial<PreferenciasAvisos>) => {
    const nuevas = { ...leerPreferencias(), ...parcial };
    guardarPreferencias(nuevas);
    setPreferencias(nuevas);
    window.dispatchEvent(new Event(EVENTO_CAMBIO_AVISOS));
    return nuevas;
  }, []);

  /** Pide permiso (solo aquí, tras un toque del usuario) y enciende los avisos. */
  const activar = useCallback(async (): Promise<NotificationPermission | 'no-disponible'> => {
    if (!('Notification' in window)) return 'no-disponible';
    let permiso = Notification.permission;
    if (permiso === 'default') permiso = await Notification.requestPermission();
    if (permiso === 'granted') {
      actualizar({ activos: true });
      await programarRevisiones(true);
    }
    setSoporte(await comprobarSoporte());
    return permiso;
  }, [actualizar]);

  const desactivar = useCallback(async () => {
    actualizar({ activos: false });
    await programarRevisiones(false);
  }, [actualizar]);

  return { preferencias, soporte, actualizar, activar, desactivar };
}
