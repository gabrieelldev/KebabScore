// =====================================================================
// InstaladorPwa · Registra el Service Worker y muestra el botón Instalar
// ---------------------------------------------------------------------
// Explicación para 1.º de DAW:
// 1. Al montar en el navegador, registra `/sw.js` en `navigator.serviceWorker`.
// 2. Escucha el evento `beforeinstallprompt` que disparan Chrome, Edge y
//    Android cuando detectan que la web cumple todos los requisitos de
//    una PWA (HTTPS / localhost + manifest + service worker).
// 3. Si el evento está disponible, muestra una barra discreta para que
//    el usuario instale KebabScore en la pantalla de inicio de su móvil
//    con un solo toque.
// =====================================================================

'use client';

import { useEffect, useState } from 'react';
import { Icono } from '@/components/ui/Icono';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstaladorPwa() {
  const [eventoInstalar, setEventoInstalar] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [ocultado, setOcultado] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const manejador = (e: Event) => {
      e.preventDefault();
      setEventoInstalar(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', manejador);
    return () => window.removeEventListener('beforeinstallprompt', manejador);
  }, []);

  if (!eventoInstalar || ocultado) return null;

  async function instalarApp() {
    if (!eventoInstalar) return;
    await eventoInstalar.prompt();
    const { outcome } = await eventoInstalar.userChoice;
    if (outcome === 'accepted') {
      setEventoInstalar(null);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-2">
      <div className="flex items-center justify-between gap-2 rounded-xl border border-[#35C759]/40 bg-[#1B1613] px-3.5 py-2.5 shadow-lg">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#35C759]/20 text-[#35C759]">
            <Icono nombre="bolt" className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-rotulo text-sm uppercase tracking-wide text-[#F5EFE6]">
              Instalar App KebabScore
            </p>
            <p className="truncate font-ticket text-[10px] text-[#C9B9A6]">
              Acceso directo 3 AM en tu pantalla de inicio
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={instalarApp}
            className="rounded-lg bg-[#35C759] px-3 py-1.5 font-rotulo text-xs uppercase tracking-wider text-[#120F0D]"
          >
            Instalar
          </button>
          <button
            type="button"
            onClick={() => setOcultado(true)}
            aria-label="Cerrar aviso de instalación"
            className="rounded p-1 text-[#C9B9A6] hover:text-[#F5EFE6]"
          >
            <Icono nombre="close" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
