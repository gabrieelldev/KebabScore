// =====================================================================
// MisionesYPerfilCliente · Perfil Obligatorio + Misiones + Pegatinas
// ---------------------------------------------------------------------
// Explicación para 1.º de DAW:
// - Si `usuarioActual === null`, muestra el formulario obligatorio para
//   crear tu perfil con Google, Apple o Correo Electrónico.
// - Una vez creado tu perfil, muestra tu ficha real (correo, proveedor
//   de acceso, barrio base, salsa favorita, XP, tus tickets verificados
//   y botón para cerrar sesión), además de los Retos Nocturnos, las
//   Pegatinas de Escaparate y el Ranking de la Peña.
// =====================================================================

'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { RegistroPerfilCliente } from '@/components/auth/RegistroPerfilCliente';
import { BannerEventosEspeciales } from '@/components/creador/BannerEventosEspeciales';
import { Icono } from '@/components/ui/Icono';
import { useAuth } from '@/lib/auth/contexto';
import {
  type CategoriaMision,
  type DificultadMision,
  type MisionCreador,
  useCreador,
} from '@/lib/creador/contexto';
import { formatearNota } from '@/lib/puntuacion';

type FiltroCategoria = 'all' | CategoriaMision;
type FiltroDificultad = 'all' | DificultadMision;

const PLANTILLAS_RETOS: Omit<MisionCreador, 'id'>[] = [
  {
    titulo: 'Doble Capa de Salsa Blanca',
    descripcion:
      'Audita un dürüm con subnota de Salsas ≥ 9,0 en cualquier local de Huelin o El Perchel.',
    categoria: 'calibre',
    dificultad: 'facil',
    xp: 120,
    recompensa: "Pegatina 'Rey del Yogur'",
    progresoActual: 0,
    progresoMeta: 1,
    enlaceAccion: '/kebab/el-trompo-de-oro/resenar',
    textoAccion: 'Auditar ahora',
    activa: true,
  },
  {
    titulo: 'Guardia de las 04:15 AM',
    descripcion:
      'Imprime un ticket verificado pasada la 04:00 AM en un asador abierto de madrugada.',
    categoria: 'horario',
    dificultad: 'media',
    xp: 180,
    recompensa: "Pegatina 'Centinela 4 AM'",
    progresoActual: 0,
    progresoMeta: 1,
    enlaceAccion: '/kebab/el-trompo-de-oro/resenar',
    textoAccion: 'Subir Ticket 4 AM',
    activa: true,
  },
  {
    titulo: 'Bautismo de Guindilla Roja',
    descripcion:
      'Encuentra y valora 2 locales con KebabScore ≥ 8,8 (Nivel Fuego) en la misma semana.',
    categoria: 'picante',
    dificultad: 'leyenda',
    xp: 350,
    recompensa: "Chapa 'Lengua de Titanio'",
    progresoActual: 1,
    progresoMeta: 2,
    enlaceAccion: '/ranking',
    textoAccion: 'Buscar Nivel Fuego',
    activa: true,
  },
];

type Props = {
  aliasUsuario?: string;
};

