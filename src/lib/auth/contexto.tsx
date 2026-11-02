// =====================================================================
// Contexto de Autenticación con Correo y Contraseña (src/lib/auth/contexto.tsx)
// ---------------------------------------------------------------------
// Explicación para 1.º de DAW:
// - Permite al usuario:
//     1. REGISTRARSE (`registrarCuenta`) con su correo electrónico,
//        contraseña, alias de crítico, barrio base de Málaga y salsa.
//     2. INICIAR SESIÓN (`iniciarSesion`) con su correo y contraseña,
//        recuperando su perfil guardado (nivel, XP, tickets y sellos GPS).
// - Guarda las cuentas registradas en `localStorage`
//   (`kebabscore_cuentas_registradas_v1`) y la sesión activa en
//   `kebabscore_perfil_usuario_v1` (además de conectarse con
//   `supabase.auth.signUp` / `signInWithPassword` si `.env.local` tiene claves).
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
  /** Huella de contraseña para validar el inicio de sesión */
  passwordGuardada?: string;
};

const CLAVE_SESION_ACTIVA = 'kebabscore_perfil_usuario_v1';
const CLAVE_CUENTAS_GUARDADAS = 'kebabscore_cuentas_registradas_v1';
export const CLAVE_RETORNO_OAUTH = 'kebabscore_oauth_return_to';

export type DatosRegistro = {
  email: string;
  password?: string;
  nombre: string;
  metodoAuth?: MetodoAuth;
  barrioBase: string;
  salsaFavorita: 'Mixta Chorreo' | 'Roja Picante' | 'Blanca Yogur';
};

export type ResultadoAuth =
  | { ok: true; perfil: PerfilUsuario }
  | { ok: false; error: string };

type ContextoAuthValor = {
  hidratado: boolean;
  usuarioActual: PerfilUsuario | null;
  cuentasGuardadas: PerfilUsuario[];
  registrarCuenta: (datos: DatosRegistro) => ResultadoAuth;
  iniciarSesion: (email: string, password: string) => ResultadoAuth;
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

  // Hidratación inicial desde localStorage
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

  // Sincronización de cambios del perfil (XP, tickets, sellos GPS)
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
            metodoAuth: datos.metodoAuth ?? 'email',
            barrioBase: datos.barrioBase || cuentaPrevia.barrioBase,
            salsaFavorita: datos.salsaFavorita || cuentaPrevia.salsaFavorita,
            passwordGuardada:
              datos.password ?? cuentaPrevia.passwordGuardada ?? '',
          }
        : {
            id: `usr-${Date.now()}`,
            email: correoLimpio,
            nombre: nombreLimpio,
            alias: crearSlugAlias(nombreLimpio),
            iniciales: calcularIniciales(nombreLimpio),
            metodoAuth: datos.metodoAuth ?? 'email',
            barrioBase: datos.barrioBase,
            salsaFavorita: datos.salsaFavorita,
            nivel: 1,
            xp: 100, // Bono de bienvenida por crear su ficha de crítico
            creadoEn: new Date().toISOString(),
            ticketsPublicados: [],
            sellosGps: {},
            passwordGuardada: datos.password ?? '',
          };

      guardarPerfilEnStorage(perfilFinal);
      setCuentasGuardadas(Object.values(leerMapaCuentas()));
      setUsuarioActual(perfilFinal);
      setHidratado(true);
      return perfilFinal;
    },
    [],
  );

  const registrarCuenta = useCallback(
    (datos: DatosRegistro): ResultadoAuth => {
      const correoLimpio = datos.email.trim().toLowerCase();
      const passwordLimpia = (datos.password ?? '').trim();
      const nombreLimpio = datos.nombre.trim();

      if (!correoLimpio.includes('@') || !correoLimpio.includes('.')) {
        return {
          ok: false,
          error: 'Introduce un correo electrónico válido (ej. tu@correo.es).',
        };
      }
      if (passwordLimpia.length < 6) {
        return {
          ok: false,
          error: 'La contraseña debe tener al menos 6 caracteres.',
        };
      }
      if (nombreLimpio.length < 2) {
        return {
          ok: false,
          error: 'Elige tu nombre o alias de crítico (mínimo 2 caracteres).',
        };
      }

      const mapa = leerMapaCuentas();
      if (mapa[correoLimpio]) {
        return {
          ok: false,
          error:
            'Ya existe un perfil con ese correo. Cambia a la pestaña "Iniciar Sesión".',
        };
      }

      // Si Supabase está configurado en .env.local, registramos también en Supabase Auth
      const supabase = crearClienteNavegador();
      if (supabase) {
        void supabase.auth.signUp({
          email: correoLimpio,
          password: passwordLimpia,
          options: {
            data: {
              full_name: nombreLimpio,
              barrio_base: datos.barrioBase,
              salsa_favorita: datos.salsaFavorita,
            },
          },
        });
      }

      const perfil = registrarOIniciarPerfil({
        ...datos,
        email: correoLimpio,
        password: passwordLimpia,
        nombre: nombreLimpio,
        metodoAuth: 'email',
      });

      return { ok: true, perfil };
    },
    [registrarOIniciarPerfil],
  );

  const iniciarSesion = useCallback(
    (email: string, password: string): ResultadoAuth => {
      const correoLimpio = email.trim().toLowerCase();
      const passwordLimpia = password.trim();

      if (!correoLimpio.includes('@') || !correoLimpio.includes('.')) {
        return {
          ok: false,
          error: 'Introduce un correo electrónico válido.',
        };
      }
      if (!passwordLimpia) {
        return {
          ok: false,
          error: 'Introduce tu contraseña.',
        };
      }

      const mapa = leerMapaCuentas();
      const cuenta = mapa[correoLimpio];

      if (!cuenta) {
        return {
          ok: false,
          error:
            'No hay ningún perfil registrado con ese correo. Ve a la pestaña "Crear Cuenta".',
        };
      }

      if (
        cuenta.passwordGuardada &&
        cuenta.passwordGuardada !== passwordLimpia
      ) {
        return {
          ok: false,
          error: 'La contraseña no coincide con la de ese perfil.',
        };
      }

      // Si Supabase está configurado, iniciamos sesión también en Supabase
      const supabase = crearClienteNavegador();
      if (supabase) {
        void supabase.auth.signInWithPassword({
          email: correoLimpio,
          password: passwordLimpia,
        });
      }

      guardarPerfilEnStorage(cuenta);
      setUsuarioActual(cuenta);
      setHidratado(true);
      return { ok: true, perfil: cuenta };
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
      registrarCuenta,
      iniciarSesion,
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
      registrarCuenta,
      iniciarSesion,
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
