// =====================================================================
// TicketsLocalCliente · Lista interactiva de tickets térmicos + Story 9:16
// ---------------------------------------------------------------------
// Reproduce los tickets de papel térmico de la pantalla 2 de Stitch
// (ficha_local_el_trompo_de_oro) e incluye:
//   - Filtros rápidos: "Todos", "Con Foto" y "> 3:00 AM"
//   - Borde dentado SVG arriba y abajo de cada ticket
//   - Desglose punteado de las 6 subnotas, cita, foto verificada y
//     código de barras con sello "TOTAL: X,X"
//   - Modal de "Tarjeta Compartible 9:16" lista para Stories / redes
// =====================================================================

'use client';

import { useMemo, useState } from 'react';
import { Icono } from '@/components/ui/Icono';
import { useCreador } from '@/lib/creador/contexto';
import type { ResenaTicket } from '@/lib/datos/tipos';
import { formatearNota } from '@/lib/puntuacion';

type Props = {
  nombreLocal: string;
  barrioNombre: string;
  numResenasTotal: number;
  tickets: ResenaTicket[];
};

const DIENTES_SVG =
  '0,10 10,0 20,10 30,0 40,10 50,0 60,10 70,0 80,10 90,0 100,10 110,0 120,10 130,0 140,10 150,0 160,10 170,0 180,10 190,0 200,10 210,0 220,10 230,0 240,10 250,0 260,10 270,0 280,10 290,0 300,10 310,0 320,10 330,0 340,10 350,0 360,10 370,0 380,10 390,0 400,10';

