// =====================================================================
// IlustracionDurum · dibujo SVG cuando el local aún no tiene foto real
// ---------------------------------------------------------------------
// Prohibidas las fotos de stock: si todavía nadie ha subido foto de un
// kebab, mostramos este dürüm en corte con el estilo de la carta luminosa.
// aria-hidden="true" porque es decorativo (el nombre del local ya va al lado).
// =====================================================================

export function IlustracionDurum({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Fondo de chapa oscura */}
      <rect width="80" height="80" rx="8" fill="#1A1411" />
      {/* Papel de aluminio abajo */}
      <path
        d="M22 46 L58 46 L53 70 C52 73 49 74 46 74 L34 74 C31 74 28 73 27 70 Z"
        fill="#C9B9A0"
        opacity="0.85"
      />
      <path d="M25 54 L55 54 M26 62 L54 62" stroke="#1A1411" strokeWidth="1.5" opacity="0.4" />
      {/* Pan de dürüm */}
      <path
        d="M20 26 C20 18 60 18 60 26 L58 48 L22 48 Z"
        fill="#EADBC0"
        stroke="#FF7A1F"
        strokeWidth="1.5"
      />
      {/* Boca del dürüm visto en corte: las capas del relleno */}
      <ellipse cx="40" cy="24" rx="20" ry="8" fill="#251D18" stroke="#EADBC0" strokeWidth="2" />
      {/* Carne */}
      <circle cx="33" cy="24" r="3.5" fill="#A9430A" />
      <circle cx="43" cy="26" r="3" fill="#FF7A1F" />
      <circle cx="47" cy="22" r="2.8" fill="#A9430A" />
      {/* Lechuga */}
      <path d="M25 23 Q30 19 36 22" stroke="#7ED957" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M44 21 Q50 19 54 23" stroke="#7ED957" strokeWidth="2.2" strokeLinecap="round" />
      {/* Tomate / guindilla */}
      <circle cx="38" cy="22" r="2.2" fill="#FF4A3D" />
      {/* Chorro de salsa de yogur */}
      <path
        d="M29 25 Q35 28 40 24 T51 25"
        stroke="#F7EEDB"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
