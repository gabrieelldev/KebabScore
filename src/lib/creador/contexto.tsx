// =====================================================================
// Contexto del Panel de Creador · Estado reactivo y persistente
// ---------------------------------------------------------------------
// Explicación para 1.º de DAW:
// ¿Cómo conseguimos que lo que edites en `/creador` cambie al instante
// el Inicio, el Ranking, las Misiones y los Eventos Especiales sin
// perderse al recargar la página?
//
// 1. Usamos `React.createContext` (`ProveedorCreador`) para compartir el
//    estado con todas las pantallas de la aplicación.
// 2. Sincronizamos ese estado con `localStorage` bajo la clave
//    `kebabscore_creador_v1`. Si aún no has tocado nada, carga los
//    valores oficiales del diseño de Stitch.
// 3. El estado `modoCreadorActivo` controla si tienes la sesión de
//    creador abierta en este navegador (protegida con PIN o el atajo de
//    3 clics en la chapa MLG). Los visitantes normales ven `false` y
//    no saben que existe el panel.
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
import type { NombreIcono } from '@/components/ui/Icono';
import { BARRIOS_DEMO, FOTOS_STITCH, LOCALES_DEMO } from '@/lib/datos/demo';
import type { Barrio, LocalResumen } from '@/lib/datos/tipos';
import { calcularKebabScore, notaBayesiana } from '@/lib/puntuacion';
import { TEXTOS } from '@/lib/textos';

export type CategoriaMision = 'horario' | 'barrio' | 'picante' | 'calibre';
export type DificultadMision = 'facil' | 'media' | 'leyenda';

export type EventoEspecial = {
  id: string;
  titulo: string;
  subtitulo: string;
  etiqueta: string;
  multiplicadorXp: number;
  colorAcento: '#FF3B30' | '#FF7A1F' | '#35C759' | '#F2C14E';
  textoBoton: string;
  enlaceBoton: string;
  terminaTexto: string;
  activo: boolean;
};

export type MisionCreador = {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: CategoriaMision;
  dificultad: DificultadMision;
  xp: number;
  recompensa: string;
  progresoActual: number;
  progresoMeta: number;
  enlaceAccion: string;
  textoAccion: string;
  activa: boolean;
};

export type PegatinaCreador = {
  id: string;
  titulo: string;
  subtitulo: string;
  icono: NombreIcono;
  colorHex: '#35C759' | '#FF7A1F' | '#FF3B30' | '#F2C14E';
  desbloqueada: boolean;
};

export type AjustesGlobales = {
  heroPastilla: string;
  heroLinea1: string;
  heroLineaAcento: string;
  heroSubtitulo: string;
  contadorAuditados: string;
  reglaDeOroCita: string;
  xpPorTicket: number;
  nombreCritico: string;
  rangoCritico: string;
  nivelCritico: number;
  xpBaseCritico: number;
};

const CLAVE_STORAGE_DATOS = 'kebabscore_creador_datos_v1';
const CLAVE_STORAGE_SESION = 'kebabscore_creador_sesion_v1';

export const EVENTOS_INICIALES: EventoEspecial[] = [
  {
    id: 'evt-viernes-doble-brasa',
    titulo: 'Viernes de Doble Brasa · x2 XP en Caja',
    subtitulo:
      'Todos los tickets impresos entre las 23:00 y las 05:00 AM suman el doble de experiencia y desbloquean el sello Noctámbulo.',
    etiqueta: 'EVENTO ESPECIAL EN VIVO',
    multiplicadorXp: 2,
    colorAcento: '#FF3B30',
    textoBoton: 'Auditar ahora (x2 XP)',
    enlaceBoton: '/kebab/el-trompo-de-oro/resenar',
    terminaTexto: 'Termina el domingo a las 05:00 AM',
    activo: true,
  },
  {
    id: 'evt-guerra-barrios',
    titulo: 'Batalla de Barrios: Teatinos vs Centro Histórico',
    subtitulo:
      'El barrio con más dürüms auditados esta semana coronará su local #1 en la portada de toda Málaga.',
    etiqueta: 'TORNEO DE BARRIOS',
    multiplicadorXp: 1.5,
    colorAcento: '#FF7A1F',
    textoBoton: 'Ver Carta Luminosa',
    enlaceBoton: '/ranking',
    terminaTexto: 'Marcador en vivo · 142 a 138 tickets',
    activo: false,
  },
];

