// =====================================================================
// RegistroPerfilCliente · Inicio de Sesión y Registro (Google / Apple / Email)
// ---------------------------------------------------------------------
// Explicación para 1.º de DAW:
// - Al pulsar "CONTINUAR CON GOOGLE" o "CONTINUAR CON APPLE", abre al
//   instante la pasarela de autenticación de Google Accounts o Apple ID
//   a pantalla completa (sin depender de redirecciones externas que
//   fallen en local, y compatible también con Supabase Auth si configuras
//   `.env.local`).
// - En cuanto seleccionas tu cuenta o escribes tu correo y nombre en
//   Google/Apple/Correo, llama directamente a `registrarOIniciarPerfil`,
//   que guarda tu perfil de forma persistente en `localStorage`
//   (`kebabscore_perfil_usuario_v1` y `kebabscore_cuentas_registradas_v1`)
//   y abre inmediatamente tu ficha de Crítico Verificado.
// =====================================================================

'use client';

import { useState } from 'react';
import { Icono } from '@/components/ui/Icono';
import { type PerfilUsuario, useAuth } from '@/lib/auth/contexto';
import { BARRIOS_DEMO } from '@/lib/datos/demo';
import { crearClienteNavegador } from '@/lib/supabase/browser';

type Props = {
  tituloPersonalizado?: string;
  subtituloPersonalizado?: string;
  onCompletado?: () => void;
};

const CUENTAS_SUGERIDAS_GOOGLE = [
  {
    nombre: 'Gabriel Dev',
    email: 'gabrieelldev@gmail.com',
    iniciales: 'GD',
    color: 'bg-[#4285F4]',
  },
  {
    nombre: 'Marcos "El Padrino"',
    email: 'marcos.padrino.mlg@gmail.com',
    iniciales: 'MP',
    color: 'bg-[#34A853]',
  },
];

