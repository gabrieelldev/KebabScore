// =====================================================================
// Cabecera y BarraPulgar · diseño de Google Stitch + Acceso Creador
// ---------------------------------------------------------------------
// - Cabecera de vidrio ahumado con logo KEBABSCORE + chapa MLG, piloto
//   verde pulsante "ABIERTOS 3 AM", avatar de perfil, selector
//   Auto / 3 AM / Terraza y ubicación "MÁLAGA CENTRO".
// - Atajo secreto del creador: si haces 3 clics seguidos en la chapa
//   "MLG", se desbloquea el Modo Creador y te lleva a `/creador`.
// - Cuando `modoCreadorActivo === true`, aparece una pastilla dorada
//   "CREADOR" que SOLO tú ves en tu sesión.
// =====================================================================

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef } from 'react';
import { Icono } from '@/components/ui/Icono';
import { useCreador } from '@/lib/creador/contexto';
import { SelectorModo } from './SelectorModo';

export function Cabecera() {
  const pathname = usePathname();
  const router = useRouter();
  const { modoCreadorActivo, activarAtajoCreador } = useCreador();
  const contadorClicsRef = useRef<{ clics: number; timer: number | null }>({
    clics: 0,
    timer: null,
  });

  function manejarClicSecretoMlg(e: React.MouseEvent) {
    e.preventDefault();
    const estado = contadorClicsRef.current;
    estado.clics += 1;
    if (estado.timer) window.clearTimeout(estado.timer);

    if (estado.clics >= 3) {
      estado.clics = 0;
      activarAtajoCreador();
      router.push('/creador');
      return;
    }

    estado.timer = window.setTimeout(() => {
      estado.clics = 0;
    }, 600);
  }

  const esSubpagina = pathname.startsWith('/kebab/');

  if (esSubpagina) {
    // Cabecera compacta de pila móvil ("Detalle Kebab") igual que en Stitch
    return (
      <header className="fixed top-0 z-50 w-full border-b border-brasa-orange/15 bg-carbon-900/85 pt-safe shadow-[0_6px_28px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              aria-label="Volver al inicio"
              className="flex h-11 w-11 items-center justify-center rounded-full text-crema-100 transition-colors hover:bg-carbon-800/60 hover:text-brasa-orange active:scale-90"
            >
              <Icono nombre="arrow_back" className="h-6 w-6" />
            </Link>
            <span className="truncate font-rotulo text-[22px] uppercase tracking-wide text-crema-100">
              {pathname.endsWith('/resenar') ? 'Auditar Dürüm' : 'Detalle Kebab'}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            {modoCreadorActivo && (
              <Link
                href="/creador"
                className="inline-flex items-center gap-1 rounded-full border border-[#F2C14E] bg-[#F2C14E]/20 px-2.5 py-1 font-ticket text-[10px] font-bold uppercase text-[#F2C14E]"
              >
                <Icono nombre="tune" className="h-3 w-3" />
                Creador
              </Link>
            )}
            <SelectorModo />
            <Link
              href="/misiones"
              aria-label="Perfil y misiones"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary ring-2 ring-brasa-orange/30 shadow-[0_0_12px_rgba(255,122,31,0.3)]"
            >
              <Icono nombre="person" className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-brasa-orange/15 bg-carbon-900/85 pt-safe shadow-[0_10px_30px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-5xl flex-col justify-center gap-1.5 px-4">
        <div className="flex items-center justify-between">
          {/* Logo con chispa y neón + piloto de abiertos */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-baseline gap-1.5">
              <Link
                href="/"
                className="neon-pulse font-rotulo text-[25px] leading-none tracking-wider text-crema-100"
              >
                KEBABSCORE
              </Link>
              <button
                type="button"
                onClick={manejarClicSecretoMlg}
                title="Málaga (3 clics para Consola de Creador)"
                className="rounded-full border border-brasa-orange/40 bg-brasa-orange/20 px-1.5 py-0.5 font-ticket text-[10px] font-bold uppercase tracking-wider text-brasa-orange"
              >
                MLG
              </button>
            </div>

            <Link
              href="/ranking"
              className="flex items-center gap-1.5 rounded-full border border-lechuga-green/25 bg-surface-container-high/90 px-2.5 py-1 backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lechuga-green opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-lechuga-green shadow-[0_0_8px_#7ED957]" />
              </span>
              <span className="font-ticket text-[11px] font-bold tracking-tight text-crema-100">
                ABIERTOS 3 AM
              </span>
            </Link>
          </div>

          {/* Enlaces rápidos en escritorio + Pastilla Creador (solo visible para ti) + Avatar */}
          <div className="flex items-center gap-3">
            <nav aria-label="Principal" className="hidden items-center gap-5 font-ticket text-xs md:flex">
              <Link href="/" className="text-crema-300 hover:text-brasa-orange">
                EXPLORAR
              </Link>
              <Link href="/ranking" className="text-crema-300 hover:text-brasa-orange">
                CARTA LUMINOSA
              </Link>
              <Link href="/misiones" className="text-crema-300 hover:text-brasa-orange">
                MISIONES &amp; PEÑA
              </Link>
              <Link href="/kebab/el-trompo-de-oro/resenar" className="text-brasa-orange font-bold">
                + DEJAR TICKET
              </Link>
            </nav>

            {modoCreadorActivo && (
              <Link
                href="/creador"
                className="inline-flex items-center gap-1 rounded-full border border-[#F2C14E] bg-[#F2C14E]/20 px-2.5 py-1 font-ticket text-[10px] font-bold uppercase tracking-wider text-[#F2C14E] shadow-[0_0_12px_rgba(242,193,78,0.3)] hover:bg-[#F2C14E] hover:text-[#120F0D]"
              >
                <Icono nombre="tune" className="h-3.5 w-3.5" />
                <span>CREADOR</span>
              </Link>
            )}

            <Link
              href="/misiones"
              aria-label="Perfil de Crítico Nocturno"
              className="relative h-9 w-9 rounded-full bg-gradient-to-tr from-brasa-orange to-mostaza-gold p-0.5 shadow-[0_0_16px_rgba(255,122,31,0.22)] transition-transform hover:scale-105 active:scale-95"
            >
              <span className="flex h-full w-full items-center justify-center rounded-full bg-carbon-800 text-primary">
                <Icono nombre="person" className="h-[19px] w-[19px]" />
              </span>
            </Link>
          </div>
        </div>

        {/* Fila 2: Selector de ambiente + Ubicación */}
        <div className="flex items-center justify-between">
          <SelectorModo />
          <div className="flex items-center gap-1 font-ticket text-[11px] text-crema-500">
            <Icono nombre="location_on" className="h-3.5 w-3.5 text-brasa-orange" />
            <span>MÁLAGA CENTRO</span>
          </div>
        </div>
      </div>
    </header>
  );
}

/** Barra inferior de navegación de Stitch con el botón central VALORAR flameante. */
export function BarraPulgar() {
  const pathname = usePathname();
  // Las páginas de ficha de local y de reseñar tienen su propio botón fijo inferior
  if (pathname.startsWith('/kebab/')) return null;

  const esInicio = pathname === '/';
  const esRanking = pathname.startsWith('/ranking') || pathname.startsWith('/barrio');
  const esMisiones = pathname.startsWith('/misiones');
  const esPerfil =
    pathname.startsWith('/perfil') ||
    pathname.startsWith('/entrar') ||
    pathname.startsWith('/creador');

  return (
    <nav
      aria-label="Navegación inferior"
      className="fixed bottom-0 z-50 w-full border-t border-brasa-orange/15 bg-carbon-900/95 pb-safe shadow-[0_-10px_35px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
    >
      <div className="mx-auto grid h-20 max-w-lg grid-cols-5 items-center px-2">
        <Link
          href="/"
          aria-current={esInicio ? 'page' : undefined}
          className={`flex min-h-[48px] flex-col items-center justify-center gap-1 transition-colors ${
            esInicio ? 'text-brasa-orange' : 'text-crema-500 hover:text-crema-100'
          }`}
        >
          <Icono nombre="map" className="h-6 w-6" />
          <span className="font-ticket text-[10px] font-bold tracking-wider uppercase">
            EXPLORAR
          </span>
        </Link>

        <Link
          href="/ranking"
          aria-current={esRanking ? 'page' : undefined}
          className={`flex min-h-[48px] flex-col items-center justify-center gap-1 transition-colors ${
            esRanking ? 'text-brasa-orange' : 'text-crema-500 hover:text-crema-100'
          }`}
        >
          <Icono nombre="receipt_long" className="h-6 w-6" />
          <span className="font-ticket text-[10px] font-bold tracking-wider uppercase">
            LA CARTA
          </span>
        </Link>

        {/* Botón central prominente VALORAR con fuego apetitoso */}
        <Link
          href="/kebab/el-trompo-de-oro/resenar"
          className="group relative -mt-7 flex flex-col items-center justify-center"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-1 h-16 w-16 animate-ping rounded-full bg-brasa-orange/20"
          />
          <div className="flame-active z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#ffdbca] bg-gradient-to-tr from-guindilla-red via-brasa-orange to-mostaza-gold text-carbon-900 transition-transform active:scale-90">
            <Icono nombre="local_fire_department" className="h-7 w-7 text-carbon-900" />
          </div>
          <span className="mt-1 font-ticket text-[10.5px] font-bold tracking-wider text-crema-100 group-hover:text-brasa-orange">
            VALORAR
          </span>
        </Link>

        <Link
          href="/misiones"
          aria-current={esMisiones ? 'page' : undefined}
          className={`flex min-h-[48px] flex-col items-center justify-center gap-1 transition-colors ${
            esMisiones ? 'text-brasa-orange' : 'text-crema-500 hover:text-crema-100'
          }`}
        >
          <Icono nombre="military_tech" className="h-6 w-6" />
          <span className="font-ticket text-[10px] font-bold tracking-wider uppercase">
            MISIONES
          </span>
        </Link>

        <Link
          href="/perfil/marcos-padrino"
          aria-current={esPerfil ? 'page' : undefined}
          className={`flex min-h-[48px] flex-col items-center justify-center gap-1 transition-colors ${
            esPerfil ? 'text-brasa-orange' : 'text-crema-500 hover:text-crema-100'
          }`}
        >
          <Icono nombre="person" className="h-6 w-6" />
          <span className="font-ticket text-[10px] font-bold tracking-wider uppercase">
            PERFIL
          </span>
        </Link>
      </div>
    </nav>
  );
}
