// =====================================================================
// RegistroPerfilCliente · Creación obligatoria de Perfil (Email / Google / Apple)
// ---------------------------------------------------------------------
// Explicación para 1.º de DAW:
// - Permite al usuario elegir entre Google, Apple o Correo Electrónico.
// - Pide su correo, su Alias de Crítico Nocturno, su Barrio base de
//   Málaga y su Salsa de cabecera.
// - Al completarlo, crea la sesión en `ProveedorAuth` (y si Supabase
//   está configurado en `.env.local`, lanza el flujo OAuth/Magic Link).
// =====================================================================

'use client';

import { useState } from 'react';
import { Icono } from '@/components/ui/Icono';
import { type MetodoAuth, useAuth } from '@/lib/auth/contexto';
import { BARRIOS_DEMO } from '@/lib/datos/demo';

type Props = {
  tituloPersonalizado?: string;
  subtituloPersonalizado?: string;
  onCompletado?: () => void;
};

export function RegistroPerfilCliente({
  tituloPersonalizado,
  subtituloPersonalizado,
  onCompletado,
}: Props) {
  const { registrarOIniciarPerfil } = useAuth();

  const [metodo, setMetodo] = useState<MetodoAuth>('email');
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [barrioBase, setBarrioBase] = useState(BARRIOS_DEMO[0]?.nombre ?? 'Centro Histórico');
  const [salsaFavorita, setSalsaFavorita] = useState<
    'Mixta Chorreo' | 'Roja Picante' | 'Blanca Yogur'
  >('Mixta Chorreo');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function elegirProveedorOAuth(proveedor: 'google' | 'apple') {
    setMetodo(proveedor);
    setErrorMsg(null);
    if (!email) {
      setEmail(
        proveedor === 'google'
          ? 'tu.cuenta@gmail.com'
          : 'tu.id@icloud.com',
      );
    }
    if (!nombre) {
      setNombre('Gabriel "El Jefe"');
    }
  }

  function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    const correoLimpio = email.trim();
    const nombreLimpio = nombre.trim();

    if (!correoLimpio.includes('@') || !correoLimpio.includes('.')) {
      setErrorMsg('Introduce un correo electrónico válido (ej. tu@correo.com).');
      return;
    }
    if (nombreLimpio.length < 2) {
      setErrorMsg('Elige tu nombre o alias de crítico (mínimo 2 caracteres).');
      return;
    }

    registrarOIniciarPerfil({
      email: correoLimpio,
      nombre: nombreLimpio,
      metodoAuth: metodo,
      barrioBase,
      salsaFavorita,
    });

    onCompletado?.();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="relative overflow-hidden rounded-2xl border border-[#FF7A1F]/40 bg-[#1B1613] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.75)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#FF7A1F]/15 blur-2xl"
        />

        <div className="mb-3 inline-flex items-center gap-1.5 rounded border border-[#FF7A1F]/40 bg-[#FF7A1F]/15 px-2.5 py-1 font-ticket text-[10px] font-bold uppercase tracking-wider text-[#FF7A1F]">
          <Icono nombre="shield" className="h-3.5 w-3.5" />
          IDENTIFICACIÓN ANTI-BOTS · CLUB 3 AM
        </div>

        <h1 className="rotulo-neon font-rotulo text-3xl uppercase leading-none tracking-wide text-[#F5EFE6]">
          {tituloPersonalizado ?? 'CREA TU PERFIL DE CRÍTICO'}
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-[#C9B9A6]">
          {subtituloPersonalizado ??
            'Para evitar reseñas falsas y guardar tus tickets térmicos, tus misiones y tus pegatinas de escaparate, identifícate con Google, Apple o tu correo.'}
        </p>

        {/* Botones de proveedores: Google, Apple y Correo */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => elegirProveedorOAuth('google')}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 font-ticket text-xs font-bold transition-all active:scale-95 ${
              metodo === 'google'
                ? 'border-[#FF7A1F] bg-[#FF7A1F]/20 text-[#F5EFE6] shadow-[0_0_15px_rgba(255,122,31,0.3)]'
                : 'border-white/15 bg-[#241D18] text-[#F5EFE6] hover:border-[#FF7A1F]/50'
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5Z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7Z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.9C3.5 21.4 7.4 24 12 24Z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => elegirProveedorOAuth('apple')}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 font-ticket text-xs font-bold transition-all active:scale-95 ${
              metodo === 'apple'
                ? 'border-[#FF7A1F] bg-[#FF7A1F]/20 text-[#F5EFE6] shadow-[0_0_15px_rgba(255,122,31,0.3)]'
                : 'border-white/15 bg-[#241D18] text-[#F5EFE6] hover:border-[#FF7A1F]/50'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4 shrink-0"
              aria-hidden="true"
            >
              <path d="M16.4 12.7c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.8-1.4-.1-2.6.8-3.3.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.1 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.8-1.1-2.8-3.3ZM14.1 6.4c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2-.5 2.6-1.3Z" />
            </svg>
            <span>Apple</span>
          </button>
        </div>

        <div className="my-4 flex items-center gap-3 font-ticket text-[10px] text-[#C9B9A6]">
          <span className="h-px flex-1 bg-white/10" />
          <span>
            {metodo === 'email'
              ? 'O REGÍSTRATE CON TU CORREO'
              : `COMPLETA TU FICHA (${metodo.toUpperCase()})`}
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        {/* Formulario de datos del perfil */}
        <form onSubmit={manejarEnvio} className="space-y-3.5">
          <div>
            <label
              htmlFor="registro-email"
              className="block font-ticket text-[11px] uppercase text-[#C9B9A6]"
            >
              Correo electrónico ({metodo === 'email' ? 'Enlace Mágico' : metodo.toUpperCase()})
            </label>
            <input
              id="registro-email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMsg(null);
              }}
              placeholder="tu@correo.es"
              className="mt-1 w-full rounded-xl border border-white/15 bg-[#120F0D] px-3.5 py-2.5 text-sm text-[#F5EFE6] placeholder:text-[#C9B9A6]/40 focus:border-[#FF7A1F] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="registro-nombre"
              className="block font-ticket text-[11px] uppercase text-[#C9B9A6]"
            >
              Tu Nombre o Alias Callejero (saldrá en tus tickets)
            </label>
            <input
              id="registro-nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                setErrorMsg(null);
              }}
              placeholder='Ej. Gabriel "El Padrino"'
              className="mt-1 w-full rounded-xl border border-white/15 bg-[#120F0D] px-3.5 py-2.5 text-sm text-[#F5EFE6] placeholder:text-[#C9B9A6]/40 focus:border-[#FF7A1F] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label
                htmlFor="registro-barrio"
                className="block font-ticket text-[10px] uppercase text-[#C9B9A6]"
              >
                Tu Barrio Base
              </label>
              <select
                id="registro-barrio"
                value={barrioBase}
                onChange={(e) => setBarrioBase(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-[#120F0D] px-2.5 py-2.5 font-ticket text-xs text-[#F5EFE6] focus:border-[#FF7A1F] focus:outline-none"
              >
                {BARRIOS_DEMO.map((b) => (
                  <option key={b.slug} value={b.nombre}>
                    {b.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="registro-salsa"
                className="block font-ticket text-[10px] uppercase text-[#C9B9A6]"
              >
                Salsa de Cabecera
              </label>
              <select
                id="registro-salsa"
                value={salsaFavorita}
                onChange={(e) =>
                  setSalsaFavorita(
                    e.target.value as
                      | 'Mixta Chorreo'
                      | 'Roja Picante'
                      | 'Blanca Yogur',
                  )
                }
                className="mt-1 w-full rounded-xl border border-white/15 bg-[#120F0D] px-2.5 py-2.5 font-ticket text-xs text-[#F5EFE6] focus:border-[#FF7A1F] focus:outline-none"
              >
                <option value="Mixta Chorreo">Mixta Chorreo</option>
                <option value="Roja Picante">Roja Picante</option>
                <option value="Blanca Yogur">Blanca Yogur</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <p
              role="alert"
              className="rounded-lg border border-[#FF3B30]/40 bg-[#FF3B30]/10 px-3 py-2 font-ticket text-xs text-[#FF3B30]"
            >
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF3B30] via-[#FF5126] to-[#FF7A1F] py-3.5 font-rotulo text-xl uppercase tracking-wider text-[#F5EFE6] shadow-[0_0_24px_rgba(255,59,48,0.45)] transition-transform active:scale-95"
          >
            <Icono nombre="verified" className="h-5 w-5" />
            <span>CREAR PERFIL Y ENTRAR (+100 XP)</span>
          </button>
        </form>
      </div>
    </div>
  );
}
