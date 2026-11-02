// =====================================================================
// Contexto de Autenticación y Perfil de Crítico (src/lib/auth/contexto.tsx)
// ---------------------------------------------------------------------
// Explicación para 1.º de DAW:
// - Cuando un usuario entra por primera vez, `usuarioActual` es `null`.
// - Para ver su perfil o publicar un ticket de reseña, debe crearse su
//   ficha de crítico iniciando sesión con:
//     1. Google OAuth (`iniciarSesionConProveedor('google')`)
//     2. Apple ID (`iniciarSesionConProveedor('apple')`)
//     3. Correo electrónico (Registro directo / Magic Link)
// - Cómo funciona la redirección OAuth al pulsar Google o Apple:
//     A) Si `.env.local` tiene `NEXT_PUBLIC_SUPABASE_URL` y
//        `NEXT_PUBLIC_SUPABASE_ANON_KEY`, llama a
//        `supabase.auth.signInWithOAuth({ provider })`, que redirige a
//        `accounts.google.com` o `appleid.apple.com` y vuelve a `/auth/callback`.
//     B) Si `.env.local` tiene `NEXT_PUBLIC_GOOGLE_CLIENT_ID` o
//        `NEXT_PUBLIC_APPLE_CLIENT_ID`, redirige directamente a la URL
//        oficial OAuth 2.0 de Google/Apple.
//     C) Si aún no hay claves en `.env.local`, redirige a la Pasarela
//        OAuth (`/auth/oauth/google` o `/auth/oauth/apple`), que reproduce
//        el selector de cuentas de Google/Apple y redirige a `/auth/callback`.
// =====================================================================

'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ResenaTicket } from '@/lib/datos/tipos';
import {
  construirUrlOAuthDirecta,
  crearClienteNavegador,
} from '@/lib/supabase/browser';

export type MetodoAuth = 'email' | 'google' | 'apple';

export type MetodoVerificacion =
  | 'gps_checkin'
  | 'receipt_photo'
  | 'double_verified';

export type TicketUsuarioVerificado = ResenaTicket & {
  localSlug: string;
  localNombre: string;
  barrioNombre: string;
  metodoVerificacion: MetodoVerificacion;
  distanciaMetros: number | null;
  referenciaTicketCaja: string | null;
};

export type PerfilUsuario = {
  id: string;
  email: string;
  nombre: string;
  alias: string;
  iniciales: string;
  metodoAuth: MetodoAuth;
  barrioBase: string;
  salsaFavorita: 'Mixta Chorreo' | 'Roja Picante' | 'Blanca Yogur';
  nivel: number;
  xp: number;
  creadoEn: string;
  ticketsPublicados: TicketUsuarioVerificado[];
  /** Mapa slugLocal -> fecha ISO del check-in GPS (válido durante 24 horas) */
  sellosGps: Record<string, { fechaIso: string; distanciaMetros: number }>;
};

const CLAVE_STORAGE_PERFIL = 'kebabscore_perfil_usuario_v1';
export const CLAVE_RETORNO_OAUTH = 'kebabscore_oauth_return_to';

type DatosRegistro = {
  email: string;
  nombre: string;
  metodoAuth: MetodoAuth;
  barrioBase: string;
  salsaFavorita: 'Mixta Chorreo' | 'Roja Picante' | 'Blanca Yogur';
};

type ContextoAuthValor = {
  hidratado: boolean;
  usuarioActual: PerfilUsuario | null;
  registrarOIniciarPerfil: (datos: DatosRegistro) => PerfilUsuario;
  iniciarSesionConProveedor: (
    proveedor: 'google' | 'apple',
    rutaRetorno?: string,
  ) => Promise<void>;
  cerrarSesion: () => void;
  registrarSelloGps: (localSlug: string, distanciaMetros: number) => void;
  registrarTicketVerificado: (
    ticket: TicketUsuarioVerificado,
    xpGanado: number,
  ) => void;
  sumarXp: (puntos: number) => void;
};

const ContextoAuth = createContext<ContextoAuthValor | null>(null);

function calcularIniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  if (partes.length >= 2) {
    return `${partes[0][0] ?? 'K'}${partes[1][0] ?? 'S'}`.toUpperCase();
  }
  return nombre.slice(0, 2).toUpperCase() || 'KS';
}

function crearSlugAlias(nombre: string): string {
  return (
    nombre
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'critico-nocturno'
  );
}

