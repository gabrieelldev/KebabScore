// =====================================================================
// PodioCarta · "Carta Luminosa: Top 3" con el diseño exacto de Stitch
// ---------------------------------------------------------------------
// - Tarjetas acrílicas retroiluminadas con PLATO #01 · ORO, PLATO #02 · PLATA,
//   PLATO #03 · BRONCE.
// - Badge de nota con fuego/picante ("9,1 · NIVEL FUEGO").
// - Barra de desglose en 5/6 colores ("KebabScore en Capas").
// - Etiqueta de precio en papel térmico ("DÜRÜM: 6,50 €"), piloto verde
//   "Hasta 05:00" y contador de votos con chevron animado.
// =====================================================================

import Link from 'next/link';
import { Icono } from '@/components/ui/Icono';
import type { LocalResumen } from '@/lib/datos/tipos';
import {
  formatearNota,
  formatearPrecio,
  nivelDeNota,
  RESENAS_MINIMAS_FIABLES,
} from '@/lib/puntuacion';

export function seleccionarTop3(locales: LocalResumen[]): LocalResumen[] {
  return [...locales]
    .filter((l) => l.nota !== null && l.numResenas >= RESENAS_MINIMAS_FIABLES)
    .sort((a, b) => b.notaRanking - a.notaRanking)
    .slice(0, 3);
}

const MEDALLA = [
  {
    etiqueta: 'PLATO #01 · ORO',
    claseChip: 'bg-gradient-to-r from-mostaza-gold to-mostaza-gold text-carbon-900',
    claseBorde:
      'border-acento/35 shadow-[0_6px_24px_-4px_rgba(255,122,31,0.25)] hover:border-acento/60',
    rotacionPrecio: '-rotate-1',
  },
  {
    etiqueta: 'PLATO #02 · PLATA',
    claseChip: 'bg-crema-300 text-carbon-900',
    claseBorde: 'border-linea/10 shadow-md hover:border-acento/40',
    rotacionPrecio: 'rotate-1',
  },
  {
    etiqueta: 'PLATO #03 · BRONCE',
    claseChip: 'bg-superficie-alta text-texto',
    claseBorde: 'border-linea/10 shadow-md hover:border-acento/40',
    rotacionPrecio: '-rotate-[0.5deg]',
  },
] as const;