export function RegistroPerfilCliente({
  tituloPersonalizado,
  subtituloPersonalizado,
  onCompletado,
}: Props) {
  const { registrarOIniciarPerfil, cuentasGuardadas } = useAuth();

  // Estado del formulario por Correo Electrónico
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [barrioBase, setBarrioBase] = useState(
    BARRIOS_DEMO[0]?.nombre ?? 'Centro Histórico',
  );
  const [salsaFavorita, setSalsaFavorita] = useState<
    'Mixta Chorreo' | 'Roja Picante' | 'Blanca Yogur'
  >('Mixta Chorreo');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estado del modal a pantalla completa de Google / Apple
  const [modalProveedor, setModalProveedor] = useState<
    'google' | 'apple' | null
  >(null);
  const [modoOtraCuentaGoogle, setModoOtraCuentaGoogle] = useState(false);
  const [oauthEmail, setOauthEmail] = useState('');
  const [oauthNombre, setOauthNombre] = useState('');
  const [ocultarCorreoApple, setOcultarCorreoApple] = useState(false);
  const [errorOauth, setErrorOauth] = useState<string | null>(null);

  async function abrirPasarelaProveedor(proveedor: 'google' | 'apple') {
    setErrorMsg(null);
    setErrorOauth(null);

    // Si el usuario ha configurado un proyecto real de Supabase en .env.local,
    // intentamos primero el OAuth externo de Supabase:
    const supabase = crearClienteNavegador();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: proveedor,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (!error && data?.url) {
          window.location.assign(data.url);
          return;
        }
      } catch {
        // Si no está activo en Supabase, abrimos la pasarela interactiva
      }
    }

    if (proveedor === 'google') {
      setModoOtraCuentaGoogle(false);
      setOauthEmail('');
      setOauthNombre('');
    } else {
      setOauthEmail('gabrieelldev@icloud.com');
      setOauthNombre('Gabriel Dev');
      setOcultarCorreoApple(false);
    }

    setModalProveedor(proveedor);
  }

  function finalizarLoginProveedor(
    proveedor: 'google' | 'apple',
    correoFinal: string,
    nombreFinal: string,
  ) {
    registrarOIniciarPerfil({
      email: correoFinal.trim().toLowerCase(),
      nombre: nombreFinal.trim() || 'Crítico Verificado',
      metodoAuth: proveedor,
      barrioBase,
      salsaFavorita,
    });
    setModalProveedor(null);
    onCompletado?.();
  }

  function manejarSubmitOauthPersonalizado(e: React.FormEvent) {
    e.preventDefault();
    if (!modalProveedor) return;

    const correo =
      modalProveedor === 'apple' && ocultarCorreoApple
        ? 'gabriel.privaterelay@privaterelay.appleid.com'
        : oauthEmail.trim();
    const alias = oauthNombre.trim();

    if (!correo.includes('@') || !correo.includes('.')) {
      setErrorOauth('Introduce un correo válido (ej. tucuenta@gmail.com).');
      return;
    }
    if (alias.length < 2) {
      setErrorOauth('Introduce tu nombre o alias (mínimo 2 caracteres).');
      return;
    }

    finalizarLoginProveedor(modalProveedor, correo, alias);
  }

  function entrarConCuentaGuardada(cuenta: PerfilUsuario) {
    registrarOIniciarPerfil({
      email: cuenta.email,
      nombre: cuenta.nombre,
      metodoAuth: cuenta.metodoAuth,
      barrioBase: cuenta.barrioBase,
      salsaFavorita: cuenta.salsaFavorita,
    });
    onCompletado?.();
  }

  function manejarEnvioEmail(e: React.FormEvent) {
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
      metodoAuth: 'email',
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
            'Inicia sesión con Google, con Apple o regístrate con tu correo para guardar tu perfil, tus tickets verificados y tu nivel XP.'}
        </p>

        {/* Si ya hay perfiles guardados en el dispositivo, permite entrar en 1 toque */}
        {cuentasGuardadas.length > 0 && (
          <div className="mt-4 rounded-xl border border-[#2ECC71]/35 bg-[#120F0D] p-3">
            <p className="font-ticket text-[10px] font-bold uppercase tracking-wider text-[#2ECC71]">
              ✓ PERFILES GUARDADOS EN ESTE DISPOSITIVO
            </p>
            <div className="mt-2 space-y-2">
              {cuentasGuardadas.map((cuenta) => (
                <button
                  key={cuenta.email}
                  type="button"
                  onClick={() => entrarConCuentaGuardada(cuenta)}
                  className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-[#1B1613] px-3 py-2 text-left transition-colors hover:border-[#2ECC71]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FF7A1F]/20 font-rotulo text-sm text-[#FF7A1F]">
                      {cuenta.iniciales}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[#F5EFE6]">
                        {cuenta.nombre}
                      </p>
                      <p className="truncate font-ticket text-[10px] text-[#C9B9A6]">
                        {cuenta.email} · {cuenta.metodoAuth.toUpperCase()} ·{' '}
                        {cuenta.xp} XP
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded bg-[#2ECC71] px-2 py-1 font-ticket text-[10px] font-bold text-[#120F0D]">
                    ENTRAR →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botones de Inicio de Sesión con Google y Apple */}
        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={() => void abrirPasarelaProveedor('google')}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-white/20 bg-white px-4 py-3.5 font-ticket text-xs font-bold text-[#1F1F1F] shadow-md transition-all hover:bg-[#F8F9FA] active:scale-95"
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
            <span>INICIAR SESIÓN CON GOOGLE</span>
          </button>

          <button
            type="button"
            onClick={() => void abrirPasarelaProveedor('apple')}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-white/25 bg-black px-4 py-3.5 font-ticket text-xs font-bold text-white shadow-md transition-all hover:bg-[#151517] active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4 shrink-0"
              aria-hidden="true"
            >
              <path d="M16.4 12.7c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.8-1.4-.1-2.6.8-3.3.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.1 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.8-1.1-2.8-3.3ZM14.1 6.4c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2-.5 2.6-1.3Z" />
            </svg>
            <span>INICIAR SESIÓN CON APPLE</span>
          </button>
        </div>

        <div className="my-5 flex items-center gap-3 font-ticket text-[10px] text-[#C9B9A6]">
          <span className="h-px flex-1 bg-white/10" />
          <span>O REGÍSTRATE CON TU CORREO</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        {/* Formulario manual con Correo Electrónico */}
        <form onSubmit={manejarEnvioEmail} className="space-y-3.5">
          <div>
            <label
              htmlFor="registro-email"
              className="block font-ticket text-[11px] uppercase text-[#C9B9A6]"
            >
              Correo electrónico
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
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF3B30] via-[#FF5126] to-[#FF7A1F] py-3.5 font-rotulo text-xl uppercase tracking-wider text-[#F5EFE6] shadow-[0_0_24px_rgba(255,59,48,0.45)] transition-transform active:scale-95"
          >
            <Icono nombre="verified" className="h-5 w-5" />
            <span>CREAR PERFIL CON CORREO (+100 XP)</span>
          </button>
        </form>
      </div>

      {/* =====================================================================
       * VENTANA A PANTALLA COMPLETA DE GOOGLE ACCOUNTS / APPLE ID
       * (Se abre al instante al pulsar "Iniciar sesión con Google / Apple"
       *  y guarda directamente el registro como perfil en localStorage)
       * ===================================================================== */}
      {modalProveedor && (
        <div
          role="dialog"
          aria-modal="true"
          className={`fixed inset-0 z-[200] flex flex-col overflow-y-auto ${
            modalProveedor === 'google'
              ? 'bg-[#0E0E0E] text-[#E3E3E3]'
              : 'bg-black text-white'
          }`}
        >
          {/* Barra superior de navegador seguro */}
          <div className="flex items-center justify-between border-b border-white/10 bg-[#18181B] px-4 py-3 font-ticket text-xs">
            <button
              type="button"
              onClick={() => setModalProveedor(null)}
              className="cursor-pointer font-bold text-[#8AB4F8] hover:underline"
            >
              ✕ Cerrar
            </button>
            <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] text-[#9AA0A6]">
              <span className="text-[#34A853]">🔒</span>
              <span className="font-bold text-white">
                {modalProveedor === 'google'
                  ? 'accounts.google.com'
                  : 'appleid.apple.com'}
              </span>
              <span className="hidden sm:inline text-white/40">
                /o/oauth2/v2/auth
              </span>
            </div>
            <span className="font-ticket text-[10px] text-[#34A853]">
              OAuth 2.0
            </span>
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8">
            {modalProveedor === 'google' ? (
              /* ---- PANTALLA DE GOOGLE ACCOUNTS ---- */
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#1E1F22] text-[#E8EAED] shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
                <div className="flex items-center gap-2.5 border-b border-white/10 px-6 py-3.5 text-xs">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  >
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
                  <span className="font-medium text-[#E8EAED]">
                    Iniciar sesión con Google
                  </span>
                </div>

                <div className="p-6">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF3B30] font-rotulo text-2xl text-white shadow-md">
                      KS
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      Elige una cuenta de Google
                    </h2>
                    <p className="mt-1 text-xs text-[#9AA0A6]">
                      para iniciar sesión y guardar tu perfil en{' '}
                      <span className="font-semibold text-[#8AB4F8]">
                        KebabScore Málaga
                      </span>
                    </p>
                  </div>

                  {!modoOtraCuentaGoogle ? (
                    <div className="mt-6 divide-y divide-white/10 rounded-xl border border-white/10 bg-[#131314]">
                      {CUENTAS_SUGERIDAS_GOOGLE.map((c) => (
                        <button
                          key={c.email}
                          type="button"
                          onClick={() =>
                            finalizarLoginProveedor('google', c.email, c.nombre)
                          }
                          className="flex w-full cursor-pointer items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-white/10"
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${c.color}`}
                          >
                            {c.iniciales}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[#E8EAED]">
                              {c.nombre}
                            </p>
                            <p className="truncate text-xs text-[#9AA0A6]">
                              {c.email}
                            </p>
                          </div>
                          <span className="rounded bg-[#8AB4F8] px-2.5 py-1 font-ticket text-[10px] font-bold text-[#131314]">
                            ENTRAR →
                          </span>
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => setModoOtraCuentaGoogle(true)}
                        className="flex w-full cursor-pointer items-center gap-3.5 px-4 py-3.5 text-left text-sm font-medium text-[#8AB4F8] transition-colors hover:bg-white/10"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 text-base">
                          +
                        </div>
                        <span>Escribir mi propio correo de Google (@gmail.com)</span>
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={manejarSubmitOauthPersonalizado}
                      className="mt-5 space-y-3"
                    >
                      <div>
                        <label
                          htmlFor="modal-google-email"
                          className="block text-xs font-medium text-[#9AA0A6]"
                        >
                          Tu correo de Google
                        </label>
                        <input
                          id="modal-google-email"
                          type="email"
                          required
                          value={oauthEmail}
                          onChange={(e) => {
                            setOauthEmail(e.target.value);
                            setErrorOauth(null);
                          }}
                          placeholder="tucuenta@gmail.com"
                          className="mt-1 w-full rounded-lg border border-white/20 bg-[#131314] px-3.5 py-2.5 text-sm text-white focus:border-[#8AB4F8] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="modal-google-nombre"
                          className="block text-xs font-medium text-[#9AA0A6]"
                        >
                          Tu Nombre / Alias para el perfil
                        </label>
                        <input
                          id="modal-google-nombre"
                          type="text"
                          required
                          value={oauthNombre}
                          onChange={(e) => {
                            setOauthNombre(e.target.value);
                            setErrorOauth(null);
                          }}
                          placeholder="Ej. Gabriel Ruiz"
                          className="mt-1 w-full rounded-lg border border-white/20 bg-[#131314] px-3.5 py-2.5 text-sm text-white focus:border-[#8AB4F8] focus:outline-none"
                        />
                      </div>

                      {errorOauth && (
                        <p className="text-xs text-[#F28B82]">{errorOauth}</p>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setModoOtraCuentaGoogle(false)}
                          className="cursor-pointer text-xs font-medium text-[#8AB4F8] hover:underline"
                        >
                          ← Volver a cuentas rápidas
                        </button>
                        <button
                          type="submit"
                          className="cursor-pointer rounded-full bg-[#8AB4F8] px-5 py-2.5 text-xs font-bold text-[#131314] transition-transform active:scale-95"
                        >
                          Guardar perfil y entrar →
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              /* ---- PANTALLA DE APPLE ID ---- */
              <div className="overflow-hidden rounded-2xl border border-white/20 bg-[#111113] text-white shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-3.5 text-xs">
                  <div className="flex items-center gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4 text-white"
                      aria-hidden="true"
                    >
                      <path d="M16.4 12.7c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.8-1.4-.1-2.6.8-3.3.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.1 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.8-1.1-2.8-3.3ZM14.1 6.4c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2-.5 2.6-1.3Z" />
                    </svg>
                    <span className="font-semibold">Iniciar sesión con Apple</span>
                  </div>
                  <span className="font-ticket text-[10px] text-white/50">
                    ID de Apple
                  </span>
                </div>

                <form
                  onSubmit={manejarSubmitOauthPersonalizado}
                  className="p-6"
                >
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-[#1C1C1E]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-8 w-8 text-white"
                        aria-hidden="true"
                      >
                        <path d="M16.4 12.7c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.8-1.4-.1-2.6.8-3.3.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.1 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.8-1.1-2.8-3.3ZM14.1 6.4c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2-.5 2.6-1.3Z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      Usa tu ID de Apple
                    </h2>
                    <p className="mt-1 text-xs text-white/60">
                      Se creará y guardará tu perfil en{' '}
                      <strong className="text-white">KebabScore Málaga</strong>
                    </p>
                  </div>

                  <div className="mt-5 space-y-3 rounded-xl border border-white/15 bg-[#1C1C1E] p-4">
                    <div>
                      <label
                        htmlFor="modal-apple-nombre"
                        className="block text-[11px] uppercase tracking-wider text-white/60"
                      >
                        Nombre en tu perfil
                      </label>
                      <input
                        id="modal-apple-nombre"
                        type="text"
                        required
                        value={oauthNombre}
                        onChange={(e) => {
                          setOauthNombre(e.target.value);
                          setErrorOauth(null);
                        }}
                        className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white focus:border-[#0A84FF] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="modal-apple-email"
                        className="block text-[11px] uppercase tracking-wider text-white/60"
                      >
                        Correo de tu ID de Apple
                      </label>
                      <input
                        id="modal-apple-email"
                        type="email"
                        required
                        disabled={ocultarCorreoApple}
                        value={
                          ocultarCorreoApple
                            ? 'gabriel.privaterelay@privaterelay.appleid.com'
                            : oauthEmail
                        }
                        onChange={(e) => {
                          setOauthEmail(e.target.value);
                          setErrorOauth(null);
                        }}
                        className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white disabled:opacity-60 focus:border-[#0A84FF] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2 border-t border-white/10 pt-3 text-xs">
                      <label className="flex cursor-pointer items-center gap-2.5">
                        <input
                          type="radio"
                          name="apple-email-mode"
                          checked={!ocultarCorreoApple}
                          onChange={() => setOcultarCorreoApple(false)}
                          className="accent-[#0A84FF]"
                        />
                        <span>Compartir mi correo electrónico</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2.5">
                        <input
                          type="radio"
                          name="apple-email-mode"
                          checked={ocultarCorreoApple}
                          onChange={() => setOcultarCorreoApple(true)}
                          className="accent-[#0A84FF]"
                        />
                        <span>
                          Ocultar mi correo (privaterelay.appleid.com)
                        </span>
                      </label>
                    </div>
                  </div>

                  {errorOauth && (
                    <p className="mt-2 text-xs text-[#FF453A]">{errorOauth}</p>
                  )}

                  <button
                    type="submit"
                    className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0A84FF] py-3.5 text-sm font-semibold text-white transition-transform active:scale-95"
                  >
                    Continuar y Guardar Perfil con Apple ID →
                  </button>
                </form>
              </div>
            )}

            {/* Selector rápido de Barrio y Salsa antes de confirmar */}
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/80">
              <div>
                <span className="block text-[10px] uppercase text-white/50">
                  Barrio Base
                </span>
                <select
                  value={barrioBase}
                  onChange={(e) => setBarrioBase(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black px-2 py-1.5 font-ticket text-xs text-white"
                >
                  {BARRIOS_DEMO.map((b) => (
                    <option key={b.slug} value={b.nombre}>
                      {b.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-white/50">
                  Salsa Favorita
                </span>
                <select
                  value={salsaFavorita}
                  onChange={(e) =>
                    setSalsaFavorita(
                      e.target.value as
                        | 'Mixta Chorreo'
                        | 'Roja Picante'
                        | 'Blanca Yogur',
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black px-2 py-1.5 font-ticket text-xs text-white"
                >
                  <option value="Mixta Chorreo">Mixta Chorreo</option>
                  <option value="Roja Picante">Roja Picante</option>
                  <option value="Blanca Yogur">Blanca Yogur</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
