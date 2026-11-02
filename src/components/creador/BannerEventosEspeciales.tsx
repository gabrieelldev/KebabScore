// =====================================================================
// BannerEventosEspeciales · Muestra los Eventos Especiales activos
// ---------------------------------------------------------------------
// Cuando tú (como creador) activas un Evento Especial desde `/creador`
// (por ejemplo, "Viernes de Doble Brasa · x2 XP" o un torneo entre
// barrios), este banner se enciende automáticamente en el Inicio y en
// la pantalla de Misiones.
// =====================================================================

'use client';

import Link from 'next/link';
import { Icono } from '@/components/ui/Icono';
import { useCreador } from '@/lib/creador/contexto';

export function BannerEventosEspeciales() {
  const { eventosActivos, modoCreadorActivo } = useCreador();

  if (eventosActivos.length === 0) return null;

  return (
    <section aria-label="Eventos especiales en vivo" className="space-y-2.5 px-4 pt-3">
      {eventosActivos.map((evt) => (
        <div
          key={evt.id}
          style={{ borderColor: `${evt.colorAcento}66` }}
          className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-[#241D18] via-[#1B1613] to-[#120F0D] p-3.5 shadow-[0_10px_28px_rgba(0,0,0,0.6)]"
        >
          <div
            aria-hidden="true"
            style={{ backgroundColor: evt.colorAcento }}
            className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-15 blur-2xl"
          />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  backgroundColor: `${evt.colorAcento}22`,
                  color: evt.colorAcento,
                  borderColor: `${evt.colorAcento}55`,
                }}
                className="inline-flex items-center gap-1 rounded border px-2 py-0.5 font-ticket text-[10px] font-bold uppercase tracking-wider"
              >
                <Icono nombre="bolt" className="h-3 w-3" />
                {evt.etiqueta}
              </span>
              <span className="rounded bg-[#120F0D] px-2 py-0.5 font-ticket text-[10px] font-bold text-[#F2C14E]">
                x{evt.multiplicadorXp} XP
              </span>
            </div>

            <span className="font-ticket text-[10px] text-[#C9B9A6]">
              {evt.terminaTexto}
            </span>
          </div>

          <h2 className="relative z-10 mt-1.5 font-rotulo text-xl uppercase leading-tight tracking-wide text-[#F5EFE6]">
            {evt.titulo}
          </h2>
          <p className="relative z-10 mt-1 text-xs leading-relaxed text-[#C9B9A6]">
            {evt.subtitulo}
          </p>

          <div className="relative z-10 mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2.5">
            <Link
              href={evt.enlaceBoton}
              style={{ backgroundColor: evt.colorAcento }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-rotulo text-xs uppercase tracking-wider text-[#120F0D] font-bold transition-transform active:scale-95"
            >
              <span>{evt.textoBoton}</span>
              <Icono nombre="arrow_forward" className="h-3.5 w-3.5" />
            </Link>

            {modoCreadorActivo && (
              <Link
                href="/creador"
                className="inline-flex items-center gap-1 font-ticket text-[10px] font-bold text-[#F2C14E] hover:underline"
              >
                <Icono nombre="tune" className="h-3.5 w-3.5" />
                Editar evento en Panel Creador
              </Link>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