export const MISIONES_INICIALES: MisionCreador[] = [
  {
    id: 'mis-vampiro-carreteria',
    titulo: 'El Vampiro de Carretería',
    descripcion:
      'Valora 3 dürüms en el Centro Histórico pasadas las 03:00 AM con foto de ticket real.',
    categoria: 'horario',
    dificultad: 'media',
    xp: 150,
    recompensa: "Pegatina 'Búho Asador'",
    progresoActual: 2,
    progresoMeta: 3,
    enlaceAccion: '/kebab/el-trompo-de-oro/resenar',
    textoAccion: 'Subir Ticket #3',
    activa: true,
  },
  {
    id: 'mis-conquistador-teatinos',
    titulo: 'Conquistador de Teatinos',
    descripcion:
      'Puntúa 4 kebabs distintos en la zona universitaria (Av. Plutarco / Louis Pasteur).',
    categoria: 'barrio',
    dificultad: 'facil',
    xp: 100,
    recompensa: "'Cacique de Plutarco'",
    progresoActual: 3,
    progresoMeta: 4,
    enlaceAccion: '/barrio/teatinos',
    textoAccion: 'Ver Mapa Zona',
    activa: true,
  },
  {
    id: 'mis-sultan-7-barrios',
    titulo: 'El Sultán de los 7 Barrios',
    descripcion:
      'Deja al menos 1 ticket auditado en Centro, Teatinos, El Perchel, Huelin, Trinidad, Soho y El Palo.',
    categoria: 'barrio',
    dificultad: 'leyenda',
    xp: 500,
    recompensa: "Chapa 'Sultán de Málaga'",
    progresoActual: 4,
    progresoMeta: 7,
    enlaceAccion: '/ranking',
    textoAccion: 'Explorar Barrios',
    activa: true,
  },
];

export const PEGATINAS_INICIALES: PegatinaCreador[] = [
  {
    id: 'peg-primera-resena',
    titulo: '1.ª Reseña en Caja',
    subtitulo: 'Primer ticket térmico impreso',
    icono: 'receipt_long',
    colorHex: '#35C759',
    desbloqueada: true,
  },
  {
    id: 'peg-buho-asador',
    titulo: 'Búho del Asador',
    subtitulo: '10 tickets pasadas las 02:30 AM',
    icono: 'dark_mode',
    colorHex: '#FF7A1F',
    desbloqueada: true,
  },
  {
    id: 'peg-paladar-brasa',
    titulo: 'Paladar de Brasa',
    subtitulo: '3 locales Nivel Fuego catados',
    icono: 'local_fire_department',
    colorHex: '#FF3B30',
    desbloqueada: true,
  },
  {
    id: 'peg-cinco-barrios',
    titulo: '5 Barrios de Málaga',
    subtitulo: '4 / 5 barrios completados',
    icono: 'explore',
    colorHex: '#F2C14E',
    desbloqueada: false,
  },
];

export const AJUSTES_INICIALES: AjustesGlobales = {
  heroPastilla: 'Málaga · Abierto hasta que cierre el último asador',
  heroLinea1: 'Kebabs de Málaga,',
  heroLineaAcento: 'puntuados capa a capa',
  heroSubtitulo: TEXTOS.subLema,
  contadorAuditados: '1.428 dürüms',
  reglaDeOroCita:
    'Un local nunca puede pagar para subir su nota. Solo mandan los tickets a las 3 de la mañana.',
  xpPorTicket: 150,
  nombreCritico: 'MARCOS "PADRINO" P.',
  rangoCritico: 'Maestro Trompero Nocturno',
  nivelCritico: 5,
  xpBaseCritico: 2450,
};

