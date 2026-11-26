// =====================================================================
// SelectorModo · interruptor Auto / 3 AM / Terraza (estilo Stitch)
// =====================================================================

'use client';

import { useLayoutEffect, useState } from 'react';
import { Icono, type NombreIcono } from '@/components/ui/Icono';
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

const ICONO_MODO: Record<Modo, NombreIcono> = {
  auto: 'brightness_auto',
  noche: 'dark_mode',
  dia: 'light_mode',
};
const SIGUIENTE: Record<Modo, Modo> = { auto: 'noche', noche: 'dia', dia: 'auto' };

type Props = {
  /** Un único botón redondo que rota Auto → 3 AM → Terraza (para cabeceras estrechas). */
  compacto?: boolean;
};

export function SelectorModo({ compacto = false }: Props) {
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

  if (compacto) {
    // Los tres iconos se pintan siempre y el CSS muestra el del `data-modo`
    // actual (lo fija el script del <head>), así no hay saltos al hidratar.
    const actual = OPCIONES.find((o) => o.valor === modo) ?? OPCIONES[0];
    return (
      <button
        type="button"
        onClick={() => cambiar(SIGUIENTE[modo])}
        aria-label={`Ambiente: ${actual.etiqueta}. Pulsa para cambiar`}
        title={actual.descripcion}
        suppressHydrationWarning
        className="selector-compacto flex h-9 w-9 items-center justify-center rounded-full border border-linea/15 bg-superficie-baja/90 text-acento transition-transform active:scale-90"
      >
        {OPCIONES.map((op) => (
          <span key={op.valor} data-icono-modo={op.valor}>
            <Icono nombre={ICONO_MODO[op.valor]} className="h-[18px] w-[18px]" />
          </span>
        ))}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Ambiente de la web"
      className="flex items-center rounded-full border border-linea/10 bg-superficie-baja/90 p-0.5 backdrop-blur-md"
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
                : 'text-texto-apagado hover:text-texto'
            }`}
          >
            {op.etiqueta}
          </button>
        );
      })}
    </div>
  );
}