export function ProveedorAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [hidratado, setHidratado] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState<PerfilUsuario | null>(null);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      try {
        const guardado = window.localStorage.getItem(CLAVE_STORAGE_PERFIL);
        if (guardado) {
          const parsed = JSON.parse(guardado) as PerfilUsuario;
          if (parsed && parsed.email && parsed.nombre) {
            setUsuarioActual(parsed);
          }
        }
      } catch {
        // Ignoramos si no hay sesión previa
      } finally {
        setHidratado(true);
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  // Sincronización con Supabase Auth si está configurado en .env.local
  useEffect(() => {
    const supabase = crearClienteNavegador();
    if (!supabase) return;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        const email = session.user.email;
        const meta = session.user.user_metadata ?? {};
        const nombre =
          (meta.full_name as string | undefined) ||
          (meta.name as string | undefined) ||
          email.split('@')[0] ||
          'Crítico Nocturno';
        const rawProvider = session.user.app_metadata?.provider;
        const metodoAuth: MetodoAuth =
          rawProvider === 'apple'
            ? 'apple'
            : rawProvider === 'google'
              ? 'google'
              : 'email';

        setUsuarioActual((prev) => {
          if (prev && prev.email.toLowerCase() === email.toLowerCase()) {
            return prev;
          }
          return {
            id: session.user.id,
            email,
            nombre,
            alias: crearSlugAlias(nombre),
            iniciales: calcularIniciales(nombre),
            metodoAuth,
            barrioBase: 'Centro Histórico',
            salsaFavorita: 'Mixta Chorreo',
            nivel: 1,
            xp: 100,
            creadoEn: new Date().toISOString(),
            ticketsPublicados: [],
            sellosGps: {},
          };
        });
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    try {
      if (usuarioActual) {
        window.localStorage.setItem(
          CLAVE_STORAGE_PERFIL,
          JSON.stringify(usuarioActual),
        );
      } else {
        window.localStorage.removeItem(CLAVE_STORAGE_PERFIL);
      }
    } catch {}
  }, [hidratado, usuarioActual]);

  const registrarOIniciarPerfil = useCallback((datos: DatosRegistro): PerfilUsuario => {
    const nuevoPerfil: PerfilUsuario = {
      id: `usr-${Date.now()}`,
      email: datos.email.trim().toLowerCase(),
      nombre: datos.nombre.trim(),
      alias: crearSlugAlias(datos.nombre),
      iniciales: calcularIniciales(datos.nombre),
      metodoAuth: datos.metodoAuth,
      barrioBase: datos.barrioBase,
      salsaFavorita: datos.salsaFavorita,
      nivel: 1,
      xp: 100, // Bono de bienvenida por crear su ficha de crítico
      creadoEn: new Date().toISOString(),
      ticketsPublicados: [],
      sellosGps: {},
    };
    // Guardamos también sincrónicamente para que al redirigir en OAuth esté disponible al instante
    try {
      window.localStorage.setItem(
        CLAVE_STORAGE_PERFIL,
        JSON.stringify(nuevoPerfil),
      );
    } catch {}
    setUsuarioActual(nuevoPerfil);
    return nuevoPerfil;
  }, []);

  const iniciarSesionConProveedor = useCallback(
    async (proveedor: 'google' | 'apple', rutaRetorno?: string) => {
      const destinoFinal =
        rutaRetorno ||
        (typeof window !== 'undefined' &&
        window.location.pathname !== '/entrar'
          ? window.location.pathname
          : '/perfil/marcos-padrino');

      try {
        window.sessionStorage.setItem(CLAVE_RETORNO_OAUTH, destinoFinal);
      } catch {}

      const redirectUri = `${window.location.origin}/auth/callback`;

      // 1. Si Supabase está configurado en .env.local, lanzamos su flujo OAuth real
      const supabase = crearClienteNavegador();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: proveedor,
          options: {
            redirectTo: redirectUri,
          },
        });
        if (!error && data?.url) {
          window.location.assign(data.url);
          return;
        }
      }

      // 2. Si hay CLIENT_ID directo de Google Cloud o Apple Developer en .env.local
      const urlDirecta = construirUrlOAuthDirecta(
        proveedor,
        redirectUri,
        encodeURIComponent(destinoFinal),
      );
      if (urlDirecta) {
        window.location.assign(urlDirecta);
        return;
      }

      // 3. Pasarela OAuth interactiva (/auth/oauth/google o /auth/oauth/apple)
      const params = new URLSearchParams({
        returnTo: destinoFinal,
      });
      router.push(`/auth/oauth/${proveedor}?${params.toString()}`);
    },
    [router],
  );

  const cerrarSesion = useCallback(() => {
    const supabase = crearClienteNavegador();
    if (supabase) {
      void supabase.auth.signOut();
    }
    try {
      window.localStorage.removeItem(CLAVE_STORAGE_PERFIL);
    } catch {}
    setUsuarioActual(null);
  }, []);

  const registrarSelloGps = useCallback(
    (localSlug: string, distanciaMetros: number) => {
      setUsuarioActual((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sellosGps: {
            ...prev.sellosGps,
            [localSlug]: {
              fechaIso: new Date().toISOString(),
              distanciaMetros: Math.round(distanciaMetros),
            },
          },
        };
      });
    },
    [],
  );

  const registrarTicketVerificado = useCallback(
    (ticket: TicketUsuarioVerificado, xpGanado: number) => {
      setUsuarioActual((prev) => {
        if (!prev) return prev;
        const nuevoXp = prev.xp + xpGanado;
        const nuevoNivel = Math.max(1, Math.floor(nuevoXp / 500) + 1);
        return {
          ...prev,
          xp: nuevoXp,
          nivel: nuevoNivel,
          ticketsPublicados: [ticket, ...prev.ticketsPublicados],
        };
      });
    },
    [],
  );

  const sumarXp = useCallback((puntos: number) => {
    setUsuarioActual((prev) => {
      if (!prev) return prev;
      const nuevoXp = prev.xp + puntos;
      const nuevoNivel = Math.max(1, Math.floor(nuevoXp / 500) + 1);
      return {
        ...prev,
        xp: nuevoXp,
        nivel: nuevoNivel,
      };
    });
  }, []);

  const valor = useMemo<ContextoAuthValor>(
    () => ({
      hidratado,
      usuarioActual,
      registrarOIniciarPerfil,
      iniciarSesionConProveedor,
      cerrarSesion,
      registrarSelloGps,
      registrarTicketVerificado,
      sumarXp,
    }),
    [
      hidratado,
      usuarioActual,
      registrarOIniciarPerfil,
      iniciarSesionConProveedor,
      cerrarSesion,
      registrarSelloGps,
      registrarTicketVerificado,
      sumarXp,
    ],
  );

  return <ContextoAuth.Provider value={valor}>{children}</ContextoAuth.Provider>;
}

export function useAuth(): ContextoAuthValor {
  const ctx = useContext(ContextoAuth);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <ProveedorAuth>');
  }
  return ctx;
}