/** Convierte LOCALES_DEMO en LocalResumen[] listos para editar en el panel */
export function construirLocalesIniciales(): LocalResumen[] {
  const barriosPorSlug = new Map(BARRIOS_DEMO.map((b) => [b.slug, b]));
  return LOCALES_DEMO.map((l) => {
    const barrio = barriosPorSlug.get(l.barrioSlug) ?? {
      slug: l.barrioSlug,
      nombre: l.barrioSlug,
    };
    return {
      id: `demo-${l.slug}`,
      slug: l.slug,
      nombre: l.nombre,
      barrio: { slug: barrio.slug, nombre: barrio.nombre },
      direccion: l.direccion,
      lat: l.lat,
      lng: l.lng,
      precioDurumCentimos: l.precioDurumCentimos,
      halal: l.halal,
      vegetariano: l.vegetariano,
      domicilio: l.domicilio,
      panCasero: l.panCasero,
      insignia: l.insignia,
      pesoGramos: l.pesoGramos,
      fotoPortada: l.fotoPortada ?? FOTOS_STITCH.plato01,
      horario: l.horario,
      nota: l.notaDemo,
      numResenas: l.resenasDemo,
      notaRanking: Math.round(notaBayesiana(l.notaDemo, l.resenasDemo) * 100) / 100,
      subnotas: { ...l.subnotas },
      tickets: [...l.tickets],
    };
  });
}

type DatosPersistidos = {
  eventos: EventoEspecial[];
  misiones: MisionCreador[];
  pegatinas: PegatinaCreador[];
  locales: LocalResumen[];
  ajustes: AjustesGlobales;
};

type ContextoCreadorValor = {
  hidratado: boolean;
  modoCreadorActivo: boolean;
  barrios: Barrio[];
  eventos: EventoEspecial[];
  eventosActivos: EventoEspecial[];
  misiones: MisionCreador[];
  misionesActivas: MisionCreador[];
  pegatinas: PegatinaCreador[];
  locales: LocalResumen[];
  ajustes: AjustesGlobales;
  desbloquearCreador: (pin: string) => boolean;
  activarAtajoCreador: () => void;
  cerrarSesionCreador: () => void;
  guardarEvento: (evento: EventoEspecial) => void;
  alternarEventoActivo: (id: string) => void;
  eliminarEvento: (id: string) => void;
  guardarMision: (mision: MisionCreador) => void;
  alternarMisionActiva: (id: string) => void;
  eliminarMision: (id: string) => void;
  guardarPegatina: (pegatina: PegatinaCreador) => void;
  alternarPegatinaDesbloqueada: (id: string) => void;
  eliminarPegatina: (id: string) => void;
  guardarLocal: (local: LocalResumen) => void;
  eliminarLocal: (id: string) => void;
  eliminarTicketDeLocal: (localId: string, ticketId: string) => void;
  actualizarAjustes: (parcial: Partial<AjustesGlobales>) => void;
  importarConfiguracionJson: (jsonTexto: string) => boolean;
  restaurarValoresDeFabrica: () => void;
};

const ContextoCreador = createContext<ContextoCreadorValor | null>(null);