export function MisionesYPerfilCliente({ aliasUsuario }: Props) {
  const { hidratado: authHidratado, usuarioActual, cerrarSesion, sumarXp } = useAuth();
  const {
    modoCreadorActivo,
    misionesActivas,
    pegatinas,
    ajustes,
    guardarMision,
  } = useCreador();

  const [categoria, setCategoria] = useState<FiltroCategoria>('all');
  const [dificultad, setDificultad] = useState<FiltroDificultad>('all');
  const [reclamado4092, setReclamado4092] = useState(false);

  const misionesFiltradas = useMemo(() => {
    return misionesActivas.filter((m) => {
      if (categoria !== 'all' && m.categoria !== categoria) return false;
      if (dificultad !== 'all' && m.dificultad !== dificultad) return false;
      return true;
    });
  }, [misionesActivas, categoria, dificultad]);

  function generarRetoAMedida() {
    const plantilla =
      PLANTILLAS_RETOS.find(
        (p) => !misionesActivas.some((m) => m.titulo === p.titulo),
      ) ?? PLANTILLAS_RETOS[0];
    guardarMision({
      ...plantilla,
      id: `reto-${Date.now()}`,
    });
    setCategoria('all');
    setDificultad('all');
  }

  if (!authHidratado) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center font-ticket text-xs text-texto-suave">
        Comprobando tu ficha de crítico…
      </div>
    );
  }

  // Si aún NO se ha creado un perfil, exigimos crearse uno con Email, Google o Apple
  if (!usuarioActual) {
    return (
      <div className="mx-auto max-w-lg pb-12">
        <BannerEventosEspeciales />
        <RegistroPerfilCliente
          tituloPersonalizado={
            aliasUsuario
              ? 'CREA TU PERFIL PARA VER TU FICHA'
              : 'IDENTIFÍCATE PARA DESBLOQUEAR MISIONES'
          }
          subtituloPersonalizado="Crea tu cuenta en 10 segundos con tu correo electrónico y contraseña para guardar tus tickets verificados, tu nivel XP y tus pegatinas de escaparate."
        />
      </div>
    );
  }

  const xpActual = usuarioActual.xp;
  const xpMeta = usuarioActual.nivel * 500 + 500;
  const porcentajeXp = Math.min(100, Math.round((xpActual / xpMeta) * 100));
  const pegatinasDesbloqueadas = pegatinas.filter((p) => p.desbloqueada).length;

  const etiquetaProveedor =
    usuarioActual.metodoAuth === 'google'
      ? 'GOOGLE VERIFICADO'
      : usuarioActual.metodoAuth === 'apple'
        ? 'APPLE ID VERIFICADO'
        : 'CORREO VERIFICADO';

  return (
    <div className="escalonado mx-auto max-w-lg pb-12">
      <BannerEventosEspeciales />

      <div className="space-y-6 px-4 pt-5">
        {/* ============ 1. HUD REAL DEL PERFIL DEL USUARIO ============ */}
        <section aria-label="Perfil y nivel de experiencia" className="relative">
          <div className="relative overflow-hidden rounded-xl border border-borde/60 bg-gradient-to-br from-superficie via-superficie-baja to-fondo p-4 shadow-2xl">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primario/15 blur-2xl"
            />

            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-acento bg-fondo font-rotulo text-2xl tracking-wider text-acento shadow-[0_0_15px_rgba(255,122,31,0.3)]">
                    {usuarioActual.iniciales}
                  </div>
                  <span className="absolute -bottom-1.5 -right-1.5 rounded border border-carbon bg-guindilla-red px-1.5 py-0.5 font-ticket text-[10px] font-bold text-carbon shadow">
                    LVL {usuarioActual.nivel}
                  </span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded border border-lechuga/40 bg-lechuga-green/15 px-1.5 py-0.5 font-ticket text-[9px] font-bold uppercase text-lechuga">
                      {etiquetaProveedor}
                    </span>
                    <Icono nombre="verified" className="h-3.5 w-3.5 text-lechuga" />
                  </div>
                  <h1 className="mt-1 font-rotulo text-2xl uppercase leading-none tracking-wide text-texto">
                    {usuarioActual.nombre}
                  </h1>
                  <p className="mt-0.5 font-ticket text-[11px] text-texto-suave">
                    {usuarioActual.email}
                  </p>
                  <p className="mt-0.5 font-sans text-xs text-texto-suave">
                    Barrio:{' '}
                    <strong className="text-texto">
                      {usuarioActual.barrioBase}
                    </strong>{' '}
                    · Salsa:{' '}
                    <strong className="text-mostaza">
                      {usuarioActual.salsaFavorita}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="rounded-lg border border-borde/50 bg-fondo/80 px-3 py-2">
                  <span className="block font-ticket text-[10px] uppercase text-texto-suave">
                    TOTAL XP
                  </span>
                  <span className="font-ticket text-lg font-bold tracking-tight text-acento">
                    {xpActual.toLocaleString('es-ES')}
                  </span>
                  <span className="block font-ticket text-[9px] text-texto-suave/70">
                    / {xpMeta} XP
                  </span>
                </div>
                <button
                  type="button"
                  onClick={cerrarSesion}
                  className="mt-1.5 font-ticket text-[10px] text-texto-suave underline-offset-2 hover:text-guindilla hover:underline"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex justify-between font-ticket text-[11px]">
                <span className="text-texto-suave">
                  {Math.max(0, xpMeta - xpActual)} XP para subir a{' '}
                  <strong className="text-texto">
                    LVL {usuarioActual.nivel + 1} ({ajustes.rangoCritico})
                  </strong>
                </span>
                <span className="font-bold text-lechuga">CUENTA VERIFICADA</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full border border-borde/60 bg-fondo p-0.5">
                <div
                  style={{ width: `${porcentajeXp}%` }}
                  className="relative h-full rounded-full bg-gradient-to-r from-primario via-guindilla-red to-mostaza-gold transition-all duration-500"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-borde/40 pt-3 text-center">
              <div className="rounded-lg bg-fondo/50 py-1.5">
                <span className="block font-ticket text-sm font-bold text-texto">
                  {usuarioActual.ticketsPublicados.length} Tickets
                </span>
                <span className="text-[10px] text-texto-suave">Auditados por ti</span>
              </div>
              <div className="rounded-lg bg-fondo/50 py-1.5">
                <span className="block font-ticket text-sm font-bold text-lechuga">
                  {misionesActivas.length} Retos
                </span>
                <span className="text-[10px] text-texto-suave">Activos hoy</span>
              </div>
              <div className="rounded-lg bg-fondo/50 py-1.5">
                <span className="block font-ticket text-sm font-bold text-mostaza">
                  {pegatinasDesbloqueadas} Pegatinas
                </span>
                <span className="text-[10px] text-texto-suave">En tu vitrina</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============ MIS TICKETS VERIFICADOS ============ */}
        {usuarioActual.ticketsPublicados.length > 0 && (
          <section aria-label="Tus tickets verificados" className="space-y-3">
            <h2 className="font-rotulo text-xl uppercase tracking-wide text-texto">
              TUS TICKETS AUDITADOS ({usuarioActual.ticketsPublicados.length})
            </h2>
            <div className="space-y-2.5">
              {usuarioActual.ticketsPublicados.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-lechuga/40 bg-superficie-baja p-3.5"
                >
                  <div>
                    <div className="flex items-center gap-2 font-ticket text-[10px]">
                      <span className="rounded bg-lechuga-green/20 px-1.5 py-0.5 font-bold text-lechuga">
                        {t.metodoVerificacion === 'double_verified'
                          ? '✓✓ DOBLE VERIFICACIÓN (GPS + FOTO)'
                          : t.metodoVerificacion === 'gps_checkin'
                            ? `✓ GPS VERIFICADO (${t.distanciaMetros ?? 25}m)`
                            : `✓ TICKET CAJA (${t.referenciaTicketCaja ?? 'FOTO'})`}
                      </span>
                      <span className="text-texto-suave">{t.codigoTicket}</span>
                    </div>
                    <Link
                      href={`/kebab/${t.localSlug}`}
                      className="mt-1 block font-rotulo text-lg uppercase text-texto hover:text-acento"
                    >
                      {t.localNombre} ({t.barrioNombre})
                    </Link>
                    <p className="text-xs italic text-texto-suave">
                      &ldquo;{t.comentario}&rdquo;
                    </p>
                  </div>
                  <div className="shrink-0 rounded-lg bg-fondo px-3 py-1.5 text-center font-ticket">
                    <span className="block text-lg font-bold text-acento">
                      {formatearNota(t.notaTotal)}
                    </span>
                    <span className="text-[9px] text-texto-suave">/ 10</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============ 2. PANEL DE CONTROL DE MISIONES & FILTROS ============ */}
        <section aria-label="Filtrar y crear retos nocturnos" className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <span className="block font-ticket text-[10px] uppercase tracking-widest text-acento">
                PANEL DE ENCARGOS · 03:00 AM
              </span>
              <h2 className="font-rotulo text-2xl uppercase tracking-wide text-texto">
                EXPLORAR RETOS NOCTURNOS
              </h2>
            </div>

            {modoCreadorActivo ? (
              <Link
                href="/creador"
                className="inline-flex items-center gap-1 rounded border border-mostaza bg-mostaza-gold/20 px-2.5 py-1 font-ticket text-[10px] font-bold text-mostaza"
              >
                <Icono nombre="tune" className="h-3.5 w-3.5" />
                Editar Misiones
              </Link>
            ) : (
              <span className="rounded border border-borde/50 bg-superficie-baja px-2 py-1 font-ticket text-[11px] text-texto-suave">
                MÁLAGA CAPITAL
              </span>
            )}
          </div>

          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {[
              { id: 'all' as const, texto: 'Todos', icono: 'apps' as const },
              {
                id: 'horario' as const,
                texto: '03:00 - 05:00 AM',
                icono: 'schedule' as const,
              },
              {
                id: 'barrio' as const,
                texto: 'Barrios MLG',
                icono: 'location_city' as const,
              },
              {
                id: 'picante' as const,
                texto: 'Picante Fuego',
                icono: 'whatshot' as const,
              },
              { id: 'calibre' as const, texto: '>600g Lavash', icono: 'scale' as const },
            ].map((c) => {
              const activo = categoria === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoria(c.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-ticket text-xs transition-all ${
                    activo
                      ? 'bg-primario font-bold text-carbon shadow-[0_0_12px_rgba(255,122,31,0.4)]'
                      : 'border border-borde/60 bg-superficie-baja text-texto-suave hover:border-acento/50'
                  }`}
                >
                  <Icono nombre={c.icono} className="h-3.5 w-3.5" />
                  {c.texto}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="inline-flex rounded-lg border border-borde/50 bg-superficie-baja p-1">
              {[
                { id: 'all' as const, texto: 'Todas' },
                { id: 'facil' as const, texto: 'Fácil' },
                { id: 'media' as const, texto: 'Media' },
                { id: 'leyenda' as const, texto: 'Leyenda' },
              ].map((d) => {
                const activo = dificultad === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDificultad(d.id)}
                    className={`rounded-md px-2.5 py-1 font-ticket text-[11px] transition-all ${
                      activo
                        ? 'bg-superficie-alta font-bold text-texto shadow'
                        : 'text-texto-suave hover:text-texto'
                    }`}
                  >
                    {d.texto}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={generarRetoAMedida}
              className="flex items-center gap-1.5 rounded-lg border border-guindilla/50 bg-guindilla-red/15 px-3 py-1.5 font-ticket text-[11px] font-bold text-guindilla transition-all hover:bg-guindilla-red/25 active:scale-95"
            >
              <Icono nombre="Casino" className="h-4 w-4" />
              CREAR RETO A MEDIDA
            </button>
          </div>
        </section>

        {/* ============ 3. STREAM DE MISIONES ACTIVAS + TICKET #4092 ============ */}
        <section aria-label="Misiones activas" className="space-y-4">
          {misionesFiltradas.map((m) => {
            const esLeyenda = m.dificultad === 'leyenda';
            const colorBarra = esLeyenda
              ? 'bg-gradient-to-b from-mostaza-gold to-guindilla-red'
              : m.categoria === 'barrio'
                ? 'bg-lechuga-green'
                : 'bg-primario';
            const iconoMision =
              m.categoria === 'horario'
                ? ('nightlight' as const)
                : m.categoria === 'barrio'
                  ? ('explore' as const)
                  : ('local_fire_department' as const);

            const pasos = Array.from({ length: Math.min(7, m.progresoMeta) });

            return (
              <article
                key={m.id}
                className="relative overflow-hidden rounded-xl border border-borde/70 bg-superficie-baja p-4 shadow-lg"
              >
                <div className={`absolute bottom-0 left-0 top-0 w-1.5 ${colorBarra}`} />
                <div className="flex items-start justify-between gap-3 pl-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-acento/40 bg-superficie text-acento">
                      <Icono nombre={iconoMision} className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded border border-acento/30 bg-primario/15 px-1.5 py-0.5 font-ticket text-[9px] font-bold uppercase text-acento">
                          {m.categoria.toUpperCase()}
                        </span>
                        <span className="rounded bg-superficie-alta px-1.5 py-0.5 font-ticket text-[9px] uppercase text-texto-suave">
                          {m.dificultad.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="mt-1 font-rotulo text-xl uppercase leading-tight tracking-wide text-texto">
                        {m.titulo}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-texto-suave">
                        {m.descripcion}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="rounded-lg border border-acento/40 bg-fondo px-2.5 py-1 font-ticket text-sm font-bold text-acento">
                      +{m.xp} XP
                    </div>
                    <span className="mt-1 block font-ticket text-[9px] text-lechuga">
                      ACTIVA
                    </span>
                  </div>
                </div>

                <div className="mt-4 pl-2">
                  <div className="mb-1 flex items-center justify-between font-ticket text-[11px]">
                    <span className="text-texto-suave">PROGRESO DE RETO</span>
                    <span className="font-bold text-texto">
                      {m.progresoActual} / {m.progresoMeta}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {pasos.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-2 flex-1 rounded-full ${
                          idx < m.progresoActual
                            ? 'bg-primario shadow-[0_0_8px_rgba(255,122,31,0.5)]'
                            : 'border border-borde bg-fondo'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-borde/40 pt-2.5">
                    <div className="flex items-center gap-1.5">
                      <Icono
                        nombre="workspace_premium"
                        className="h-4 w-4 text-mostaza"
                      />
                      <span className="font-ticket text-[10px] text-texto-suave">
                        Desbloquea: <strong className="text-mostaza">{m.recompensa}</strong>
                      </span>
                    </div>
                    <Link
                      href={m.enlaceAccion}
                      className="flex items-center gap-1 font-ticket text-xs font-bold text-acento hover:underline"
                    >
                      {m.textoAccion}
                      <Icono nombre="arrow_forward" className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}

          {/* RECIBO TÉRMICO #4092 LISTO PARA RECLAMAR */}
          {(categoria === 'all' || categoria === 'picante') && (
            <article className="relative mx-0.5 rotate-[-0.4deg] rounded-sm bg-ticket-papel p-4 font-ticket text-ticket-tinta shadow-[0_12px_28px_rgba(0,0,0,0.65)]">
              <div className="mb-2 flex items-center justify-between border-b border-dashed border-ticket-suave/40 pb-2">
                <div className="flex items-center gap-1.5">
                  <Icono nombre="check_circle" className="h-4 w-4 text-guindilla" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    RECIBO DE AUDITORÍA #4092
                  </span>
                </div>
                <span className="rounded bg-ticket-tinta px-2 py-0.5 text-[10px] font-bold text-ticket-papel">
                  3 / 3 COMPLETADO
                </span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-rotulo text-2xl uppercase leading-none tracking-wide text-ticket-tinta">
                    Paladar de Brasa Indómito
                  </h3>
                  <p className="mt-1 font-sans text-xs text-ticket-suave">
                    Has auditado 3 locales con KebabScore ≥ 8,5 (Nivel Fuego) pidiendo
                    salsa picante casera.
                  </p>
                </div>
                <div className="shrink-0 rotate-3 border-2 border-guindilla px-2 py-1 text-center">
                  <span className="block text-[9px] font-bold leading-none text-guindilla">
                    VERIFICADO
                  </span>
                  <span className="text-sm font-bold text-ticket-tinta">+250 XP</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-dashed border-ticket-suave/40 pt-3">
                <div className="text-[10px] text-ticket-suave">
                  <span>PREMIO: </span>
                  <strong className="text-ticket-tinta">
                    &apos;Pegatina Oro de Escaparate&apos;
                  </strong>
                </div>
                <button
                  type="button"
                  disabled={reclamado4092}
                  onClick={() => {
                    setReclamado4092(true);
                    sumarXp(250);
                  }}
                  className={`flex items-center gap-1.5 rounded px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                    reclamado4092
                      ? 'bg-lechuga-green text-carbon'
                      : 'bg-guindilla-red text-carbon shadow-[0_4px_12px_rgba(255,59,48,0.4)] active:scale-95'
                  }`}
                >
                  <Icono
                    nombre={reclamado4092 ? 'check_circle' : 'redeem'}
                    className="h-4 w-4"
                  />
                  {reclamado4092 ? 'RECLAMADO (+250 XP)' : 'RECLAMAR +250 XP AHORA'}
                </button>
              </div>
            </article>
          )}
        </section>

        {/* ============ 4. PEGATINAS DE ESCAPARATE (INSIGNIAS) ============ */}
        <section aria-label="Pegatinas de escaparate" className="pt-2">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <span className="block font-ticket text-[10px] uppercase tracking-widest text-mostaza">
                VITRINA DEL CRÍTICO
              </span>
              <h2 className="font-rotulo text-2xl uppercase tracking-wide text-texto">
                PEGATINAS DE ESCAPARATE
              </h2>
            </div>
            <span className="font-ticket text-xs text-texto-suave">
              {pegatinasDesbloqueadas} / {pegatinas.length} pegadas
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {pegatinas.map((peg) => (
              <div
                key={peg.id}
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  peg.desbloqueada
                    ? 'border-linea/15 bg-superficie-baja'
                    : 'border-dashed border-linea/10 bg-fondo/60 opacity-65'
                }`}
              >
                <div
                  style={{
                    borderColor: peg.colorHex,
                    color: peg.colorHex,
                    backgroundColor: `${peg.colorHex}18`,
                  }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2"
                >
                  <Icono nombre={peg.icono} className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-rotulo text-sm uppercase tracking-wide text-texto">
                    {peg.titulo}
                  </p>
                  <p className="truncate font-ticket text-[10px] text-texto-suave">
                    {peg.subtitulo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ 5. RANKING DE LA PEÑA (LEADERBOARD) ============ */}
        <section aria-label="Ranking de la peña" className="pt-2">
          <div className="overflow-hidden rounded-xl border border-borde/70 bg-superficie-baja shadow-xl">
            <div className="flex items-center justify-between border-b border-borde/50 bg-superficie px-4 py-3">
              <div className="flex items-center gap-2">
                <Icono nombre="emoji_events" className="h-5 w-5 text-mostaza" />
                <div>
                  <h2 className="font-rotulo text-xl uppercase leading-none tracking-wide text-texto">
                    RANKING DE LA PEÑA
                  </h2>
                  <span className="font-ticket text-[10px] text-texto-suave">
                    TEMPORADA DE OTOÑO · MÁLAGA
                  </span>
                </div>
              </div>
              <span className="rounded border border-lechuga/30 bg-fondo px-2 py-1 font-ticket text-[10px] text-lechuga">
                TOP CRÍTICOS
              </span>
            </div>

            <div className="divide-y divide-borde/30">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-mostaza-gold font-ticket text-xs font-bold text-carbon">
                    1
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-texto">
                        Salva_Doner99
                      </span>
                      <span className="rounded border border-mostaza/30 bg-mostaza-gold/15 px-1.5 py-0.5 font-ticket text-[9px] text-mostaza">
                        Sultán
                      </span>
                    </div>
                    <span className="font-ticket text-[10px] text-texto-suave">
                      42 tickets · Centro &amp; Soho
                    </span>
                  </div>
                </div>
                <span className="font-ticket text-sm font-bold text-mostaza">
                  4.820 XP
                </span>
              </div>

              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-crema-300 font-ticket text-xs font-bold text-carbon">
                    2
                  </span>
                  <div>
                    <span className="text-sm font-bold text-texto">
                      KebabMaster_Vialia
                    </span>
                    <span className="block font-ticket text-[10px] text-texto-suave">
                      35 tickets · El Perchel
                    </span>
                  </div>
                </div>
                <span className="font-ticket text-sm font-bold text-texto">
                  3.910 XP
                </span>
              </div>

              <div className="flex items-center justify-between border-l-4 border-acento bg-primario/10 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-primario font-ticket text-xs font-bold text-carbon">
                    3
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-acento">
                        {usuarioActual.nombre} (TÚ)
                      </span>
                      <span className="rounded bg-guindilla-red px-1.5 py-0.5 font-ticket text-[9px] font-bold text-carbon">
                        LVL {usuarioActual.nivel}
                      </span>
                    </div>
                    <span className="font-ticket text-[10px] text-texto-suave">
                      {usuarioActual.ticketsPublicados.length} tickets verificados ·{' '}
                      {usuarioActual.barrioBase}
                    </span>
                  </div>
                </div>
                <span className="font-ticket text-sm font-bold text-acento">
                  {xpActual.toLocaleString('es-ES')} XP
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
