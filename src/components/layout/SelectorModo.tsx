// =====================================================================
// SelectorModo · interruptor Auto / 3 AM / Terraza (estilo Stitch)
// =====================================================================

'use client';

import { useLayoutEffect, useState } from 'react';
import { CLAVE_MODO, temaAutomatico, type Modo } from '@/lib/tema';

const OPCIONES: ReadonlyArray<{ valor: Modo; etiqueta: string; descripcion: string }> = [
  { valor: 'auto', etiqueta: 'Auto', descripcion: 'Neón al atardecer de Málaga' },
  { valor: 'noche', etiqueta: '3 AM', descripcion: 'Forzar modo noche (neón)' },
  { valor: 'dia', etiqueta: 'Terraza', descripcion: 'Forzar modo día' },
];

function aplicarEnDocumento(modo: Modo) {
  const tema = modo === 'auto' ? temaAutomatico() : modo;
  document.documentElement.setAttribute('data-tema', tema);
  document.documentElement.setAttribute('data-modo', modo);
}

export function SelectorModo() {
  const [modo, setModo] = useState<Modo>(() => {
    if (typeof window === 'undefined') return 'auto';
    const guardado = localStorage.getItem(CLAVE_MODO);
    return guardado === 'dia' || guardado === 'noche' ? guardado : 'auto';
  });

  useLayoutEffect(() => {
    aplicarEnDocumento(modo);
  }, [modo]);

  function cambiar(nuevo: Modo) {
    setModo(nuevo);
    try {
      if (nuevo === 'auto') localStorage.removeItem(CLAVE_MODO);
      else localStorage.setItem(CLAVE_MODO, nuevo);
    } catch {
      // modo privado estricto
    }
    aplicarEnDocumento(nuevo);
  }

  return (
    <div
      role="group"
      aria-label="Ambiente de la web"
      className="flex items-center rounded-full border border-white/10 bg-carbon-800/90 p-0.5 backdrop-blur-md"
    >
      {OPCIONES.map((op) => {
        const activo = modo === op.valor;
        return (
          <button
            key={op.valor}
            type="button"
            onClick={() => cambiar(op.valor)}
            aria-pressed={activo}
            title={op.descripcion}
            suppressHydrationWarning
            className={`rounded-full px-2.5 py-0.5 font-ticket text-[11px] transition-all ${
              activo
                ? 'bg-gradient-to-r from-brasa-orange to-[#ff6014] font-bold text-carbon-900 shadow-[0_2px_8px_rgba(255,122,31,0.4)]'
                : 'text-crema-500 hover:text-crema-100'
            }`}
          >
            {op.etiqueta}
          </button>
        );
      })}
    </div>
  );
}
