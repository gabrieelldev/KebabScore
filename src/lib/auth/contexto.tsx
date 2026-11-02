// =====================================================================
// Contexto de Autenticación y Base de Perfiles (src/lib/auth/contexto.tsx)
// ---------------------------------------------------------------------
// Explicación para 1.º de DAW:
// - Gestiona la sesión activa (`usuarioActual`) y también una base de
//   datos local de perfiles registrados (`kebabscore_cuentas_registradas_v1`)
//   además de sincronizar con Supabase Auth si `.env.local` tiene claves.
// - Cuando inicias sesión con Google, Apple o Correo:
//     1. Si tu correo ya tenía un perfil registrado, recupera tu nivel,
//        tu XP, tus tickets verificados y tus sellos GPS.
//     2. Si es la primera vez que entras, crea tu ficha de Crítico con
//        +100 XP de bienvenida y la guarda inmediatamente como tu perfil.
// =====================================================================

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ResenaTicket } from '@/lib/datos/tipos';
import { crearClienteNavegador } from '@/lib/supabase/browser';

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

const CLAVE_SESION_ACTIVA = 'kebabscore_perfil_usuario_v1';
const CLAVE_CUENTAS_GUARDADAS = 'kebabscore_cuentas_registradas_v1';
export const CLAVE_RETORNO_OAUTH = 'kebabscore_oauth_return_to';

export type DatosRegistro = {
  email: string;
  nombre: string;
  metodoAuth: MetodoAuth;
  barrioBase: string;
  salsaFavorita: 'Mixta Chorreo' | 'Roja Picante' | 'Blanca Yogur';
};

type ContextoAuthValor = {
  hidratado: boolean;
  usuarioActual: PerfilUsuario | null;
  cuentasGuardadas: PerfilUsuario[];
  registrarOIniciarPerfil: (datos: DatosRegistro) => PerfilUsuario;
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

function leerMapaCuentas(): Record<string, PerfilUsuario> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CLAVE_CUENTAS_GUARDADAS);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, PerfilUsuario>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function guardarPerfilEnStorage(perfil: PerfilUsuario) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLAVE_SESION_ACTIVA, JSON.stringify(perfil));
    const mapa = leerMapaCuentas();
    mapa[perfil.email.toLowerCase()] = perfil;
    window.localStorage.setItem(CLAVE_CUENTAS_GUARDADAS, JSON.stringify(mapa));
  } catch {
    // Ignoramos errores de cuota de localStorage
  }
}

