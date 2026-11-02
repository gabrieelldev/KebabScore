// =====================================================================
// InicioClienteConectado · Conecta la portada con el Estado del Creador
// ---------------------------------------------------------------------
// Recibe los datos iniciales del Server Component (`page.tsx`) para que
// el HTML llegue renderizado en el primer milisegundo (SEO), y en cuanto
// hidrata en el navegador aplica en vivo cualquier cambio hecho en el
// Panel de Creador (`/creador`): Eventos Especiales, textos del Hero,
// cita del ticket térmico #TKT-29001 y locales editados o nuevos.
// =====================================================================

'use client';

import Link from 'next/link';
import { BannerEventosEspeciales } from '@/components/creador/BannerEventosEspeciales';
import { ExploradorInicio } from '@/components/kebab/ExploradorInicio';
import { PodioCarta } from '@/components/kebab/PodioCarta';
import { Icono } from '@/components/ui/Icono';
import { useCreador } from '@/lib/creador/contexto';
import type { Barrio, LocalResumen } from '@/lib/datos/tipos';
import { TEXTOS } from '@/lib/textos';

const FILAS_TICKET_FORMULA = [
  { codigo: '01. CARNE CRUJIENTE', peso: '30%', color: '#FF7A1F' },
  { codigo: '02. EQUILIBRIO SALSAS', peso: '20%', color: '#FFF6E8' },
  { codigo: '03. PAN TOSTADO / SELLADO', peso: '15%', color: '#F2C14E' },
  { codigo: '04. GRAMO / EURO (PRECIO)', peso: '15%', color: '#FF3B30' },
  { codigo: '05. FRESCURA VERDURA', peso: '10%', color: '#35C759' },
  { codigo: '06. SERVICIO 3:00 AM', peso: '10%', color: '#181411' },
];

type Props = {
  localesServidor: LocalResumen[];
  barrios: Barrio[];
  esDemo: boolean;
};

