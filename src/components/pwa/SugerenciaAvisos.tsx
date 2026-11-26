// =====================================================================
// SugerenciaAvisos · tarjeta discreta "¿Te avisamos?" en la portada
// ---------------------------------------------------------------------
// No es el diálogo del navegador: es una tarjeta nuestra que solo sale
// si tiene sentido, y el permiso real solo se pide si pulsas "Sí".
//   · con la app instalada, o tras abrirla 3 días distintos;
//   · si aún no has dicho ni que sí ni que no al navegador;
//   · si pulsas "Ahora no", no vuelve en 30 días.
// =====================================================================

'use client';

import { useState } from 'react';
import { Icono } from '@/components/ui/Icono';
import {
  descartarSugerencia,
  diasConVisita,
  sugerenciaDescartadaRecientemente,
} from '@/lib/avisos/buzon';
import { useAvisos } from '@/lib/avisos/useAvisos';

export function SugerenciaAvisos() {
  const { preferencias, soporte, activar } = useAvisos();
  const [cerrada, setCerrada] = useState(false);
  // Se calcula una vez al montar (lee localStorage y la hora)
  const [historial] = useState(() =>
    typeof window === 'undefined'
      ? { dias: 0, descartada: true }
      : { dias: diasConVisita(), descartada: sugerenciaDescartadaRecientemente(Date.now()) },
  );

  // `soporte` es null en el servidor y al hidratar: hasta entonces no se pinta
  const toca =
    soporte !== null &&
    soporte.notificaciones &&
    soporte.permiso === 'default' &&
    !preferencias.activos &&
    (soporte.instalada || historial.dias >= 3) &&
    !historial.descartada;

  if (cerrada || !toca) return null;

  return (
    <section aria-label="Avisos de la app" className="px-4 py-2">
      <div className="flex items-start gap-3 rounded-xl border border-acento/25 bg-superficie-baja px-3.5 py-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primario/15 text-acento">
          <Icono nombre="bolt" className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-rotulo text-base uppercase leading-tight tracking-wide text-texto">
            ¿Te avisamos de los eventos?
          </p>
          <p className="mt-0.5 text-xs leading-snug text-texto-suave">
            Doble Brasa, misiones a punto… Como mucho uno al día y nunca mientras usas la app.
          </p>
          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              onClick={async () => {
                await activar();
                setCerrada(true);
              }}
              className="rounded-lg bg-primario px-3 py-1.5 font-ticket text-xs font-bold uppercase text-carbon"
            >
              Sí, avísame
            </button>
            <button
              type="button"
              onClick={() => {
                descartarSugerencia(Date.now());
                setCerrada(true);
              }}
              className="rounded-lg px-3 py-1.5 font-ticket text-xs font-bold uppercase text-texto-suave hover:text-texto"
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
