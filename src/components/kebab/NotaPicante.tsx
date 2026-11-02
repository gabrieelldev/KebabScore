// =====================================================================
// NotaPicante · muestra una nota con su nivel ("8,9 · Fuego")
// ---------------------------------------------------------------------
// Accesibilidad: NUNCA dependemos solo del color. Siempre va el número
// en tipografía monoespaciada (como en el ticket) y, si no es compacto,
// el nombre del nivel.
// =====================================================================

import {
  formatearNota,
  nivelDeNota,
  NOMBRE_NIVEL,
  RESENAS_MINIMAS_FIABLES,
  type Nivel,
} from '@/lib/puntuacion';
import { TEXTOS } from '@/lib/textos';

const ESTILO_NIVEL: Record<Nivel, string> = {
  fuego: 'bg-guindilla text-crema border-guindilla',
  picante: 'bg-primario text-primario-texto border-primario',
  suave: 'bg-mostaza text-carbon border-mostaza',
  sosa: 'bg-superficie-alta text-texto-suave border-borde',
};

type Props = {
  nota: number | null;
  numResenas?: number;
  tamano?: 'sm' | 'md' | 'lg';
  mostrarNivel?: boolean;
};

export function NotaPicante({
  nota,
  numResenas,
  tamano = 'md',
  mostrarNivel = true,
}: Props) {
  if (nota === null) {
    return (
      <span className="inline-flex items-center rounded border border-dashed border-borde px-2 py-0.5 font-ticket text-xs text-texto-suave">
        {TEXTOS.sinNota}
      </span>
    );
  }

  const nivel = nivelDeNota(nota);
  const provisional =
    numResenas !== undefined && numResenas > 0 && numResenas < RESENAS_MINIMAS_FIABLES;

  const clasesTamano = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  }[tamano];

  return (
    <span
      className={`inline-flex items-center rounded border font-ticket font-bold leading-none ${clasesTamano} ${ESTILO_NIVEL[nivel]}`}
      title={
        provisional
          ? `Nota provisional (${numResenas} ${numResenas === 1 ? 'reseña' : 'reseñas'})`
          : `Nivel ${NOMBRE_NIVEL[nivel]}`
      }
    >
      <span>{formatearNota(nota)}</span>
      {mostrarNivel && (
        <span className="font-sans text-[0.7rem] font-semibold uppercase tracking-wider opacity-90">
          · {provisional ? 'provisional' : NOMBRE_NIVEL[nivel]}
        </span>
      )}
    </span>
  );
}
