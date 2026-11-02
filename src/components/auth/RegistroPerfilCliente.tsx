// =====================================================================
// RegistroPerfilCliente · Registro e Inicio de Sesión (Correo y Contraseña)
// ---------------------------------------------------------------------
// Explicación para 1.º de DAW:
// - Tiene dos pestañas:
//     1. "CREAR CUENTA": pide tu Correo, tu Contraseña (mínimo 6 caracteres),
//        tu Nombre/Alias de Crítico, tu Barrio Base de Málaga y tu Salsa.
//        Al enviarlo, crea tu perfil con +100 XP y lo deja guardado.
//     2. "INICIAR SESIÓN": entras con tu Correo y Contraseña registrados
//        y recuperas tu perfil, tu nivel XP, tus tickets y tus sellos GPS.
// =====================================================================

'use client';

import { useState } from 'react';
import { Icono } from '@/components/ui/Icono';
import { useAuth } from '@/lib/auth/contexto';
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
  const { registrarCuenta, iniciarSesion, cuentasGuardadas } = useAuth();

  const [pestana, setPestana] = useState<'registro' | 'login'>('registro');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [nombre, setNombre] = useState('');
  const [barrioBase, setBarrioBase] = useState(
    BARRIOS_DEMO[0]?.nombre ?? 'Centro Histórico',
  );
  const [salsaFavorita, setSalsaFavorita] = useState<
    'Mixta Chorreo' | 'Roja Picante' | 'Blanca Yogur'
  >('Mixta Chorreo');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (pestana === 'registro') {
      const resultado = registrarCuenta({
        email,
        password,
        nombre,
        barrioBase,
        salsaFavorita,
      });

      if (!resultado.ok) {
        setErrorMsg(resultado.error);
        return;
      }

      onCompletado?.();
      return;
    }

    // Pestaña 'login'
    const resultado = iniciarSesion(email, password);
    if (!resultado.ok) {
      setErrorMsg(resultado.error);
      return;
    }

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
          ACCESO CRÍTICOS · CLUB 3 AM
        </div>

        <h1 className="rotulo-neon font-rotulo text-3xl uppercase leading-none tracking-wide text-[#F5EFE6]">
          {tituloPersonalizado ??
            (pestana === 'registro'
              ? 'CREA TU PERFIL DE CRÍTICO'
              : 'INICIA SESIÓN EN TU PERFIL')}
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-[#C9B9A6]">
          {subtituloPersonalizado ??
            'Regístrate con tu correo y contraseña para guardar tu perfil, tus tickets térmicos verificados, tus misiones y tu nivel XP.'}
        </p>

        {/* Selector de pestaña: Crear Cuenta vs Iniciar Sesión */}
        <div className="mt-5 grid grid-cols-2 gap-1.5 rounded-xl border border-white/10 bg-[#120F0D] p-1">
          <button
            type="button"
            onClick={() => {
              setPestana('registro');
              setErrorMsg(null);
            }}
            className={`cursor-pointer rounded-lg py-2.5 font-ticket text-xs font-bold uppercase transition-all ${
              pestana === 'registro'
                ? 'bg-[#FF7A1F] text-[#120F0D] shadow-md'
                : 'text-[#C9B9A6] hover:text-[#F5EFE6]'
            }`}
          >
            Crear Cuenta
          </button>
          <button
            type="button"
            onClick={() => {
              setPestana('login');
              setErrorMsg(null);
            }}
            className={`cursor-pointer rounded-lg py-2.5 font-ticket text-xs font-bold uppercase transition-all ${
              pestana === 'login'
                ? 'bg-[#FF7A1F] text-[#120F0D] shadow-md'
                : 'text-[#C9B9A6] hover:text-[#F5EFE6]'
            }`}
          >
            Iniciar Sesión
          </button>
        </div>

        {/* Si ya hay cuentas registradas en el dispositivo, las mostramos en Iniciar Sesión para autocompletar */}
        {cuentasGuardadas.length > 0 && pestana === 'login' && (
          <div className="mt-4 rounded-xl border border-[#2ECC71]/35 bg-[#120F0D] p-3">
            <p className="font-ticket text-[10px] font-bold uppercase tracking-wider text-[#2ECC71]">
              CUENTAS REGISTRADAS EN ESTE DISPOSITIVO
            </p>
            <div className="mt-2 space-y-1.5">
              {cuentasGuardadas.map((cuenta) => (
                <button
                  key={cuenta.email}
                  type="button"
                  onClick={() => {
                    setEmail(cuenta.email);
                    setPassword(cuenta.passwordGuardada ?? '');
                    setErrorMsg(null);
                  }}
                  className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-[#1B1613] px-3 py-2 text-left transition-colors hover:border-[#2ECC71]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-[#F5EFE6]">
                      {cuenta.nombre}
                    </p>
                    <p className="truncate font-ticket text-[10px] text-[#C9B9A6]">
                      {cuenta.email} · Nivel {cuenta.nivel} ({cuenta.xp} XP)
                    </p>
                  </div>
                  <span className="shrink-0 font-ticket text-[10px] font-bold text-[#2ECC71]">
                    Rellenar →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Formulario de Correo y Contraseña */}
        <form onSubmit={manejarEnvio} className="mt-5 space-y-3.5">
          <div>
            <label
              htmlFor="auth-email"
              className="block font-ticket text-[11px] uppercase text-[#C9B9A6]"
            >
              Correo electrónico
            </label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
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
            <div className="flex items-center justify-between">
              <label
                htmlFor="auth-password"
                className="block font-ticket text-[11px] uppercase text-[#C9B9A6]"
              >
                Contraseña {pestana === 'registro' ? '(mín. 6 caracteres)' : ''}
              </label>
              <button
                type="button"
                onClick={() => setMostrarPassword((v) => !v)}
                className="cursor-pointer font-ticket text-[10px] font-bold text-[#FF7A1F] hover:underline"
              >
                {mostrarPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <input
              id="auth-password"
              type={mostrarPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete={
                pestana === 'registro' ? 'new-password' : 'current-password'
              }
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg(null);
              }}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-white/15 bg-[#120F0D] px-3.5 py-2.5 text-sm text-[#F5EFE6] placeholder:text-[#C9B9A6]/40 focus:border-[#FF7A1F] focus:outline-none"
            />
          </div>

          {pestana === 'registro' && (
            <>
              <div>
                <label
                  htmlFor="auth-nombre"
                  className="block font-ticket text-[11px] uppercase text-[#C9B9A6]"
                >
                  Tu Nombre o Alias Callejero (saldrá en tus tickets)
                </label>
                <input
                  id="auth-nombre"
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
                    htmlFor="auth-barrio"
                    className="block font-ticket text-[10px] uppercase text-[#C9B9A6]"
                  >
                    Tu Barrio Base
                  </label>
                  <select
                    id="auth-barrio"
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
                    htmlFor="auth-salsa"
                    className="block font-ticket text-[10px] uppercase text-[#C9B9A6]"
                  >
                    Salsa de Cabecera
                  </label>
                  <select
                    id="auth-salsa"
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
            </>
          )}

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
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF3B30] via-[#FF5126] to-[#FF7A1F] py-3.5 font-rotulo text-xl uppercase tracking-wider text-[#F5EFE6] shadow-[0_0_24px_rgba(255,59,48,0.45)] transition-transform active:scale-95"
          >
            <Icono nombre="verified" className="h-5 w-5" />
            <span>
              {pestana === 'registro'
                ? 'CREAR PERFIL Y ENTRAR (+100 XP)'
                : 'INICIAR SESIÓN EN MI PERFIL'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
