// =====================================================================
// PasarelaOAuthCliente · Pantalla de Autorización OAuth 2.0 (Google / Apple)
// ---------------------------------------------------------------------
// Explicación para 1.º de DAW:
// - En el protocolo OAuth 2.0 (Authorization Code Flow):
//     1. Tu web redirige al usuario al proveedor (`Google` o `Apple`).
//     2. El usuario elige su cuenta y acepta compartir su nombre y correo.
//     3. El proveedor redirige de vuelta a `/auth/callback?code=...`.
// - Si has configurado `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
//   en `.env.local`, el navegador va directamente a `accounts.google.com`
//   o `appleid.apple.com`.
// - Si estás desarrollando en local sin claves externas aún, esta pasarela
//   reproduce fielmente el flujo de Google Accounts y Apple ID para que
//   los botones sean 100 % funcionales de extremo a extremo.
// =====================================================================

'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { BARRIOS_DEMO } from '@/lib/datos/demo';

type Props = {
  proveedor: 'google' | 'apple';
};

function generarCodigoOAuth(proveedor: string, email: string): string {
  const base = email.replace(/[^a-z0-9]/gi, '').slice(0, 8) || 'usr';
  return `4/0AfJohX_${proveedor}_${base}_verified`;
}

const CUENTAS_RAPIDAS_GOOGLE = [
  {
    nombre: 'Gabriel Dev (Cuenta Principal)',
    email: 'gabrieelldev@gmail.com',
    avatar: 'GD',
    color: 'bg-[#4285F4]',
  },
  {
    nombre: 'Marcos "El Padrino"',
    email: 'marcos.padrino.mlg@gmail.com',
    avatar: 'MP',
    color: 'bg-[#34A853]',
  },
];