export function InicioClienteConectado({
  localesServidor,
  barrios,
  esDemo,
}: Props) {
  const {
    hidratado,
    modoCreadorActivo,
    locales: localesCreador,
    ajustes,
  } = useCreador();

  const localesActivos = hidratado ? localesCreador : localesServidor;

  return (
    <div className="mx-auto max-w-lg pb-8">
      {/* Cinta discreta cuando funciona en modo demo sin credenciales Supabase */}
      {esDemo && (
        <div
          role="status"
          className="border-b border-white/10 bg-[#1B1613] px-4 py-1.5 text-center font-ticket text-[10px] text-[#C9B9A6]"
        >
          {TEXTOS.avisoDemo}
        </div>
      )}

      {/* BANNER DE EVENTOS ESPECIALES EN VIVO (gestionados desde /creador) */}
      <BannerEventosEspeciales />

      {/* ============ 1. HERO · RÓTULO DE LOCAL NOCTURNO ============ */}
      <section className="relative overflow-hidden px-4 pb-2 pt-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-[#FF7A1F]/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-20 h-32 w-32 rounded-full bg-[#FF3B30]/10 blur-2xl"
        />

        <div className="relative z-10">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 rounded border border-[#FF7A1F]/30 bg-[#FF7A1F]/10 px-2.5 py-0.5">
              <Icono nombre="local_fire_department" className="h-3.5 w-3.5 text-[#FF7A1F]" />
              <span className="font-ticket text-[11px] font-bold uppercase tracking-wider text-[#FF7A1F]">
                {ajustes.heroPastilla}
              </span>
            </div>

            {modoCreadorActivo && (
              <Link
                href="/creador"
                className="inline-flex items-center gap-1 rounded border border-[#F2C14E]/40 bg-[#F2C14E]/15 px-2 py-0.5 font-ticket text-[10px] font-bold text-[#F2C14E] hover:bg-[#F2C14E] hover:text-[#120F0D]"
              >
                <Icono nombre="tune" className="h-3 w-3" />
                Editar Portada
              </Link>
            )}
          </div>

          <h1 className="font-rotulo text-4xl uppercase leading-[0.95] tracking-tight text-[#F5EFE6] sm:text-5xl">
            {ajustes.heroLinea1} <br />
            <span className="text-[#FF7A1F]">{ajustes.heroLineaAcento}</span>
          </h1>

          <p className="mt-2.5 max-w-md text-sm leading-relaxed text-[#C9B9A6]">
            {ajustes.heroSubtitulo}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#FF7A1F]/50 bg-[#241D18] text-[#FF7A1F]">
                <Icono nombre="verified" className="h-3.5 w-3.5" />
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#35C759]/50 bg-[#241D18] text-[#35C759]">
                <Icono nombre="restaurant" className="h-3.5 w-3.5" />
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#F2C14E]/50 bg-[#241D18] text-[#F2C14E]">
                <Icono nombre="local_fire_department" className="h-3.5 w-3.5" />
              </div>
            </div>
            <span className="font-ticket text-xs text-[#C9B9A6]">
              <strong className="text-[#F5EFE6]">{ajustes.contadorAuditados}</strong>{' '}
              auditados a pie de calle
            </span>
          </div>
        </div>
      </section>

      {/* ============ 2. TICKET TÉRMICO: FÓRMULA KEBABSCORE™ ============ */}
      <section aria-label="Fórmula KebabScore" className="px-4 py-3">
        <div className="ticket-entry relative rounded-sm bg-[#EFE6D5] p-4 text-[#181411] shadow-[0_12px_30px_rgba(0,0,0,0.65)]">
          <div
            aria-hidden="true"
            className="serrated-edge absolute -top-2 left-0 right-0 h-2.5"
          />

          <div className="flex items-center justify-between border-b border-dashed border-[#5C4E41]/40 pb-2">
            <div>
              <span className="block font-ticket text-[10px] uppercase tracking-widest text-[#5C4E41]">
                #TKT-29001 · ALGORITMO CIUDADANO
              </span>
              <h2 className="font-ticket text-sm font-bold tracking-tight text-[#181411]">
                FÓRMULA KEBABSCORE™ (0 - 10)
              </h2>
            </div>
            <div className="text-right font-ticket text-[10px] leading-tight text-[#5C4E41]">
              <div>03:14 AM</div>
              <div>CAJA #04</div>
            </div>
          </div>

          <div className="my-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 font-ticket text-xs">
            {FILAS_TICKET_FORMULA.map((fila) => (
              <div key={fila.codigo} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: fila.color }}
                  />
                  {fila.codigo}
                </span>
                <span className="mx-1 flex-grow border-b border-dotted border-[#5C4E41]/40" />
                <span className="font-bold">{fila.peso}</span>
              </div>
            ))}
          </div>

          <div className="mt-2 border-t border-dashed border-[#5C4E41]/40 pt-2">
            <div className="mb-1.5 flex items-center justify-between rounded-sm bg-[#181411] px-2 py-1 text-[#EFE6D5]">
              <span className="font-ticket text-[10px] font-bold tracking-widest text-[#FF7A1F]">
                REGLA DE ORO DE LA COMUNIDAD
              </span>
              <span className="font-ticket text-[10px] font-bold text-[#35C759]">
                VERIFICADO
              </span>
            </div>
            <p className="text-center font-ticket text-[10px] italic leading-snug text-[#5C4E41]">
              &ldquo;{ajustes.reglaDeOroCita}&rdquo;
            </p>
          </div>

          <div
            aria-hidden="true"
            className="mt-2.5 flex h-5 items-center justify-center gap-[2px] opacity-75"
          >
            {[
              'w-1',
              'w-0.5',
              'w-1.5',
              'w-0.5',
              'w-1',
              'w-2',
              'w-0.5',
              'w-1',
              'w-0.5',
              'w-1.5',
              'w-1',
              'w-0.5',
              'w-2',
              'w-0.5',
              'w-1',
              'w-1.5',
              'w-0.5',
              'w-1',
            ].map((ancho, idx) => (
              <div key={idx} className={`h-full ${ancho} bg-[#181411]`} />
            ))}
          </div>

          <div
            aria-hidden="true"
            className="serrated-edge absolute -bottom-2 left-0 right-0 h-2.5 rotate-180"
          />
        </div>
      </section>

      {/* ============ 3. BUSCADOR + FILTROS + RADAR / MAPA ============ */}
      <ExploradorInicio locales={localesActivos} barrios={barrios} />

      {/* ============ 4. CARTA LUMINOSA: TOP 3 DE MÁLAGA ============ */}
      <PodioCarta locales={localesActivos} />

      {/* ============ 5. CTA RÁPIDO PARA CATAR UN DÜRÜM ============ */}
      <section aria-label="Valorar un kebab" className="px-4 py-3">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-[#FF7A1F]/25 bg-gradient-to-r from-[#241D18] via-[#1B1613] to-[#241D18] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#FF7A1F]/40 bg-[#FF7A1F]/15">
              <Icono nombre="restaurant" className="h-6 w-6 text-[#FF7A1F]" />
            </div>
            <div>
              <h3 className="font-rotulo text-base uppercase tracking-wide text-[#F5EFE6]">
                ¿Te acabas de comer uno?
              </h3>
              <p className="text-xs text-[#C9B9A6]">
                Puntúa antes de que se enfríe la salsa (+{ajustes.xpPorTicket} XP).
              </p>
            </div>
          </div>
          <Link
            href={`/kebab/${localesActivos[0]?.slug ?? 'el-trompo-de-oro'}/resenar`}
            className="shrink-0 rounded-lg bg-[#FF3B30] px-3.5 py-2 font-rotulo text-xs uppercase tracking-wider text-[#F5EFE6] shadow-[0_0_15px_rgba(255,59,48,0.4)] transition-transform active:scale-95"
          >
            Catar
          </Link>
        </div>
      </section>

      {/* ============ 6. BARRIOS DE MÁLAGA (SEO) ============ */}
      <section aria-labelledby="titulo-barrios" className="px-4 pt-3">
        <div className="rounded-xl border border-white/10 bg-[#1B1613] p-4">
          <div className="flex items-center justify-between">
            <h2
              id="titulo-barrios"
              className="font-rotulo text-base uppercase tracking-wide text-[#F5EFE6]"
            >
              Rankings por barrio de Málaga
            </h2>
            <Link
              href="/ranking"
              className="font-ticket text-[11px] font-bold text-[#FF7A1F] hover:underline"
            >
              Ver todos →
            </Link>
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {barrios.map((b) => {
              const cuenta = localesActivos.filter((l) => l.barrio.slug === b.slug).length;
              return (
                <li key={b.slug}>
                  <Link
                    href={`/barrio/${b.slug}`}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-[#120F0D] px-3 py-2 text-xs font-medium text-[#F5EFE6] transition-colors hover:border-[#FF7A1F]"
                  >
                    <span className="truncate">{b.nombre}</span>
                    <span className="ml-2 rounded bg-[#241D18] px-1.5 py-0.5 font-ticket text-[10px] text-[#C9B9A6]">
                      {cuenta}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