export function PodioCarta({ locales }: { locales: LocalResumen[] }) {
  const top = seleccionarTop3(locales);

  return (
    <section aria-labelledby="titulo-podio" className="flex flex-col gap-3.5">
      <div className="flex items-end justify-between">
        <div>
          <p className="flex items-center gap-1 font-ticket text-[11px] font-bold uppercase tracking-wider text-acento">
            <Icono nombre="stars" className="h-4 w-4" />
            PODIO OFICIAL DE LA PEÑA
          </p>
          <h2
            id="titulo-podio"
            className="mt-0.5 font-rotulo text-[24px] uppercase tracking-wide text-texto sm:text-3xl"
          >
            Carta Luminosa: Top 3
          </h2>
        </div>
        <Link
          href="/ranking"
          className="rounded-full border border-linea/10 bg-superficie-alta px-2.5 py-1 font-ticket text-[11px] text-texto-suave hover:border-acento/40 hover:text-acento"
        >
          VER CARTA →
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {top.map((local, idx) => {
          const m = MEDALLA[idx] ?? MEDALLA[2];
          const esFuego = local.nota !== null && nivelDeNota(local.nota) === 'fuego';
          const cierreNocturno = local.horario.find((h) => h.cierra <= h.abre)?.cierra ?? '04:30';

          return (
            <Link key={local.id} href={`/kebab/${local.slug}`} className="block">
              <article
                className={`group relative flex h-full flex-col justify-between gap-3 rounded-2xl border bg-gradient-to-b from-superficie to-superficie-baja p-4 transition-all active:scale-[0.99] ${m.claseBorde}`}
              >
                {idx === 0 && (
                  <div className=" absolute left-6 right-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-brasa-orange/50 to-transparent" />
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-md px-2 py-0.5 font-ticket text-[10px] font-bold uppercase shadow-sm ${m.claseChip}`}
                      >
                        {m.etiqueta}
                      </span>
                      <span className="truncate font-ticket text-[11px] text-texto-apagado">
                        {local.direccion}
                      </span>
                    </div>
                    <h3 className="truncate pt-1 font-rotulo text-[20px] uppercase tracking-wide text-texto transition-colors group-hover:text-acento">
                      {local.nombre}
                    </h3>
                  </div>

                  {/* Badge Fuego / Picante con resplandor */}
                  <div className="flex shrink-0 flex-col items-end">
                    {esFuego ? (
                      <>
                        <div className="flex items-center gap-1 rounded-xl border border-linea/20 bg-gradient-to-r from-guindilla-red to-guindilla-red px-2.5 py-1 text-texto shadow-[0_0_14px_rgba(255,74,61,0.55)]">
                          <Icono nombre="local_fire_department" className="h-4 w-4" />
                          <span className="font-ticket text-[19px] font-bold leading-none">
                            {local.nota !== null ? formatearNota(local.nota) : '—'}
                          </span>
                        </div>
                        <span className="mt-1 font-ticket text-[9px] font-bold tracking-wider text-guindilla">
                          NIVEL FUEGO
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-brasa-orange to-[#ff5b00] px-2.5 py-1 font-bold text-carbon-900 shadow-[0_0_12px_rgba(255,122,31,0.5)]">
                          <Icono nombre="whatshot" className="h-4 w-4" />
                          <span className="font-ticket text-[19px] font-bold leading-none">
                            {local.nota !== null ? formatearNota(local.nota) : '—'}
                          </span>
                        </div>
                        <span className="mt-1 font-ticket text-[9px] font-bold tracking-wider text-acento">
                          PICANTE
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Barra Desglose Visual "KebabScore en Capas" */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between font-ticket text-[10px] text-texto-apagado">
                    <span>Desglose por ingredientes</span>
                    <span className="text-acento">
                      Carne {formatearNota(local.subnotas.meat)} / Salsas{' '}
                      {formatearNota(local.subnotas.sauces)}
                    </span>
                  </div>
                  <div className="flex h-2.5 w-full overflow-hidden rounded-full border border-linea/5 bg-fondo p-0.5">
                    <div
                      className="h-full rounded-l-full bg-brasa-orange"
                      style={{ width: '30%' }}
                      title={`Carne ${local.subnotas.meat}`}
                    />
                    <div
                      className="mx-0.5 h-full bg-salsa-yogur"
                      style={{ width: '20%' }}
                      title={`Salsas ${local.subnotas.sauces}`}
                    />
                    <div
                      className="mr-0.5 h-full bg-mostaza-gold"
                      style={{ width: '15%' }}
                      title={`Pan ${local.subnotas.bread}`}
                    />
                    <div
                      className="mr-0.5 h-full bg-crema-300"
                      style={{ width: '15%' }}
                      title={`Tamaño/Precio ${local.subnotas.value}`}
                    />
                    <div
                      className="mr-0.5 h-full bg-lechuga-green"
                      style={{ width: '10%' }}
                      title={`Frescura ${local.subnotas.freshness}`}
                    />
                    <div
                      className="h-full rounded-r-full bg-guindilla-red"
                      style={{ width: '10%' }}
                      title={`Nocturno ${local.subnotas.night}`}
                    />
                  </div>
                </div>

                {/* Fila Inferior con Etiqueta Precio en Papel Térmico y Detalles */}
                <div className="flex items-center justify-between border-t border-linea/5 pt-2">
                  <div className="flex items-center gap-2">
                    {local.precioDurumCentimos !== null && (
                      <span
                        className={`rounded-md border border-texto-suave bg-ticket-papel px-2.5 py-0.5 font-ticket text-[12.5px] font-bold text-ticket-tinta shadow-sm ${m.rotacionPrecio}`}
                      >
                        DÜRÜM: {formatearPrecio(local.precioDurumCentimos)}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 rounded-full bg-lechuga-green/10 px-2 py-0.5 font-ticket text-[11px] text-lechuga">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lechuga-green" />
                      Hasta {cierreNocturno}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 font-ticket text-[11.5px] text-texto-suave transition-colors group-hover:text-acento">
                    <span>{local.numResenas} votos</span>
                    <Icono
                      nombre="chevron_right"
                      className="h-4 w-4 text-acento transition-transform group-hover:translate-x-0.5"
                    />
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
