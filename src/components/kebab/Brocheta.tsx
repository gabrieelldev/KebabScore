// =====================================================================
// Brocheta · separador decorativo bajo los rótulos de sección
// ---------------------------------------------------------------------
// Un pincho con trozos de carne, cebolla, pimiento y tomate. Sustituye
// a la típica línea de subrayado genérica y firma cada sección con la
// identidad del asador. Es decorativo: aria-hidden.
// =====================================================================

type Props = {
  className?: string;
};

const TROZOS: ReadonlyArray<{ x: number; ancho: number; color: string; radio: number }> = [
  { x: 10, ancho: 13, color: 'var(--brasa-700)', radio: 3 },
  { x: 25, ancho: 6, color: 'var(--crema-200)', radio: 3 },
  { x: 33, ancho: 12, color: 'var(--brasa-500)', radio: 3 },
  { x: 47, ancho: 6, color: 'var(--lechuga-400)', radio: 2 },
  { x: 55, ancho: 13, color: 'var(--brasa-700)', radio: 3 },
  { x: 70, ancho: 7, color: 'var(--guindilla-500)', radio: 4 },
  { x: 79, ancho: 12, color: 'var(--brasa-500)', radio: 3 },
];

export function Brocheta({ className = '' }: Props) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 112 14"
      className={`h-3.5 w-28 ${className}`}
      fill="none"
    >
      {/* Varilla de acero */}
      <line x1="2" y1="7" x2="108" y2="7" stroke="var(--texto-apagado)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="3" cy="7" r="2.2" fill="var(--texto-apagado)" />
      {TROZOS.map((t) => (
        <rect
          key={t.x}
          x={t.x}
          y={7 - 5}
          width={t.ancho}
          height={10}
          rx={t.radio}
          fill={t.color}
          stroke="var(--fondo)"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}
