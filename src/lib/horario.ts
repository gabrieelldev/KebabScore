// =====================================================================
// "¿Abierto ahora?" · la trampa del kebab
// ---------------------------------------------------------------------
// Un sábado a las 02:00 el local está abierto gracias a la franja del
// VIERNES (20:00 → 04:00). Por eso miramos las franjas de hoy y también
// las de ayer que cruzan la medianoche.
//
// Siempre usamos la hora de Madrid: el servidor de Vercel funciona en UTC
// y el móvil del usuario podría tener otra zona horaria.
// =====================================================================

import type { Franja } from './datos/tipos';

const ZONA = 'Europe/Madrid';

// Formateador reutilizable (crearlo es caro, usarlo es barato).
// Usamos 'en-US' solo para que los nombres de día sean fáciles de leer en código.
const formateadorMadrid = new Intl.DateTimeFormat('en-US', {
  timeZone: ZONA,
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const DIA_ISO: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

/** Día de la semana (1 = lunes) y minutos desde las 00:00 en Madrid. */
export function ahoraEnMadrid(fecha: Date): { dia: number; minutos: number } {
  const partes = formateadorMadrid.formatToParts(fecha);
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '0';
  return {
    dia: DIA_ISO[valor('weekday')],
    minutos: Number(valor('hour')) * 60 + Number(valor('minute')),
  };
}

/** "20:30" → 1230 */
function aMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

const diaAnterior = (dia: number) => (dia === 1 ? 7 : dia - 1);

/** Devuelve la franja que está activa en este momento, o null si está cerrado. */
export function franjaActiva(horario: Franja[], fecha: Date): Franja | null {
  const { dia, minutos } = ahoraEnMadrid(fecha);
  const ayer = diaAnterior(dia);

  return (
    horario.find((f) => {
      const abre = aMinutos(f.abre);
      const cierra = aMinutos(f.cierra);
      const cruzaMedianoche = cierra <= abre;

      // Franja de HOY: desde que abre hasta que cierra (o hasta medianoche si cruza)
      if (f.dia === dia) {
        return cruzaMedianoche ? minutos >= abre : minutos >= abre && minutos < cierra;
      }
      // Franja de AYER que sigue abierta de madrugada
      if (f.dia === ayer && cruzaMedianoche) {
        return minutos < cierra;
      }
      return false;
    }) ?? null
  );
}

export function estaAbierto(horario: Franja[], fecha: Date): boolean {
  return franjaActiva(horario, fecha) !== null;
}

export type EstadoHorario = { abierto: boolean; texto: string };

/** Texto corto para listados: "Cierra a las 03:00" / "Abre hoy a las 20:00" / "Cerrado hoy". */
export function estadoHorario(horario: Franja[], fecha: Date): EstadoHorario {
  const activa = franjaActiva(horario, fecha);
  if (activa) return { abierto: true, texto: `Cierra a las ${activa.cierra}` };

  const { dia, minutos } = ahoraEnMadrid(fecha);
  const proximaHoy = horario
    .filter((f) => f.dia === dia && aMinutos(f.abre) > minutos)
    .sort((a, b) => aMinutos(a.abre) - aMinutos(b.abre))[0];

  if (proximaHoy) return { abierto: false, texto: `Abre hoy a las ${proximaHoy.abre}` };
  return { abierto: false, texto: 'Hoy ya no abre' };
}
