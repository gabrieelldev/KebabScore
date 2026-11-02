// =====================================================================
// Cliente de Supabase para el NAVEGADOR (Client Components + OAuth)
// ---------------------------------------------------------------------
// Explicación para 1.º de DAW:
// - Este cliente se ejecuta en el navegador (`'use client'`).
// - Si has configurado `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
//   en tu archivo `.env.local`, usa el motor real de Supabase Auth para
//   redirigir a Google (`accounts.google.com`) o Apple (`appleid.apple.com`).
// - Si además configuras `NEXT_PUBLIC_GOOGLE_CLIENT_ID` o
//   `NEXT_PUBLIC_APPLE_CLIENT_ID`, puede construir directamente la URL
//   estándar del protocolo OAuth 2.0 / OpenID Connect.
// =====================================================================

'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

let clienteSingleton: SupabaseClient<Database> | null = null;

export function supabaseNavegadorConfigurado(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function crearClienteNavegador(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  if (!clienteSingleton) {
    clienteSingleton = createClient<Database>(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return clienteSingleton;
}

/**
 * Si el desarrollador ha definido `NEXT_PUBLIC_GOOGLE_CLIENT_ID` o
 * `NEXT_PUBLIC_APPLE_CLIENT_ID` en `.env.local`, construye la URL oficial
 * de autorización OAuth 2.0 de Google o Apple.
 */
export function construirUrlOAuthDirecta(
  proveedor: 'google' | 'apple',
  redirectUri: string,
  estadoCsrf: string,
): string | null {
  if (proveedor === 'google') {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return null;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      prompt: 'select_account',
      state: estadoCsrf,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
  if (!clientId) return null;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code id_token',
    scope: 'name email',
    response_mode: 'query',
    state: estadoCsrf,
  });
  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}