export function ProveedorAuth({ children }: { children: React.ReactNode }) {
  const [hidratado, setHidratado] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState<PerfilUsuario | null>(null);
  const [cuentasGuardadas, setCuentasGuardadas] = useState<PerfilUsuario[]>([]);

  // Hidratación inicial desde localStorage sin sobrescribir si ya se inició sesión
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      try {
        const mapa = leerMapaCuentas();
        setCuentasGuardadas(Object.values(mapa));

        const guardado = window.localStorage.getItem(CLAVE_SESION_ACTIVA);
        if (guardado) {
          const parsed = JSON.parse(guardado) as PerfilUsuario;
          if (parsed && parsed.email && parsed.nombre) {
            setUsuarioActual((prev) => prev ?? parsed);
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
        const email = session.user.email.toLowerCase();
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
          if (prev && prev.email.toLowerCase() === email) {
            return prev;
          }
          const existente = leerMapaCuentas()[email];
          const perfil: PerfilUsuario = existente ?? {
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
          guardarPerfilEnStorage(perfil);
          setCuentasGuardadas(Object.values(leerMapaCuentas()));
          return perfil;
        });
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // Cada vez que cambia `usuarioActual` (por ganar XP, subir ticket o fichar GPS),
  // actualizamos tanto la sesión activa como la base de perfiles registrados.
  useEffect(() => {
    if (!hidratado) return;
    if (usuarioActual) {
      guardarPerfilEnStorage(usuarioActual);
    }
  }, [hidratado, usuarioActual]);

  const registrarOIniciarPerfil = useCallback(
    (datos: DatosRegistro): PerfilUsuario => {
      const correoLimpio = datos.email.trim().toLowerCase();
      const nombreLimpio =
        datos.nombre.trim() || correoLimpio.split('@')[0] || 'Crítico Nocturno';

      const mapa = leerMapaCuentas();
      const cuentaPrevia = mapa[correoLimpio];

      const perfilFinal: PerfilUsuario = cuentaPrevia
        ? {
            ...cuentaPrevia,
            nombre: nombreLimpio || cuentaPrevia.nombre,
            alias: crearSlugAlias(nombreLimpio || cuentaPrevia.nombre),
            iniciales: calcularIniciales(nombreLimpio || cuentaPrevia.nombre),
            metodoAuth: datos.metodoAuth,
            barrioBase: datos.barrioBase || cuentaPrevia.barrioBase,
            salsaFavorita: datos.salsaFavorita || cuentaPrevia.salsaFavorita,
          }
        : {
            id: `usr-${Date.now()}`,
            email: correoLimpio,
            nombre: nombreLimpio,
            alias: crearSlugAlias(nombreLimpio),
            iniciales: calcularIniciales(nombreLimpio),
            metodoAuth: datos.metodoAuth,
            barrioBase: datos.barrioBase,
            salsaFavorita: datos.salsaFavorita,
            nivel: 1,
            xp: 100, // Bono de bienvenida por crear su ficha de crítico
            creadoEn: new Date().toISOString(),
            ticketsPublicados: [],
            sellosGps: {},
          };

      guardarPerfilEnStorage(perfilFinal);
      setCuentasGuardadas(Object.values(leerMapaCuentas()));
      setUsuarioActual(perfilFinal);
      setHidratado(true);
      return perfilFinal;
    },
    [],
  );

  const cerrarSesion = useCallback(() => {
    const supabase = crearClienteNavegador();
    if (supabase) {
      void supabase.auth.signOut();
    }
    try {
      window.localStorage.removeItem(CLAVE_SESION_ACTIVA);
    } catch {}
    setUsuarioActual(null);
  }, []);

  const registrarSelloGps = useCallback(
    (localSlug: string, distanciaMetros: number) => {
      setUsuarioActual((prev) => {
        if (!prev) return prev;
        const actualizado: PerfilUsuario = {
          ...prev,
          sellosGps: {
            ...prev.sellosGps,
            [localSlug]: {
              fechaIso: new Date().toISOString(),
              distanciaMetros: Math.round(distanciaMetros),
            },
          },
        };
        guardarPerfilEnStorage(actualizado);
        return actualizado;
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
        const actualizado: PerfilUsuario = {
          ...prev,
          xp: nuevoXp,
          nivel: nuevoNivel,
          ticketsPublicados: [ticket, ...prev.ticketsPublicados],
        };
        guardarPerfilEnStorage(actualizado);
        return actualizado;
      });
    },
    [],
  );

  const sumarXp = useCallback((puntos: number) => {
    setUsuarioActual((prev) => {
      if (!prev) return prev;
      const nuevoXp = prev.xp + puntos;
      const nuevoNivel = Math.max(1, Math.floor(nuevoXp / 500) + 1);
      const actualizado: PerfilUsuario = {
        ...prev,
        xp: nuevoXp,
        nivel: nuevoNivel,
      };
      guardarPerfilEnStorage(actualizado);
      return actualizado;
    });
  }, []);

  const valor = useMemo<ContextoAuthValor>(
    () => ({
      hidratado,
      usuarioActual,
      cuentasGuardadas,
      registrarOIniciarPerfil,
      cerrarSesion,
      registrarSelloGps,
      registrarTicketVerificado,
      sumarXp,
    }),
    [
      hidratado,
      usuarioActual,
      cuentasGuardadas,
      registrarOIniciarPerfil,
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
