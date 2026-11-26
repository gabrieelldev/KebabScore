// =====================================================================
// useHidratado · ¿ya ha hidratado ESTE componente en el cliente?
// ---------------------------------------------------------------------
// `useSyncExternalStore` usa `getServerSnapshot` (false) en el servidor y
// durante la hidratación, y `getSnapshot` (true) justo después. Así el
// primer render del cliente coincide con el HTML del servidor aunque el
// componente hidrate tarde (p. ej. dentro de un <Suspense>), cuando los
// proveedores ya han leído localStorage.
// =====================================================================

'use client';

import { useSyncExternalStore } from 'react';

const suscribirNada = () => () => {};

export function useHidratado(): boolean {
  return useSyncExternalStore(
    suscribirNada,
    () => true,
    () => false,
  );
}
