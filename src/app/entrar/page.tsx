// =====================================================================
// Ruta /entrar · Acceso al Club Nocturno (Email Magic Link, Google, Apple)
// =====================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { Icono } from '@/components/ui/Icono';

export const metadata: Metadata = {
  title: 'Entrar · Club Nocturno KebabScore Málaga',
  description:
    'Inicia sesión con Google, Apple o enlace mágico por correo para imprimir tus tickets térmicos y desbloquear pegatinas.',
};

export default function PaginaEntrar() {
  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="rounded-xl border border-[#44372E]/60 bg-[#1B1613] p-6 shadow-2xl">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded border border-[#FF7A1F]/40 bg-[#FF7A1F]/15 px-2.5 py-1 font-ticket text-[10px] font-bold uppercase text-[#FF7A1F]">
          <Icono nombre="local_fire_department" className="h-3.5 w-3.5" />
          CAJA ABIERTA · ACCESO CRÍTICOS
        </div>

        <h1 className="rotulo-neon font-rotulo text-3xl uppercase tracking-wide text-[#F5EFE6]">
          FICHA EN EL MOSTRADOR
        </h1>
        <p className="mt-1.5 text-xs leading-relaxed text-[#C9B9A6]">
          Conecta tu cuenta con Google, Apple o enlace mágico sin contraseña para guardar
          tus tickets térmicos y tus pegatinas de escaparate en Supabase.
        </p>

        <div className="mt-5 space-y-2.5">
          <Link
            href="/perfil/marcos-padrino"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#241D18] px-4 py-3 font-ticket text-xs font-bold uppercase text-[#F5EFE6] transition-colors hover:border-[#FF7A1F]"
          >
            Continuar con Google
          </Link>
          <Link
            href="/perfil/marcos-padrino"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#241D18] px-4 py-3 font-ticket text-xs font-bold uppercase text-[#F5EFE6] transition-colors hover:border-[#FF7A1F]"
          >
            Continuar con Apple
          </Link>
        </div>

        <div className="my-5 flex items-center gap-3 font-ticket text-[10px] text-[#C9B9A6]">
          <span className="h-px flex-1 bg-white/10" />
          <span>O ENLACE MÁGICO POR EMAIL</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form action="/perfil/marcos-padrino" className="space-y-3">
          <label
            htmlFor="correo-acceso"
            className="block font-ticket text-xs uppercase text-[#C9B9A6]"
          >
            Tu correo electrónico
          </label>
          <input
            id="correo-acceso"
            type="email"
            placeholder="tu@correo.es"
            className="w-full rounded-lg border border-white/15 bg-[#120F0D] px-3.5 py-3 text-sm text-[#F5EFE6] placeholder:text-[#C9B9A6]/40 focus:border-[#FF7A1F] focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-[#FF3B30] py-3 font-rotulo text-lg uppercase tracking-wider text-[#F5EFE6] shadow-[0_0_20px_rgba(255,59,48,0.4)]"
          >
            ENVIAR TICKET DE ACCESO
          </button>
        </form>
      </div>
    </div>
  );
}
