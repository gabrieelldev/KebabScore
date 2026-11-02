// =====================================================================
// Ruta /auth/callback · Recepción del Token OAuth 2.0 (Google / Apple)
// ---------------------------------------------------------------------
// Explicación para 1.º de DAW:
// - Tanto Supabase Auth como Google Cloud (`accounts.google.com`) y
//   Apple (`appleid.apple.com`) redirigen al usuario a esta URL
//   (`/auth/callback?code=...`) tras iniciar sesión.
// - Aquí intercambiamos el código por la sesión del usuario, creamos
//   su Perfil de Crítico Verificado (+100 XP) y lo devolvemos a la
//   pantalla donde estaba (su Perfil o el Formulario de Reseña).
// =====================================================================

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
import {
  CLAVE_RETORNO_OAUTH,
  type MetodoAuth,
  useAuth,
} from '@/lib/auth/contexto';
import { crearClienteNavegador } from '@/lib/supabase/browser';

function ProcesadorCallbackOAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { registrarOIniciarPerfil } = useAuth();
  const procesadoRef = useRef(false);

  useEffect(() => {
    if (procesadoRef.current) return;
    procesadoRef.current = true;

    async function finalizarLogin() {
      const code = searchParams.get('code');
      const providerParam = searchParams.get('provider');
      const emailParam = searchParams.get('email');
      const nameParam = searchParams.get('name');
      const barrioParam = searchParams.get('barrio') || 'Centro Histórico';

      let destino =
        searchParams.get('returnTo') || '/perfil/marcos-padrino';
      try {
        const guardado = window.sessionStorage.getItem(CLAVE_RETORNO_OAUTH);
        if (!searchParams.get('returnTo') && guardado) {
          destino = guardado;
        }
        window.sessionStorage.removeItem(CLAVE_RETORNO_OAUTH);
      } catch {}

      // 1. Si viene con email y nombre desde la pasarela OAuth (Google / Apple)
      if (emailParam) {
        const metodoAuth: MetodoAuth =
          providerParam === 'apple'
            ? 'apple'
            : providerParam === 'google'
              ? 'google'
              : 'email';

        registrarOIniciarPerfil({
          email: emailParam,
          nombre: nameParam || emailParam.split('@')[0] || 'Crítico Verificado',
          metodoAuth,
          barrioBase: barrioParam,
          salsaFavorita: 'Mixta Chorreo',
        });

        window.setTimeout(() => {
          router.replace(destino);
        }, 450);
        return;
      }

      // 2. Si viene desde Supabase OAuth real con ?code=...
      const supabase = crearClienteNavegador();
      if (supabase && code) {
        try {
          const { data } = await supabase.auth.exchangeCodeForSession(code);
          const user = data?.session?.user;
          if (user?.email) {
            const meta = user.user_metadata ?? {};
            const nombre =
              (meta.full_name as string | undefined) ||
              (meta.name as string | undefined) ||
              user.email.split('@')[0] ||
              'Crítico Verificado';
            const rawProv = user.app_metadata?.provider;
            const metodoAuth: MetodoAuth =
              rawProv === 'apple'
                ? 'apple'
                : rawProv === 'google'
                  ? 'google'
                  : 'email';

            registrarOIniciarPerfil({
              email: user.email,
              nombre,
              metodoAuth,
              barrioBase: 'Centro Histórico',
              salsaFavorita: 'Mixta Chorreo',
            });
          }
        } catch {
          // Si falla el intercambio, volvemos al destino igualmente
        }
      }

      router.replace(destino);
    }

    void finalizarLogin();
  }, [registrarOIniciarPerfil, router, searchParams]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="rounded-2xl border border-[#2ECC71]/40 bg-[#1B1613] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.75)]">
        <div className="mx-auto mb-3 flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-[#2ECC71]/20 text-2xl text-[#2ECC71]">
          ✓
        </div>
        <p className="font-ticket text-[10px] font-bold uppercase tracking-widest text-[#2ECC71]">
          TOKEN OAUTH 2.0 VERIFICADO
        </p>
        <h1 className="mt-1 font-rotulo text-2xl uppercase tracking-wide text-[#F5EFE6]">
          CREANDO TU PASAPORTE DE CRÍTICO...
        </h1>
        <p className="mt-2 font-ticket text-xs text-[#C9B9A6]">
          Sincronizando cuenta y sumando +100 XP de bienvenida.
        </p>
      </div>
    </div>
  );
}

export default function PaginaAuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-16 text-center font-ticket text-xs text-[#C9B9A6]">
          Verificando sesión OAuth...
        </div>
      }
    >
      <ProcesadorCallbackOAuth />
    </Suspense>
  );
}
