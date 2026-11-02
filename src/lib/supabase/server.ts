// =====================================================================
// Cliente de Supabase para el SERVIDOR (Server Components)
// ---------------------------------------------------------------------
// Para leer datos públicos (locales, barrios, reseñas, notas) no hace
// falta leer cookies: las políticas RLS permiten leerlos a 'anon'.
// Cuando en el Paso 4 añadamos el login con Google, Apple y email,
// conectaremos las cookies aquí para que sepa quién ha iniciado sesión.
// =====================================================================

import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export function supabaseConfigurado(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Devuelve el cliente de Supabase, o null si aún no has puesto .env.local (modo demo). */
export function crearClienteServidor(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}
