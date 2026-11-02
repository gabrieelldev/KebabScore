// =====================================================================
// TrompoCarga · el asador vertical girando
// ---------------------------------------------------------------------
// Lo usamos cuando se está descargando el mapa o navegando a otra página.
// Lleva role="status" para que un lector de pantalla anuncie "Cortando
// lámina…", y con prefers-reduced-motion el giro se detiene solo (CSS).
// =====================================================================

import { TEXTOS } from '@/lib/textos';

export function TrompoCarga({ mensaje = TEXTOS.cargando }: { mensaje?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 p-8 text-center"
    >
      <svg
        viewBox="0 0 80 110"
        className="h-24 w-20"
        aria-hidden="true"
      >
        {/* Barra metálica vertical del asador */}
        <line x1="40" y1="6" x2="40" y2="104" stroke="#C9B9A0" strokeWidth="3" strokeLinecap="round" />
        <polygon points="34,102 46,102 40,94" fill="#C9B9A0" />

        {/* Cono de carne que "gira" con una animación de pulso horizontal */}
        <g className="origin-center animate-pulse">
          <path
            d="M20 20 C20 14 60 14 60 20 L54 84 C54 88 26 88 26 84 Z"
            fill="#A9430A"
            stroke="#FF7A1F"
            strokeWidth="2"
          />
          {/* Capas del trompo */}
          <path d="M22 32 Q40 37 58 32" stroke="#FF9447" strokeWidth="2.5" fill="none" />
          <path d="M24 48 Q40 53 56 48" stroke="#F7EEDB" strokeWidth="2" strokeOpacity="0.5" fill="none" />
          <path d="M25 64 Q40 69 55 64" stroke="#FF9447" strokeWidth="2.5" fill="none" />
          <path d="M26 78 Q40 82 54 78" stroke="#FF4A3D" strokeWidth="2" fill="none" />
        </g>

        {/* Lámina recién cortada cayendo a la derecha */}
        <path
          d="M62 42 Q68 50 64 60"
          stroke="#FF7A1F"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <p className="font-ticket text-xs uppercase tracking-widest text-texto-suave">{mensaje}</p>
    </div>
  );
}