export function ProveedorCreador({ children }: { children: React.ReactNode }) {
  const [hidratado, setHidratado] = useState(false);
  const [modoCreadorActivo, setModoCreadorActivo] = useState(false);
  const [eventos, setEventos] = useState<EventoEspecial[]>(EVENTOS_INICIALES);
  const [misiones, setMisiones] = useState<MisionCreador[]>(MISIONES_INICIALES);
  const [pegatinas, setPegatinas] = useState<PegatinaCreador[]>(PEGATINAS_INICIALES);
  const [locales, setLocales] = useState<LocalResumen[]>(() => construirLocalesIniciales());
  const [ajustes, setAjustes] = useState<AjustesGlobales>(AJUSTES_INICIALES);

  // Al montar en el cliente, leemos si hay sesión de creador y datos guardados
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      try {
        const sesionGuardada = window.localStorage.getItem(CLAVE_STORAGE_SESION);
        if (sesionGuardada === 'true') {
          setModoCreadorActivo(true);
        }

        const raw = window.localStorage.getItem(CLAVE_STORAGE_DATOS);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<DatosPersistidos>;
          if (Array.isArray(parsed.eventos)) setEventos(parsed.eventos);
          if (Array.isArray(parsed.misiones)) setMisiones(parsed.misiones);
          if (Array.isArray(parsed.pegatinas)) setPegatinas(parsed.pegatinas);
          if (Array.isArray(parsed.locales) && parsed.locales.length > 0) {
            setLocales(parsed.locales);
          }
          if (parsed.ajustes) {
            setAjustes((prev) => ({ ...prev, ...parsed.ajustes }));
          }
        }
      } catch {
        // Si el JSON de localStorage estuviera corrupto, mantenemos valores por defecto
      } finally {
        setHidratado(true);
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  // Guardamos en localStorage cada vez que cambie algún dato del creador
  useEffect(() => {
    if (!hidratado) return;
    try {
      const payload: DatosPersistidos = {
        eventos,
        misiones,
        pegatinas,
        locales,
        ajustes,
      };
      window.localStorage.setItem(CLAVE_STORAGE_DATOS, JSON.stringify(payload));
    } catch {
      // Ignoramos errores de cuota de almacenamiento
    }
  }, [hidratado, eventos, misiones, pegatinas, locales, ajustes]);

  const pinMaestro = process.env.NEXT_PUBLIC_CREATOR_PIN || '3000';

  const desbloquearCreador = useCallback(
    (pin: string) => {
      if (pin.trim() === pinMaestro || pin.trim().toLowerCase() === 'kebab') {
        setModoCreadorActivo(true);
        try {
          window.localStorage.setItem(CLAVE_STORAGE_SESION, 'true');
        } catch {}
        return true;
      }
      return false;
    },
    [pinMaestro],
  );

  const activarAtajoCreador = useCallback(() => {
    setModoCreadorActivo(true);
    try {
      window.localStorage.setItem(CLAVE_STORAGE_SESION, 'true');
    } catch {}
  }, []);

  const cerrarSesionCreador = useCallback(() => {
    setModoCreadorActivo(false);
    try {
      window.localStorage.removeItem(CLAVE_STORAGE_SESION);
    } catch {}
  }, []);

  // ---- Acciones sobre Eventos Especiales ----
  const guardarEvento = useCallback((evento: EventoEspecial) => {
    setEventos((prev) => {
      const existe = prev.some((e) => e.id === evento.id);
      if (existe) return prev.map((e) => (e.id === evento.id ? evento : e));
      return [evento, ...prev];
    });
  }, []);

  const alternarEventoActivo = useCallback((id: string) => {
    setEventos((prev) =>
      prev.map((e) => (e.id === id ? { ...e, activo: !e.activo } : e)),
    );
  }, []);

  const eliminarEvento = useCallback((id: string) => {
    setEventos((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // ---- Acciones sobre Misiones Nocturnas ----
  const guardarMision = useCallback((mision: MisionCreador) => {
    setMisiones((prev) => {
      const existe = prev.some((m) => m.id === mision.id);
      if (existe) return prev.map((m) => (m.id === mision.id ? mision : m));
      return [mision, ...prev];
    });
  }, []);

  const alternarMisionActiva = useCallback((id: string) => {
    setMisiones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, activa: !m.activa } : m)),
    );
  }, []);

  const eliminarMision = useCallback((id: string) => {
    setMisiones((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // ---- Acciones sobre Pegatinas de Escaparate ----
  const guardarPegatina = useCallback((pegatina: PegatinaCreador) => {
    setPegatinas((prev) => {
      const existe = prev.some((p) => p.id === pegatina.id);
      if (existe) return prev.map((p) => (p.id === pegatina.id ? pegatina : p));
      return [pegatina, ...prev];
    });
  }, []);

  const alternarPegatinaDesbloqueada = useCallback((id: string) => {
    setPegatinas((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, desbloqueada: !p.desbloqueada } : p,
      ),
    );
  }, []);

  const eliminarPegatina = useCallback((id: string) => {
    setPegatinas((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ---- Acciones sobre Locales (Asadores) ----
  const guardarLocal = useCallback((localEditado: LocalResumen) => {
    const notaCalculada = calcularKebabScore(localEditado.subnotas);
    const notaFinal = localEditado.nota ?? notaCalculada;
    const enriquecido: LocalResumen = {
      ...localEditado,
      nota: notaCalculada,
      notaRanking:
        Math.round(notaBayesiana(notaFinal, localEditado.numResenas) * 100) / 100,
    };

    setLocales((prev) => {
      const existe = prev.some((l) => l.id === enriquecido.id);
      if (existe) return prev.map((l) => (l.id === enriquecido.id ? enriquecido : l));
      return [enriquecido, ...prev];
    });
  }, []);

  const eliminarLocal = useCallback((id: string) => {
    setLocales((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const eliminarTicketDeLocal = useCallback((localId: string, ticketId: string) => {
    setLocales((prev) =>
      prev.map((l) =>
        l.id === localId
          ? {
              ...l,
              tickets: l.tickets.filter((t) => t.id !== ticketId),
              numResenas: Math.max(0, l.numResenas - 1),
            }
          : l,
      ),
    );
  }, []);

  // ---- Acciones sobre Ajustes Globales ----
  const actualizarAjustes = useCallback((parcial: Partial<AjustesGlobales>) => {
    setAjustes((prev) => ({ ...prev, ...parcial }));
  }, []);

  const importarConfiguracionJson = useCallback((jsonTexto: string) => {
    try {
      const parsed = JSON.parse(jsonTexto) as Partial<DatosPersistidos>;
      if (Array.isArray(parsed.eventos)) setEventos(parsed.eventos);
      if (Array.isArray(parsed.misiones)) setMisiones(parsed.misiones);
      if (Array.isArray(parsed.pegatinas)) setPegatinas(parsed.pegatinas);
      if (Array.isArray(parsed.locales) && parsed.locales.length > 0) {
        setLocales(parsed.locales);
      }
      if (parsed.ajustes) {
        setAjustes((prev) => ({ ...prev, ...parsed.ajustes }));
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const restaurarValoresDeFabrica = useCallback(() => {
    setEventos(EVENTOS_INICIALES);
    setMisiones(MISIONES_INICIALES);
    setPegatinas(PEGATINAS_INICIALES);
    setLocales(construirLocalesIniciales());
    setAjustes(AJUSTES_INICIALES);
    try {
      window.localStorage.removeItem(CLAVE_STORAGE_DATOS);
    } catch {}
  }, []);

  const eventosActivos = useMemo(
    () => eventos.filter((e) => e.activo),
    [eventos],
  );

  const misionesActivas = useMemo(
    () => misiones.filter((m) => m.activa),
    [misiones],
  );

  const valor = useMemo<ContextoCreadorValor>(
    () => ({
      hidratado,
      modoCreadorActivo,
      barrios: BARRIOS_DEMO,
      eventos,
      eventosActivos,
      misiones,
      misionesActivas,
      pegatinas,
      locales,
      ajustes,
      desbloquearCreador,
      activarAtajoCreador,
      cerrarSesionCreador,
      guardarEvento,
      alternarEventoActivo,
      eliminarEvento,
      guardarMision,
      alternarMisionActiva,
      eliminarMision,
      guardarPegatina,
      alternarPegatinaDesbloqueada,
      eliminarPegatina,
      guardarLocal,
      eliminarLocal,
      eliminarTicketDeLocal,
      actualizarAjustes,
      importarConfiguracionJson,
      restaurarValoresDeFabrica,
    }),
    [
      hidratado,
      modoCreadorActivo,
      eventos,
      eventosActivos,
      misiones,
      misionesActivas,
      pegatinas,
      locales,
      ajustes,
      desbloquearCreador,
      activarAtajoCreador,
      cerrarSesionCreador,
      guardarEvento,
      alternarEventoActivo,
      eliminarEvento,
      guardarMision,
      alternarMisionActiva,
      eliminarMision,
      guardarPegatina,
      alternarPegatinaDesbloqueada,
      eliminarPegatina,
      guardarLocal,
      eliminarLocal,
      eliminarTicketDeLocal,
      actualizarAjustes,
      importarConfiguracionJson,
      restaurarValoresDeFabrica,
    ],
  );

  return (
    <ContextoCreador.Provider value={valor}>{children}</ContextoCreador.Provider>
  );
}

export function useCreador(): ContextoCreadorValor {
  const ctx = useContext(ContextoCreador);
  if (!ctx) {
    throw new Error('useCreador debe usarse dentro de <ProveedorCreador>');
  }
  return ctx;
}