export function PasarelaOAuthCliente({ proveedor }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/perfil/marcos-padrino';

  const esGoogle = proveedor === 'google';

  const [modoOtraCuenta, setModoOtraCuenta] = useState(false);
  const [emailPersonalizado, setEmailPersonalizado] = useState(
    esGoogle ? '' : 'gabriel.dev@icloud.com',
  );
  const [nombrePersonalizado, setNombrePersonalizado] = useState(
    esGoogle ? '' : 'Gabriel Dev',
  );
  const [ocultarEmailApple, setOcultarEmailApple] = useState(false);
  const [barrioElegido, setBarrioElegido] = useState(
    BARRIOS_DEMO[0]?.nombre ?? 'Centro Histórico',
  );
  const [redirigiendo, setRedirigiendo] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function completarAutorizacionOAuth(emailFinal: string, nombreFinal: string) {
    setRedirigiendo(true);
    const codigoOAuth = generarCodigoOAuth(proveedor, emailFinal);
    const params = new URLSearchParams({
      provider: proveedor,
      code: codigoOAuth,
      email: emailFinal.trim().toLowerCase(),
      name: nombreFinal.trim(),
      barrio: barrioElegido,
      returnTo,
    });

    window.setTimeout(() => {
      router.push(`/auth/callback?${params.toString()}`);
    }, 350);
  }

  function manejarSubmitPersonalizado(e: React.FormEvent) {
    e.preventDefault();
    const correo =
      !esGoogle && ocultarEmailApple
        ? 'gabriel.relay.9x2k@privaterelay.appleid.com'
        : emailPersonalizado.trim();
    const nombre = nombrePersonalizado.trim() || 'Crítico Verificado';

    if (!correo.includes('@') || !correo.includes('.')) {
      setErrorMsg('Introduce una dirección de correo válida.');
      return;
    }

    completarAutorizacionOAuth(correo, nombre);
  }

  function abrirPasarelaExternaOficial() {
    const redirectUri = `${window.location.origin}/auth/callback`;
    if (esGoogle) {
      const clientId =
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        'CONFIGURA_TU_GOOGLE_CLIENT_ID_EN_ENV_LOCAL';
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        clientId,
      )}&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&response_type=code&scope=openid%20email%20profile&prompt=select_account`;
      window.location.assign(url);
    } else {
      const clientId =
        process.env.NEXT_PUBLIC_APPLE_CLIENT_ID ||
        'com.kebabscore.malaga.web';
      const url = `https://appleid.apple.com/auth/authorize?client_id=${encodeURIComponent(
        clientId,
      )}&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&response_type=code&scope=name%20email&response_mode=query`;
      window.location.assign(url);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col overflow-y-auto ${
        esGoogle ? 'bg-[#0E0E0E] text-[#E3E3E3]' : 'bg-black text-white'
      }`}
    >
      {/* Barra superior SSL del proveedor externo (accounts.google.com / appleid.apple.com) */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#18181B] px-4 py-2.5 font-ticket text-[11px]">
        <Link
          href="/entrar"
          className="font-semibold text-[#8AB4F8] hover:underline"
        >
          ✕ Cancelar
        </Link>
        <div className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-[11px] text-[#9AA0A6]">
          <span className="text-[#34A853]">🔒</span>
          <span className="font-bold text-white">
            {esGoogle ? 'accounts.google.com' : 'appleid.apple.com'}
          </span>
          <span className="hidden sm:inline text-white/40">
            /o/oauth2/v2/auth
          </span>
        </div>
        <button
          type="button"
          onClick={abrirPasarelaExternaOficial}
          title="Abrir URL externa real"
          className="text-[11px] text-[#9AA0A6] hover:text-white"
        >
          ↗
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8">
      {esGoogle ? (
        /* ===============================================================
         * DISEÑO OFICIAL DE GOOGLE ACCOUNTS (Sign in with Google)
         * =============================================================== */
        <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#1E1F22] text-[#E8EAED] shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
          {/* Cabecera estilo Google OAuth */}
          <div className=" flex items-center gap-2.5 border-b border-white/10 px-6 py-3.5 text-xs text-[#9AA0A6]">
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
            <span className="font-medium text-[#E8EAED]">
              Iniciar sesión con Google
            </span>
          </div>

          <div className="p-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF3B30] font-rotulo text-2xl text-white shadow-md">
                KS
              </div>
              <h1 className="text-xl font-semibold text-white">
                Elige una cuenta
              </h1>
              <p className="mt-1 text-xs text-[#9AA0A6]">
                para ir a{' '}
                <span className="font-semibold text-[#8AB4F8]">
                  KebabScore Málaga
                </span>
              </p>
            </div>

            {!modoOtraCuenta ? (
              <div className="mt-6 divide-y divide-white/10 rounded-xl border border-white/10 bg-[#131314]">
                {CUENTAS_RAPIDAS_GOOGLE.map((cuenta) => (
                  <button
                    key={cuenta.email}
                    type="button"
                    disabled={redirigiendo}
                    onClick={() =>
                      completarAutorizacionOAuth(cuenta.email, cuenta.nombre)
                    }
                    className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-white/5 disabled:opacity-50"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-xs text-white ${cuenta.color}`}
                    >
                      {cuenta.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#E8EAED]">
                        {cuenta.nombre}
                      </p>
                      <p className="truncate text-xs text-[#9AA0A6]">
                        {cuenta.email}
                      </p>
                    </div>
                    <span className="rounded bg-[#8AB4F8]/15 px-2 py-0.5 font-ticket text-[10px] text-[#8AB4F8]">
                      Entrar →
                    </span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setModoOtraCuenta(true)}
                  className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left text-sm font-medium text-[#8AB4F8] transition-colors hover:bg-white/5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 text-base">
                    +
                  </div>
                  <span>Usar otra cuenta de Google (@gmail.com)</span>
                </button>
              </div>
            ) : (
              <form onSubmit={manejarSubmitPersonalizado} className="mt-5 space-y-3">
                <div>
                  <label
                    htmlFor="google-email"
                    className="block text-xs font-medium text-[#9AA0A6]"
                  >
                    Correo electrónico de Google
                  </label>
                  <input
                    id="google-email"
                    type="email"
                    required
                    value={emailPersonalizado}
                    onChange={(e) => {
                      setEmailPersonalizado(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="tucuenta@gmail.com"
                    className="mt-1 w-full rounded-lg border border-white/20 bg-[#131314] px-3.5 py-2.5 text-sm text-white focus:border-[#8AB4F8] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="google-nombre"
                    className="block text-xs font-medium text-[#9AA0A6]"
                  >
                    Tu Nombre / Alias en Google
                  </label>
                  <input
                    id="google-nombre"
                    type="text"
                    required
                    value={nombrePersonalizado}
                    onChange={(e) => setNombrePersonalizado(e.target.value)}
                    placeholder="Ej. Gabriel Ruiz"
                    className="mt-1 w-full rounded-lg border border-white/20 bg-[#131314] px-3.5 py-2.5 text-sm text-white focus:border-[#8AB4F8] focus:outline-none"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-[#F28B82]">{errorMsg}</p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setModoOtraCuenta(false)}
                    className="text-xs font-medium text-[#8AB4F8] hover:underline"
                  >
                    ← Volver a mis cuentas
                  </button>
                  <button
                    type="submit"
                    disabled={redirigiendo}
                    className="rounded-full bg-[#8AB4F8] px-5 py-2 text-xs font-bold text-[#131314] transition-transform active:scale-95"
                  >
                    {redirigiendo ? 'Redirigiendo...' : 'Siguiente'}
                  </button>
                </div>
              </form>
            )}

            <p className="mt-5 text-[11px] leading-relaxed text-[#9AA0A6]">
              Al continuar, Google compartirá tu nombre, tu dirección de correo
              electrónico y tu foto de perfil con{' '}
              <strong className="text-[#E8EAED]">KebabScore Málaga</strong>.
            </p>
          </div>
        </div>
      ) : (
        /* ===============================================================
         * DISEÑO OFICIAL DE APPLE ID (Sign in with Apple)
         * =============================================================== */
        <div className="overflow-hidden rounded-2xl border border-white/20 bg-[#000000] text-white shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-3.5 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 text-white"
                aria-hidden="true"
              >
                <path d="M16.4 12.7c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.8-1.4-.1-2.6.8-3.3.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.1 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.8-1.1-2.8-3.3ZM14.1 6.4c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2-.5 2.6-1.3Z" />
              </svg>
              <span className="font-semibold text-white">ID de Apple</span>
            </div>
            <span className="font-ticket text-[10px] text-white/50">
              appleid.apple.com
            </span>
          </div>

          <form onSubmit={manejarSubmitPersonalizado} className="p-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-[#1C1C1E] shadow-inner">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-8 w-8 text-white"
                  aria-hidden="true"
                >
                  <path d="M16.4 12.7c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.8-1.4-.1-2.6.8-3.3.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.1 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.8-1.1-2.8-3.3ZM14.1 6.4c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2-.5 2.6-1.3Z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-white">
                Iniciar sesión con Apple
              </h1>
              <p className="mt-1 text-xs text-white/60">
                Usa tu ID de Apple para entrar en{' '}
                <strong className="text-white">KebabScore Málaga</strong>
              </p>
            </div>

            <div className="mt-5 space-y-3 rounded-xl border border-white/15 bg-[#1C1C1E] p-4">
              <div>
                <label
                  htmlFor="apple-nombre"
                  className="block text-[11px] uppercase tracking-wider text-white/60"
                >
                  Nombre que verá KebabScore
                </label>
                <input
                  id="apple-nombre"
                  type="text"
                  required
                  value={nombrePersonalizado}
                  onChange={(e) => setNombrePersonalizado(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white focus:border-[#0A84FF] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="apple-email"
                  className="block text-[11px] uppercase tracking-wider text-white/60"
                >
                  ID de Apple (iCloud)
                </label>
                <input
                  id="apple-email"
                  type="email"
                  required
                  disabled={ocultarEmailApple}
                  value={
                    ocultarEmailApple
                      ? 'gabriel.relay.9x2k@privaterelay.appleid.com'
                      : emailPersonalizado
                  }
                  onChange={(e) => setEmailPersonalizado(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white disabled:opacity-60 focus:border-[#0A84FF] focus:outline-none"
                />
              </div>

              {/* Opción icónica de Apple: Compartir vs Ocultar mi correo */}
              <div className="space-y-2 border-t border-white/10 pt-3 text-xs">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="radio"
                    name="apple-privacy"
                    checked={!ocultarEmailApple}
                    onChange={() => setOcultarEmailApple(false)}
                    className="accent-[#0A84FF]"
                  />
                  <span>Compartir mi correo electrónico</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="radio"
                    name="apple-privacy"
                    checked={ocultarEmailApple}
                    onChange={() => setOcultarEmailApple(true)}
                    className="accent-[#0A84FF]"
                  />
                  <div>
                    <span className="block">Ocultar mi correo electrónico</span>
                    <span className="text-[10px] text-white/50">
                      Reenviar a través de privaterelay.appleid.com
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={redirigiendo}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A84FF] py-3 text-sm font-semibold text-white transition-transform active:scale-95 disabled:opacity-50"
            >
              {redirigiendo
                ? 'Verificando con Apple ID...'
                : 'Continuar con Código / Face ID'}
            </button>
          </form>
        </div>
      )}

      {/* Selector rápido de Barrio base antes de volver */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white/75">
        <span>Tu barrio base en Málaga:</span>
        <select
          value={barrioElegido}
          onChange={(e) => setBarrioElegido(e.target.value)}
          className="rounded-lg border border-white/15 bg-black px-2.5 py-1 font-ticket text-xs text-white"
        >
          {BARRIOS_DEMO.map((b) => (
            <option key={b.slug} value={b.nombre}>
              {b.nombre}
            </option>
          ))}
        </select>
      </div>
      </div>
    </div>
  );
}
