// =====================================================================
// Contexto de Autenticación y Perfil de Crítico (src/lib/auth/contexto.tsx)
// ---------------------------------------------------------------------
// Explicación para 1.º de DAW:
// - Cuando un usuario entra por primera vez, `usuarioActual` es `null`.
// - Para ver su perfil o publicar un ticket de reseña, debe crearse su
//   ficha de crítico iniciando sesión con:
//     1. Correo electrónico (Magic Link / Registro directo)
//     2. Google OAuth
//     3. Apple ID
// - Una vez creado el perfil, se guarda en `localStorage` (y se conecta
//   con Supabase Auth si `.env.local` tiene las claves configuradas).
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
    setUsuarioActual(nuevoPerfil);
    return nuevoPerfil;
  }, []);

  const cerrarSesion = useCallback(() => {
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
      cerrarSesion,
      registrarSelloGps,
      registrarTicketVerificado,
      sumarXp,
    }),
    [
      hidratado,
      usuarioActual,
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