export function TicketsLocalCliente({
  nombreLocal,
  barrioNombre,
  numResenasTotal,
  tickets,
}: Props) {
  const { hidratado, locales } = useCreador();
  const localEnCreador = useMemo(
    () => locales.find((l) => l.nombre === nombreLocal),
    [locales, nombreLocal],
  );
  const listaTickets = hidratado && localEnCreador ? localEnCreador.tickets : tickets;
  const totalResenas =
    hidratado && localEnCreador ? localEnCreador.numResenas : numResenasTotal;

  const [filtro, setFiltro] = useState<'todos' | 'foto' | 'noche'>('todos');
  const [ticketStory, setTicketStory] = useState<ResenaTicket | null>(null);
  const [copiado, setCopiado] = useState(false);

  const ticketsFiltrados = useMemo(() => {
    if (filtro === 'foto') return listaTickets.filter((t) => Boolean(t.fotoUrl));
    if (filtro === 'noche') {
      return listaTickets.filter(
        (t) =>
          t.horaTexto.includes('02:') ||
          t.horaTexto.includes('03:') ||
          t.horaTexto.includes('04:') ||
          t.notas.night >= 8.8,
      );
    }
    return listaTickets;
  }, [listaTickets, filtro]);

  async function compartirStory(ticket: ResenaTicket) {
    const texto = `🥙 ${nombreLocal} (${barrioNombre}) · TOTAL: ${formatearNota(ticket.notaTotal)}/10 en KebabScore Málaga — "${ticket.comentario}"`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Ticket KebabScore · ${nombreLocal}`,
          text: texto,
          url: window.location.href,
        });
        return;
      } catch {
        // Si el usuario cancela el share nativo, copiamos al portapapeles
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`${texto} · ${window.location.href}`);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2500);
    }
  }

  return (
    <section aria-label="Últimos tickets auditados" className="mt-8 px-4">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <span className="block font-ticket text-[10px] uppercase tracking-[0.2em] text-acento">
            PAPEL TÉRMICO · CAJA ABIERTA
          </span>
          <h2 className="font-rotulo text-2xl uppercase tracking-wide text-texto">
            ÚLTIMOS TICKETS AUDITADOS
          </h2>
        </div>
        <span className="rounded border border-borde/50 bg-superficie-baja px-2 py-1 font-ticket text-xs text-texto-suave">
          MOSTRANDO {ticketsFiltrados.length}/{totalResenas}
        </span>
      </div>

      {/* Pastillas de filtro rápido */}
      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFiltro('todos')}
          className={`shrink-0 rounded-full px-3 py-1 font-ticket text-xs font-bold transition-colors ${
            filtro === 'todos'
              ? 'bg-primario text-carbon'
              : 'border border-borde/60 bg-superficie-baja text-texto-suave hover:text-texto'
          }`}
        >
          Todos ({totalResenas})
        </button>
        <button
          type="button"
          onClick={() => setFiltro('foto')}
          className={`shrink-0 rounded-full px-3 py-1 font-ticket text-xs font-medium transition-colors ${
            filtro === 'foto'
              ? 'bg-primario font-bold text-carbon'
              : 'border border-borde/60 bg-superficie-baja text-texto-suave hover:text-texto'
          }`}
        >
          Con Foto (42)
        </button>
        <button
          type="button"
          onClick={() => setFiltro('noche')}
          className={`shrink-0 rounded-full px-3 py-1 font-ticket text-xs font-medium transition-colors ${
            filtro === 'noche'
              ? 'bg-primario font-bold text-carbon'
              : 'border border-borde/60 bg-superficie-baja text-texto-suave hover:text-texto'
          }`}
        >
          &gt; 3:00 AM (64)
        </button>
      </div>

      {/* Lista de tickets de papel térmico */}
      <div className="space-y-7">
        {ticketsFiltrados.map((ticket, index) => {
          const rotacion = index % 2 === 0 ? '-rotate-[0.8deg]' : 'rotate-[0.9deg]';
          const colorSello =
            ticket.notaTotal >= 8.5 ? 'border-guindilla' : 'border-acento';

          return (
            <article
              key={ticket.id}
              className={`relative transform bg-ticket-papel text-ticket-tinta shadow-[0_12px_28px_rgba(0,0,0,0.65)] transition-transform duration-200 hover:rotate-0 ${rotacion}`}
            >
              {/* Dientes superiores */}
              <svg
                aria-hidden="true"
                className="block h-2.5 w-full -translate-y-full text-ticket-papel"
                preserveAspectRatio="none"
                viewBox="0 0 400 10"
              >
                <polygon fill="currentColor" points={DIENTES_SVG} />
              </svg>

              <div className="px-5 pb-4 pt-2 font-ticket">
                {/* Cabecera del ticket */}
                <div className="border-b border-dashed border-ticket-suave/50 pb-2.5 text-center">
                  <p className="text-[10px] font-bold tracking-[0.25em] text-ticket-suave">
                    *** KEBABSCORE AUDIT ***
                  </p>
                  <p className="mt-0.5 text-xs font-bold uppercase">
                    {nombreLocal} · {barrioNombre.toUpperCase()}
                  </p>
                  <p className="text-[10px] text-ticket-suave">
                    TICKET {ticket.codigoTicket} · {ticket.horaTexto}
                  </p>
                </div>

                {/* Crítico */}
                <div className="flex items-center justify-between border-b border-dashed border-ticket-suave/40 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ticket-tinta text-[10px] font-bold text-ticket-papel">
                      {ticket.autorIniciales}
                    </span>
                    <div>
                      <span className="font-bold text-ticket-tinta">{ticket.autorNombre}</span>
                      <span className="block text-[10px] text-ticket-suave">
                        {ticket.autorRol ?? 'Crítico Nocturno'}
                      </span>
                    </div>
                  </div>
                  <span className="border border-ticket-tinta/30 bg-ticket-tinta/10 px-1.5 py-0.5 text-[10px] font-bold uppercase">
                    {ticket.plato}
                  </span>
                </div>

                {/* Desglose punteado de las 6 subnotas */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-b border-dashed border-ticket-suave/40 py-2.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-ticket-suave">CARNE.......</span>
                    <span className="font-bold">{formatearNota(ticket.notas.meat)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ticket-suave">SALSAS......</span>
                    <span className="font-bold">{formatearNota(ticket.notas.sauces)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ticket-suave">PAN.........</span>
                    <span className="font-bold">{formatearNota(ticket.notas.bread)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ticket-suave">VERDURA.....</span>
                    <span className="font-bold">
                      {formatearNota(ticket.notas.freshness)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ticket-suave">TAMAÑO/€....</span>
                    <span className="font-bold">{formatearNota(ticket.notas.value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ticket-suave">NOCTURNO....</span>
                    <span className="font-bold">{formatearNota(ticket.notas.night)}</span>
                  </div>
                </div>

                {/* Comentario */}
                <p className="py-3 font-sans text-xs italic leading-relaxed text-ticket-tinta">
                  &ldquo;{ticket.comentario}&rdquo;
                </p>

                {/* Foto verificada si existe */}
                {ticket.fotoUrl && (
                  <div className="mb-3 overflow-hidden rounded border border-ticket-suave/30 bg-ticket-tinta/5 p-1">
                    <div className="relative h-28 w-full overflow-hidden rounded-sm">
                      <img
                        src={ticket.fotoUrl}
                        alt={`Foto subida por ${ticket.autorNombre}`}
                        className="h-full w-full object-cover contrast-105"
                      />
                      <span className="absolute bottom-1.5 left-1.5 rounded-sm bg-ticket-tinta/85 px-1.5 py-0.5 text-[9px] text-ticket-papel">
                        EVIDENCIA VERIFICADA 03:42 AM
                      </span>
                    </div>
                  </div>
                )}

                {/* Total + Sello + Botón Story 9:16 */}
                <div className="mt-1 flex items-center justify-between border-t-2 border-ticket-tinta pt-2.5">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-ticket-suave">
                      VEREDICTO PONDERADO
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[11px] font-bold">PROPINA: NINGUNA</span>
                      <button
                        type="button"
                        onClick={() => setTicketStory(ticket)}
                        className="inline-flex items-center gap-1 rounded bg-ticket-tinta px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ticket-papel hover:bg-guindilla-red"
                      >
                        <Icono nombre="share" className="h-3 w-3" />
                        Story 9:16
                      </button>
                    </div>
                  </div>
                  <div
                    className={`rotate-[-2deg] border-2 ${colorSello} bg-ticket-tinta px-3 py-1 text-ticket-papel`}
                  >
                    <span className="text-base font-bold tracking-tight">
                      TOTAL: {formatearNota(ticket.notaTotal)}
                    </span>
                  </div>
                </div>

                {/* Código de barras inferior */}
                <div className="mt-3 pt-2 text-center opacity-85">
                  <div
                    aria-hidden="true"
                    className="mx-auto h-5 w-48"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(to right, #181411 0px, #181411 2px, transparent 2px, transparent 4px, #181411 4px, #181411 5px, transparent 5px, transparent 8px, #181411 8px, #181411 11px, transparent 11px, transparent 13px)',
                    }}
                  />
                  <span className="mt-0.5 block text-[9px] tracking-[0.3em] text-ticket-tinta">
                    AUTH: 8A99-FF-0430-MALAGA
                  </span>
                </div>
              </div>

              {/* Dientes inferiores */}
              <svg
                aria-hidden="true"
                className="block h-2.5 w-full translate-y-full rotate-180 text-ticket-papel"
                preserveAspectRatio="none"
                viewBox="0 0 400 10"
              >
                <polygon fill="currentColor" points={DIENTES_SVG} />
              </svg>
            </article>
          );
        })}
      </div>

      {/* ============ MODAL DE TARJETA COMPARTIBLE 9:16 PARA STORIES ============ */}
      {ticketStory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tarjeta compartible 9:16 para redes"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <div className="flex w-full max-w-xs flex-col items-center">
            {/* Lienzo vertical 9:16 */}
            <div className="tarjeta relative flex aspect-[9/16] w-full flex-col justify-between overflow-hidden rounded-2xl border-2 border-acento/50 bg-fondo p-5 shadow-[0_0_40px_rgba(255,122,31,0.35)]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primario/20 blur-2xl"
              />

              {/* Cabecera Story */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-rotulo text-xl tracking-wider text-acento">
                    KEBABSCORE
                  </span>
                  <span className="rounded border border-guindilla/50 bg-guindilla-red/20 px-1.5 py-0.5 font-ticket text-[9px] font-bold text-guindilla">
                    MLG 3AM
                  </span>
                </div>
                <span className="font-ticket text-[10px] text-texto-suave">
                  {ticketStory.codigoTicket}
                </span>
              </div>

              {/* Ticket central dentro del formato 9:16 */}
              <div className="relative z-10 my-auto rotate-[-1deg] rounded-sm bg-ticket-papel p-4 font-ticket text-ticket-tinta shadow-2xl">
                <p className="border-b border-dashed border-ticket-suave/50 pb-1.5 text-center text-[9px] font-bold tracking-widest text-ticket-suave">
                  *** AUDITORÍA NOCTURNA ***
                </p>
                <h3 className="mt-1.5 text-center font-rotulo text-2xl uppercase tracking-wide text-ticket-tinta">
                  {nombreLocal}
                </h3>
                <p className="text-center text-[10px] text-ticket-suave">
                  {barrioNombre} · {ticketStory.plato}
                </p>

                <div className="my-2.5 grid grid-cols-2 gap-x-3 gap-y-1 border-y border-dashed border-ticket-suave/40 py-2 text-[10px]">
                  <div className="flex justify-between">
                    <span>CARNE</span>
                    <strong>{formatearNota(ticketStory.notas.meat)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>SALSAS</span>
                    <strong>{formatearNota(ticketStory.notas.sauces)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>PAN</span>
                    <strong>{formatearNota(ticketStory.notas.bread)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>TAMAÑO/€</span>
                    <strong>{formatearNota(ticketStory.notas.value)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>VERDURA</span>
                    <strong>{formatearNota(ticketStory.notas.freshness)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>3:00 AM</span>
                    <strong>{formatearNota(ticketStory.notas.night)}</strong>
                  </div>
                </div>

                <p className="line-clamp-3 font-sans text-[11px] italic text-ticket-tinta">
                  &ldquo;{ticketStory.comentario}&rdquo;
                </p>

                <div className="mt-3 flex items-center justify-between border-t-2 border-ticket-tinta pt-2">
                  <span className="text-[10px] font-bold">{ticketStory.autorNombre}</span>
                  <span className="bg-ticket-tinta px-2.5 py-0.5 text-sm font-bold text-ticket-papel">
                    TOTAL: {formatearNota(ticketStory.notaTotal)}
                  </span>
                </div>
              </div>

              {/* Pie Story */}
              <div className="relative z-10 flex items-center justify-between border-t border-linea/10 pt-2.5 font-ticket text-[10px] text-texto-suave">
                <span>kebabscore.malaga</span>
                <span className="text-lechuga">● TICKET VERIFICADO</span>
              </div>
            </div>

            {/* Acciones del modal */}
            <div className="mt-3 flex w-full gap-2">
              <button
                type="button"
                onClick={() => compartirStory(ticketStory)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-guindilla-red py-2.5 font-rotulo text-sm uppercase tracking-wider text-carbon"
              >
                <Icono nombre="share" className="h-4 w-4" />
                {copiado ? '¡Copiado al portapapeles!' : 'Compartir Story'}
              </button>
              <button
                type="button"
                onClick={() => setTicketStory(null)}
                className="rounded-xl border border-linea/15 bg-superficie-baja px-4 py-2.5 font-ticket text-xs font-bold text-texto-suave hover:text-texto"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
