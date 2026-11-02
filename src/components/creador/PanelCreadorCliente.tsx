// =====================================================================
// PanelCreadorCliente · Consola privada del Creador (/creador)
// ---------------------------------------------------------------------
// Solo accesible con tu PIN de creador (por defecto `3000` en dev o
// `NEXT_PUBLIC_CREATOR_PIN` en `.env.local`, más RLS `is_creator` en
// Supabase). Desde aquí puedes crear y editar en tiempo real:
//   1. Eventos Especiales (Temporadas, Doble XP, Batallas de Barrios)
//   2. Misiones y Retos Nocturnos
//   3. Locales (Asadores), precios, fotos, chapas, las 6 subnotas y
//      moderación de tickets térmicos
//   4. Pegatinas / Insignias de Escaparate
//   5. Textos globales de la web, tu perfil HUD y copias de seguridad JSON
// =====================================================================

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Icono, type NombreIcono } from '@/components/ui/Icono';
import {
  type CategoriaMision,
  type DificultadMision,
  type EventoEspecial,
  type MisionCreador,
  type PegatinaCreador,
  useCreador,
} from '@/lib/creador/contexto';
import { FOTOS_STITCH } from '@/lib/datos/demo';
import type { LocalResumen } from '@/lib/datos/tipos';
import { calcularKebabScore, formatearNota, formatearPrecio } from '@/lib/puntuacion';

type PestanaCreador = 'eventos' | 'misiones' | 'locales' | 'pegatinas' | 'ajustes';

const FOTOS_RAPIDAS = [
  { nombre: 'Trompo en Brasas (Hero)', url: FOTOS_STITCH.trompoHero },
  { nombre: 'Plato #01 Oro', url: FOTOS_STITCH.plato01 },
  { nombre: 'Plato #02 Plata', url: FOTOS_STITCH.plato02 },
  { nombre: 'Plato #03 Bronce', url: FOTOS_STITCH.plato03 },
  { nombre: 'Dürüm en Mano 3 AM', url: FOTOS_STITCH.durumMano },
  { nombre: 'Corte Transversal Aluminio', url: FOTOS_STITCH.corteAluminio },
];

const ICONOS_PEGATINA: { id: NombreIcono; etiqueta: string }[] = [
  { id: 'local_fire_department', etiqueta: 'Llama Brasa' },
  { id: 'receipt_long', etiqueta: 'Ticket Térmico' },
  { id: 'dark_mode', etiqueta: 'Luna 3 AM' },
  { id: 'explore', etiqueta: 'Mapa Barrios' },
  { id: 'military_tech', etiqueta: 'Medalla' },
  { id: 'emoji_events', etiqueta: 'Trofeo' },
  { id: 'verified', etiqueta: 'Verificado' },
  { id: 'bolt', etiqueta: 'Rayo Nocturno' },
];

export function PanelCreadorCliente() {
  const {
    hidratado,
    modoCreadorActivo,
    barrios,
    eventos,
    misiones,
    pegatinas,
    locales,
    ajustes,
    desbloquearCreador,
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
  } = useCreador();

  const [pinInput, setPinInput] = useState('');
  const [errorPin, setErrorPin] = useState(false);
  const [pestana, setPestana] = useState<PestanaCreador>('eventos');
  const [avisoGuardado, setAvisoGuardado] = useState<string | null>(null);

  // ---- Estado del formulario de Nuevo/Editar Evento Especial ----
  const [eventoForm, setEventoForm] = useState<EventoEspecial>({
    id: '',
    titulo: '',
    subtitulo: '',
    etiqueta: 'EVENTO ESPECIAL 3 AM',
    multiplicadorXp: 2,
    colorAcento: '#FF3B30',
    textoBoton: 'Participar ahora',
    enlaceBoton: '/misiones',
    terminaTexto: 'Termina este domingo 05:00 AM',
    activo: true,
  });

  // ---- Estado del formulario de Nueva/Editar Misión ----
  const [misionForm, setMisionForm] = useState<MisionCreador>({
    id: '',
    titulo: '',
    descripcion: '',
    categoria: 'horario',
    dificultad: 'media',
    xp: 200,
    recompensa: "Pegatina 'Guardia Nocturna'",
    progresoActual: 0,
    progresoMeta: 3,
    enlaceAccion: '/kebab/el-trompo-de-oro/resenar',
    textoAccion: 'Subir Ticket',
    activa: true,
  });

  // ---- Estado del editor de Local (Asador) ----
  const [localSeleccionadoId, setLocalSeleccionadoId] = useState<string>(
    locales[0]?.id ?? '',
  );
  const [localForm, setLocalForm] = useState<LocalResumen | null>(locales[0] ?? null);

  // ---- Estado del formulario de Nueva Pegatina ----
  const [pegatinaForm, setPegatinaForm] = useState<PegatinaCreador>({
    id: '',
    titulo: '',
    subtitulo: '',
    icono: 'local_fire_department',
    colorHex: '#FF7A1F',
    desbloqueada: true,
  });

  const [jsonBackup, setJsonBackup] = useState('');

  function mostrarToast(mensaje: string) {
    setAvisoGuardado(mensaje);
    window.setTimeout(() => setAvisoGuardado(null), 2600);
  }

  function seleccionarLocalParaEditar(local: LocalResumen) {
    setLocalSeleccionadoId(local.id);
    setLocalForm({
      ...local,
      subnotas: { ...local.subnotas },
      tickets: [...local.tickets],
    });
  }

  function prepararNuevoLocal() {
    const nuevoSlug = `asador-nuevo-${Date.now().toString().slice(-4)}`;
    const nuevo: LocalResumen = {
      id: `custom-${nuevoSlug}`,
      slug: nuevoSlug,
      nombre: 'Nuevo Asador Nocturno',
      barrio: { slug: 'centro', nombre: 'Centro Histórico' },
      direccion: 'C/ Carretería, Málaga',
      lat: 36.7235,
      lng: -4.4215,
      precioDurumCentimos: 600,
      halal: true,
      vegetariano: true,
      domicilio: false,
      panCasero: true,
      insignia: 'Nuevo en la Carta',
      pesoGramos: 620,
      fotoPortada: FOTOS_STITCH.plato01,
      horario: [
        { dia: 1, abre: '13:00', cierra: '03:30' },
        { dia: 5, abre: '13:00', cierra: '05:00' },
      ],
      nota: 8.8,
      numResenas: 12,
      notaRanking: 8.4,
      subnotas: {
        meat: 9.0,
        sauces: 8.8,
        bread: 8.7,
        value: 8.6,
        freshness: 8.4,
        night: 9.1,
      },
      tickets: [],
    };
    setLocalSeleccionadoId(nuevo.id);
    setLocalForm(nuevo);
  }

  if (!hidratado) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center font-ticket text-xs text-[#C9B9A6]">
        Cargando consola del creador…
      </div>
    );
  }

  // ===================================================================
  // PANTALLA DE BLOQUEO: SOLO EL CREADOR PUEDE ENTRAR
  // ===================================================================
  if (!modoCreadorActivo) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="relative overflow-hidden rounded-2xl border-2 border-[#FF7A1F]/50 bg-[#1B1613] p-6 shadow-[0_0_40px_rgba(255,122,31,0.2)]">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded border border-[#FF3B30]/40 bg-[#FF3B30]/15 px-2.5 py-1 font-ticket text-[10px] font-bold uppercase tracking-widest text-[#FF3B30]">
            <Icono nombre="lock" className="h-3.5 w-3.5" />
            ZONA RESTRINGIDA · SOLO CREADOR
          </div>

          <h1 className="rotulo-neon font-rotulo text-3xl uppercase tracking-wide text-[#F5EFE6]">
            CABINA DEL MAESTRO ASADOR
          </h1>
          <p className="mt-1.5 text-xs leading-relaxed text-[#C9B9A6]">
            Este panel está oculto para el resto de usuarios. Introduce tu llave maestra de
            creador para editar locales, crear misiones nocturnas y lanzar eventos
            especiales en tiempo real.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const ok = desbloquearCreador(pinInput);
              if (!ok) {
                setErrorPin(true);
              } else {
                setErrorPin(false);
                mostrarToast('Modo Creador desbloqueado');
              }
            }}
            className="mt-5 space-y-3"
          >
            <div>
              <label
                htmlFor="pin-creador"
                className="block font-ticket text-xs uppercase text-[#F5EFE6]"
              >
                PIN / Llave de Creador
              </label>
              <input
                id="pin-creador"
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setErrorPin(false);
                }}
                placeholder="Introduce tu PIN (ej. 3000)"
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#120F0D] px-4 py-3 font-ticket text-base tracking-widest text-[#F5EFE6] focus:border-[#FF7A1F] focus:outline-none"
              />
              {errorPin && (
                <p className="mt-1.5 font-ticket text-xs text-[#FF3B30]">
                  PIN incorrecto. Prueba con 3000 (o el valor de NEXT_PUBLIC_CREATOR_PIN).
                </p>
              )}
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF3B30] to-[#FF7A1F] py-3.5 font-rotulo text-xl uppercase tracking-wider text-[#F5EFE6] shadow-[0_0_24px_rgba(255,59,48,0.4)]"
            >
              <Icono nombre="shield" className="h-5 w-5" />
              DESBLOQUEAR PANEL DE CREADOR
            </button>
          </form>

          {/* Nota didáctica para 1.º de DAW */}
          <div className="mt-5 rounded-xl border border-white/10 bg-[#120F0D] p-3.5 font-ticket text-[11px] leading-relaxed text-[#C9B9A6]">
            <p className="font-bold text-[#F2C14E]">
              💡 Apunte DAW (Doble capa de seguridad):
            </p>
            <p className="mt-1">
              1. En local puedes entrar con el PIN <strong>3000</strong> o haciendo{' '}
              <strong>3 clics seguidos en la chapa MLG</strong> del logo superior.
            </p>
            <p className="mt-1">
              2. En producción con Supabase, la migración{' '}
              <code>0005_panel_creador.sql</code> aplica políticas RLS con{' '}
              <code>public.es_creador()</code> para que PostgreSQL rechace cualquier cambio
              que no venga de tu cuenta.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===================================================================
  // CONSOLA DESBLOQUEADA DEL CREADOR
  // ===================================================================
  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-5">
      {/* Toast flotante de confirmación */}
      {avisoGuardado && (
        <div
          role="status"
          className="fixed right-4 top-24 z-50 flex items-center gap-2 rounded-xl border border-[#35C759] bg-[#120F0D]/95 px-4 py-2.5 font-ticket text-xs font-bold text-[#35C759] shadow-[0_0_25px_rgba(53,199,89,0.4)]"
        >
          <Icono nombre="check_circle" className="h-4 w-4" />
          {avisoGuardado}
        </div>
      )}

      {/* Cabecera del Panel de Creador */}
      <section className="rounded-2xl border border-[#FF7A1F]/50 bg-gradient-to-br from-[#241D18] via-[#1B1613] to-[#120F0D] p-4 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded border border-[#35C759]/40 bg-[#35C759]/15 px-2 py-0.5 font-ticket text-[10px] font-bold uppercase tracking-wider text-[#35C759]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#35C759]" />
              MODO CREADOR ACTIVO · SOLO VISIBLE PARA TI
            </div>
            <h1 className="mt-1 font-rotulo text-3xl uppercase leading-none tracking-wide text-[#F5EFE6]">
              CONSOLA DEL MAESTRO ASADOR
            </h1>
            <p className="mt-1 text-xs text-[#C9B9A6]">
              Todos los cambios que hagas aquí se aplican al instante en Inicio, Carta
              Luminosa, Fichas y Misiones.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                cerrarSesionCreador();
              }}
              className="rounded-lg border border-white/15 bg-[#120F0D] px-3 py-1.5 font-ticket text-[11px] font-bold text-[#C9B9A6] hover:border-[#FF3B30] hover:text-[#FF3B30]"
            >
              Ocultar Modo Creador
            </button>
            <button
              type="button"
              onClick={() => {
                restaurarValoresDeFabrica();
                mostrarToast('Valores originales de Stitch restaurados');
              }}
              className="rounded-lg border border-[#F2C14E]/40 bg-[#F2C14E]/10 px-3 py-1.5 font-ticket text-[11px] font-bold text-[#F2C14E] hover:bg-[#F2C14E]/20"
            >
              Restaurar Stitch
            </button>
          </div>
        </div>

        {/* Resumen rápido */}
        <div className="mt-4 grid grid-cols-4 gap-2 border-t border-white/10 pt-3 text-center font-ticket">
          <div className="rounded-lg bg-[#120F0D]/70 p-2">
            <span className="block text-base font-bold text-[#FF3B30]">
              {eventos.filter((e) => e.activo).length}/{eventos.length}
            </span>
            <span className="text-[10px] text-[#C9B9A6]">Eventos</span>
          </div>
          <div className="rounded-lg bg-[#120F0D]/70 p-2">
            <span className="block text-base font-bold text-[#FF7A1F]">
              {misiones.filter((m) => m.activa).length}/{misiones.length}
            </span>
            <span className="text-[10px] text-[#C9B9A6]">Misiones</span>
          </div>
          <div className="rounded-lg bg-[#120F0D]/70 p-2">
            <span className="block text-base font-bold text-[#35C759]">
              {locales.length}
            </span>
            <span className="text-[10px] text-[#C9B9A6]">Locales</span>
          </div>
          <div className="rounded-lg bg-[#120F0D]/70 p-2">
            <span className="block text-base font-bold text-[#F2C14E]">
              {pegatinas.length}
            </span>
            <span className="text-[10px] text-[#C9B9A6]">Pegatinas</span>
          </div>
        </div>
      </section>

      {/* Selector de las 5 Pestañas del Creador */}
      <nav
        aria-label="Secciones del panel de creador"
        className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1"
      >
        {[
          { id: 'eventos' as const, texto: '1. Eventos Especiales', icono: 'bolt' as const },
          { id: 'misiones' as const, texto: '2. Misiones 3 AM', icono: 'military_tech' as const },
          { id: 'locales' as const, texto: '3. Locales & Notas', icono: 'kebab_dining' as const },
          { id: 'pegatinas' as const, texto: '4. Pegatinas', icono: 'workspace_premium' as const },
          { id: 'ajustes' as const, texto: '5. Textos & Backup', icono: 'tune' as const },
        ].map((tab) => {
          const activa = pestana === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPestana(tab.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2.5 font-ticket text-xs font-bold transition-all ${
                activa
                  ? 'bg-[#FF7A1F] text-[#120F0D] shadow-[0_0_15px_rgba(255,122,31,0.4)]'
                  : 'border border-white/10 bg-[#1B1613] text-[#C9B9A6] hover:text-[#F5EFE6]'
              }`}
            >
              <Icono nombre={tab.icono} className="h-4 w-4" />
              {tab.texto}
            </button>
          );
        })}
      </nav>

      {/* =================================================================
          PESTAÑA 1: CREADOR Y GESTOR DE EVENTOS ESPECIALES
         ================================================================= */}
      {pestana === 'eventos' && (
        <section className="mt-5 space-y-5">
          {/* Formulario para crear o editar un evento especial */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!eventoForm.titulo.trim()) return;
              const nuevoEvento: EventoEspecial = {
                ...eventoForm,
                id: eventoForm.id || `evt-${Date.now()}`,
              };
              guardarEvento(nuevoEvento);
              setEventoForm({
                id: '',
                titulo: '',
                subtitulo: '',
                etiqueta: 'EVENTO ESPECIAL 3 AM',
                multiplicadorXp: 2,
                colorAcento: '#FF3B30',
                textoBoton: 'Participar ahora',
                enlaceBoton: '/misiones',
                terminaTexto: 'Termina este domingo 05:00 AM',
                activo: true,
              });
              mostrarToast('Evento especial guardado y publicado');
            }}
            className="rounded-xl border border-white/15 bg-[#1B1613] p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-rotulo text-xl uppercase tracking-wide text-[#F5EFE6]">
                {eventoForm.id
                  ? 'Editar Evento Especial'
                  : 'Crear Nuevo Evento Especial'}
              </h2>
              {eventoForm.id && (
                <button
                  type="button"
                  onClick={() =>
                    setEventoForm({
                      id: '',
                      titulo: '',
                      subtitulo: '',
                      etiqueta: 'EVENTO ESPECIAL 3 AM',
                      multiplicadorXp: 2,
                      colorAcento: '#FF3B30',
                      textoBoton: 'Participar ahora',
                      enlaceBoton: '/misiones',
                      terminaTexto: 'Termina este domingo 05:00 AM',
                      activo: true,
                    })
                  }
                  className="font-ticket text-xs text-[#C9B9A6] hover:text-[#F5EFE6]"
                >
                  Cancelar edición
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Título del Evento
                </label>
                <input
                  type="text"
                  required
                  value={eventoForm.titulo}
                  onChange={(e) =>
                    setEventoForm((prev) => ({ ...prev, titulo: e.target.value }))
                  }
                  placeholder="Ej. Noche de la Guindilla Roja · x3 XP en Centro"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 text-sm text-[#F5EFE6]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Descripción / Reglas del Evento
                </label>
                <textarea
                  rows={2}
                  required
                  value={eventoForm.subtitulo}
                  onChange={(e) =>
                    setEventoForm((prev) => ({ ...prev, subtitulo: e.target.value }))
                  }
                  placeholder="Explica qué ganan los usuarios durante el evento..."
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 text-sm text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Etiqueta Superior
                </label>
                <input
                  type="text"
                  value={eventoForm.etiqueta}
                  onChange={(e) =>
                    setEventoForm((prev) => ({ ...prev, etiqueta: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Multiplicador XP (ej. 2 = Doble XP)
                </label>
                <input
                  type="number"
                  step={0.5}
                  min={1}
                  max={10}
                  value={eventoForm.multiplicadorXp}
                  onChange={(e) =>
                    setEventoForm((prev) => ({
                      ...prev,
                      multiplicadorXp: Number.parseFloat(e.target.value) || 1,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Texto de Cuenta Atrás / Estado
                </label>
                <input
                  type="text"
                  value={eventoForm.terminaTexto}
                  onChange={(e) =>
                    setEventoForm((prev) => ({ ...prev, terminaTexto: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Color de Neón
                </label>
                <div className="mt-1.5 flex gap-2">
                  {(
                    [
                      { hex: '#FF3B30', nombre: 'Guindilla' },
                      { hex: '#FF7A1F', nombre: 'Brasa' },
                      { hex: '#35C759', nombre: 'Lechuga' },
                      { hex: '#F2C14E', nombre: 'Mostaza' },
                    ] as const
                  ).map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() =>
                        setEventoForm((prev) => ({ ...prev, colorAcento: c.hex }))
                      }
                      style={{ backgroundColor: c.hex }}
                      className={`h-8 flex-1 rounded-lg font-ticket text-[10px] font-bold text-[#120F0D] ${
                        eventoForm.colorAcento === c.hex
                          ? 'ring-2 ring-white'
                          : 'opacity-70'
                      }`}
                    >
                      {c.nombre}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Texto del Botón CTA
                </label>
                <input
                  type="text"
                  value={eventoForm.textoBoton}
                  onChange={(e) =>
                    setEventoForm((prev) => ({ ...prev, textoBoton: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Ruta de Destino
                </label>
                <input
                  type="text"
                  value={eventoForm.enlaceBoton}
                  onChange={(e) =>
                    setEventoForm((prev) => ({ ...prev, enlaceBoton: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#FF3B30] py-3 font-rotulo text-lg uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,59,48,0.35)]"
            >
              {eventoForm.id
                ? 'GUARDAR CAMBIOS DEL EVENTO'
                : '+ LANZAR EVENTO ESPECIAL'}
            </button>
          </form>

          {/* Lista de eventos creados */}
          <div className="space-y-3">
            <h3 className="font-rotulo text-lg uppercase tracking-wide text-[#F5EFE6]">
              Eventos configurados ({eventos.length})
            </h3>
            {eventos.map((evt) => (
              <div
                key={evt.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-[#1B1613] p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      style={{ color: evt.colorAcento }}
                      className="font-ticket text-[10px] font-bold uppercase"
                    >
                      {evt.etiqueta} · x{evt.multiplicadorXp} XP
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 font-ticket text-[9px] font-bold ${
                        evt.activo
                          ? 'bg-[#35C759]/20 text-[#35C759]'
                          : 'bg-white/10 text-[#C9B9A6]'
                      }`}
                    >
                      {evt.activo ? 'EN VIVO EN PORTADA' : 'PAUSADO'}
                    </span>
                  </div>
                  <h4 className="mt-0.5 font-rotulo text-lg uppercase text-[#F5EFE6]">
                    {evt.titulo}
                  </h4>
                  <p className="text-xs text-[#C9B9A6]">{evt.subtitulo}</p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      alternarEventoActivo(evt.id);
                      mostrarToast(
                        evt.activo ? 'Evento pausado' : 'Evento activado en portada',
                      );
                    }}
                    className={`rounded-lg px-3 py-1.5 font-ticket text-xs font-bold ${
                      evt.activo
                        ? 'border border-[#35C759] bg-[#35C759] text-[#120F0D]'
                        : 'border border-white/15 bg-[#120F0D] text-[#C9B9A6]'
                    }`}
                  >
                    {evt.activo ? 'Activo ✓' : 'Activar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventoForm(evt)}
                    className="rounded-lg border border-white/15 bg-[#241D18] px-3 py-1.5 font-ticket text-xs text-[#F5EFE6]"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      eliminarEvento(evt.id);
                      mostrarToast('Evento eliminado');
                    }}
                    className="rounded-lg border border-[#FF3B30]/40 bg-[#FF3B30]/10 px-2.5 py-1.5 font-ticket text-xs text-[#FF3B30]"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =================================================================
          PESTAÑA 2: FÁBRICA DE MISIONES Y RETOS NOCTURNOS
         ================================================================= */}
      {pestana === 'misiones' && (
        <section className="mt-5 space-y-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!misionForm.titulo.trim()) return;
              const nueva: MisionCreador = {
                ...misionForm,
                id: misionForm.id || `mis-${Date.now()}`,
              };
              guardarMision(nueva);
              setMisionForm({
                id: '',
                titulo: '',
                descripcion: '',
                categoria: 'horario',
                dificultad: 'media',
                xp: 200,
                recompensa: "Pegatina 'Guardia Nocturna'",
                progresoActual: 0,
                progresoMeta: 3,
                enlaceAccion: '/kebab/el-trompo-de-oro/resenar',
                textoAccion: 'Subir Ticket',
                activa: true,
              });
              mostrarToast('Misión guardada en /misiones');
            }}
            className="rounded-xl border border-white/15 bg-[#1B1613] p-4 space-y-3"
          >
            <h2 className="font-rotulo text-xl uppercase tracking-wide text-[#F5EFE6]">
              {misionForm.id ? 'Editar Misión Nocturna' : 'Crear Nueva Misión Nocturna'}
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Nombre de la Misión
                </label>
                <input
                  type="text"
                  required
                  value={misionForm.titulo}
                  onChange={(e) =>
                    setMisionForm((prev) => ({ ...prev, titulo: e.target.value }))
                  }
                  placeholder="Ej. El Guardián de Cruz de Humilladero"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 text-sm text-[#F5EFE6]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Objetivo / Descripción
                </label>
                <textarea
                  rows={2}
                  required
                  value={misionForm.descripcion}
                  onChange={(e) =>
                    setMisionForm((prev) => ({ ...prev, descripcion: e.target.value }))
                  }
                  placeholder="Describe qué debe hacer el crítico para completarla..."
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 text-sm text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Categoría
                </label>
                <select
                  value={misionForm.categoria}
                  onChange={(e) =>
                    setMisionForm((prev) => ({
                      ...prev,
                      categoria: e.target.value as CategoriaMision,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                >
                  <option value="horario">03:00 - 05:00 AM (Horario)</option>
                  <option value="barrio">Barrios de Málaga</option>
                  <option value="picante">Picante Fuego</option>
                  <option value="calibre">&gt;600g Lavash (Calibre)</option>
                </select>
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Dificultad
                </label>
                <select
                  value={misionForm.dificultad}
                  onChange={(e) =>
                    setMisionForm((prev) => ({
                      ...prev,
                      dificultad: e.target.value as DificultadMision,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                >
                  <option value="facil">Fácil</option>
                  <option value="media">Media</option>
                  <option value="leyenda">Leyenda</option>
                </select>
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Recompensa XP
                </label>
                <input
                  type="number"
                  step={10}
                  min={10}
                  value={misionForm.xp}
                  onChange={(e) =>
                    setMisionForm((prev) => ({
                      ...prev,
                      xp: Number.parseInt(e.target.value, 10) || 100,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Pegatina / Insignia que desbloquea
                </label>
                <input
                  type="text"
                  value={misionForm.recompensa}
                  onChange={(e) =>
                    setMisionForm((prev) => ({ ...prev, recompensa: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Progreso Actual
                </label>
                <input
                  type="number"
                  min={0}
                  value={misionForm.progresoActual}
                  onChange={(e) =>
                    setMisionForm((prev) => ({
                      ...prev,
                      progresoActual: Number.parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Meta de Tickets / Locales
                </label>
                <input
                  type="number"
                  min={1}
                  value={misionForm.progresoMeta}
                  onChange={(e) =>
                    setMisionForm((prev) => ({
                      ...prev,
                      progresoMeta: Number.parseInt(e.target.value, 10) || 1,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#FF7A1F] py-3 font-rotulo text-lg uppercase tracking-wider text-[#120F0D]"
            >
              {misionForm.id ? 'ACTUALIZAR MISIÓN' : '+ PUBLICAR NUEVA MISIÓN'}
            </button>
          </form>

          <div className="space-y-3">
            <h3 className="font-rotulo text-lg uppercase tracking-wide text-[#F5EFE6]">
              Misiones en el tablón ({misiones.length})
            </h3>
            {misiones.map((m) => (
              <div
                key={m.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-[#1B1613] p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-2 font-ticket text-[10px]">
                    <span className="text-[#FF7A1F] font-bold uppercase">
                      {m.categoria} · {m.dificultad}
                    </span>
                    <span className="text-[#35C759] font-bold">+{m.xp} XP</span>
                    <span className="text-[#C9B9A6]">
                      ({m.progresoActual}/{m.progresoMeta})
                    </span>
                  </div>
                  <h4 className="font-rotulo text-lg uppercase text-[#F5EFE6]">
                    {m.titulo}
                  </h4>
                  <p className="text-xs text-[#C9B9A6]">{m.descripcion}</p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => alternarMisionActiva(m.id)}
                    className={`rounded-lg px-3 py-1.5 font-ticket text-xs font-bold ${
                      m.activa
                        ? 'bg-[#35C759] text-[#120F0D]'
                        : 'border border-white/15 bg-[#120F0D] text-[#C9B9A6]'
                    }`}
                  >
                    {m.activa ? 'Activa ✓' : 'Pausada'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMisionForm(m)}
                    className="rounded-lg border border-white/15 bg-[#241D18] px-3 py-1.5 font-ticket text-xs text-[#F5EFE6]"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      eliminarMision(m.id);
                      mostrarToast('Misión eliminada');
                    }}
                    className="rounded-lg border border-[#FF3B30]/40 bg-[#FF3B30]/10 px-2.5 py-1.5 font-ticket text-xs text-[#FF3B30]"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =================================================================
          PESTAÑA 3: EDITOR DE LOCALES, NOTAS Y TICKETS
         ================================================================= */}
      {pestana === 'locales' && (
        <section className="mt-5 space-y-5">
          {/* Selector rápido de local + botón Nuevo Local */}
          <div className="rounded-xl border border-white/15 bg-[#1B1613] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-rotulo text-xl uppercase tracking-wide text-[#F5EFE6]">
                Seleccionar Asador a Editar ({locales.length})
              </h2>
              <button
                type="button"
                onClick={prepararNuevoLocal}
                className="rounded-lg bg-[#35C759] px-3 py-1.5 font-ticket text-xs font-bold uppercase text-[#120F0D]"
              >
                + Crear Nuevo Local
              </button>
            </div>

            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {locales.map((l) => {
                const activo = l.id === localSeleccionadoId;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => seleccionarLocalParaEditar(l)}
                    className={`shrink-0 rounded-lg border px-3 py-2 text-left font-ticket text-xs transition-colors ${
                      activo
                        ? 'border-[#FF7A1F] bg-[#FF7A1F]/20 font-bold text-[#F5EFE6]'
                        : 'border-white/10 bg-[#120F0D] text-[#C9B9A6] hover:text-[#F5EFE6]'
                    }`}
                  >
                    <span className="block">{l.nombre}</span>
                    <span className="text-[10px] text-[#FF7A1F]">
                      Nota {formatearNota(l.nota)} ·{' '}
                      {formatearPrecio(l.precioDurumCentimos)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {localForm && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                guardarLocal(localForm);
                mostrarToast(`Local "${localForm.nombre}" actualizado en toda la web`);
              }}
              className="rounded-xl border border-white/15 bg-[#1B1613] p-4 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <span className="font-ticket text-[10px] uppercase text-[#FF7A1F]">
                    EDITANDO FICHA Y NOTAS EN VIVO
                  </span>
                  <h3 className="font-rotulo text-2xl uppercase text-[#F5EFE6]">
                    {localForm.nombre}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/kebab/${localForm.slug}`}
                    className="rounded-lg border border-white/15 bg-[#241D18] px-3 py-1.5 font-ticket text-xs text-[#F5EFE6]"
                  >
                    Ver ficha pública →
                  </Link>
                  {locales.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        eliminarLocal(localForm.id);
                        const siguiente = locales.find((l) => l.id !== localForm.id);
                        if (siguiente) seleccionarLocalParaEditar(siguiente);
                        mostrarToast('Local eliminado del catálogo');
                      }}
                      className="rounded-lg border border-[#FF3B30]/40 bg-[#FF3B30]/10 px-3 py-1.5 font-ticket text-xs text-[#FF3B30]"
                    >
                      Borrar local
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                    Nombre del Local
                  </label>
                  <input
                    type="text"
                    required
                    value={localForm.nombre}
                    onChange={(e) =>
                      setLocalForm((prev) =>
                        prev ? { ...prev, nombre: e.target.value } : prev,
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 text-sm text-[#F5EFE6]"
                  />
                </div>

                <div>
                  <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                    Barrio de Málaga
                  </label>
                  <select
                    value={localForm.barrio.slug}
                    onChange={(e) => {
                      const b = barrios.find((x) => x.slug === e.target.value);
                      if (!b) return;
                      setLocalForm((prev) =>
                        prev
                          ? { ...prev, barrio: { slug: b.slug, nombre: b.nombre } }
                          : prev,
                      );
                    }}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                  >
                    {barrios.map((b) => (
                      <option key={b.slug} value={b.slug}>
                        {b.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={localForm.direccion}
                    onChange={(e) =>
                      setLocalForm((prev) =>
                        prev ? { ...prev, direccion: e.target.value } : prev,
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 text-xs text-[#F5EFE6]"
                  />
                </div>

                <div>
                  <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                    Insignia / Especialidad
                  </label>
                  <input
                    type="text"
                    value={localForm.insignia ?? ''}
                    onChange={(e) =>
                      setLocalForm((prev) =>
                        prev ? { ...prev, insignia: e.target.value } : prev,
                      )
                    }
                    placeholder="Ej. Rey del Pan Casero"
                    className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                  />
                </div>

                <div>
                  <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                    Precio Dürüm (en céntimos, 650 = 6,50 €)
                  </label>
                  <input
                    type="number"
                    step={10}
                    value={localForm.precioDurumCentimos ?? 600}
                    onChange={(e) =>
                      setLocalForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              precioDurumCentimos:
                                Number.parseInt(e.target.value, 10) || 0,
                            }
                          : prev,
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                  />
                </div>

                <div>
                  <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                    Peso medio del Dürüm (gramos)
                  </label>
                  <input
                    type="number"
                    step={10}
                    value={localForm.pesoGramos ?? 620}
                    onChange={(e) =>
                      setLocalForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              pesoGramos: Number.parseInt(e.target.value, 10) || 500,
                            }
                          : prev,
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                    URL de Foto de Portada (o elige una foto de Stitch abajo)
                  </label>
                  <input
                    type="text"
                    value={localForm.fotoPortada ?? ''}
                    onChange={(e) =>
                      setLocalForm((prev) =>
                        prev ? { ...prev, fotoPortada: e.target.value } : prev,
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {FOTOS_RAPIDAS.map((f) => (
                      <button
                        key={f.nombre}
                        type="button"
                        onClick={() =>
                          setLocalForm((prev) =>
                            prev ? { ...prev, fotoPortada: f.url } : prev,
                          )
                        }
                        className="rounded border border-white/10 bg-[#241D18] px-2 py-1 font-ticket text-[10px] text-[#C9B9A6] hover:border-[#FF7A1F] hover:text-[#F5EFE6]"
                      >
                        {f.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chapas booleanas */}
              <div className="flex flex-wrap gap-3 border-y border-white/10 py-3 font-ticket text-xs">
                {[
                  { clave: 'halal' as const, texto: 'Halal Certificado' },
                  { clave: 'panCasero' as const, texto: 'Pan Casero Tandoor' },
                  { clave: 'vegetariano' as const, texto: 'Opción Falafel / Veg' },
                  { clave: 'domicilio' as const, texto: 'A Domicilio' },
                ].map((chapa) => (
                  <label
                    key={chapa.clave}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#120F0D] px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(localForm[chapa.clave])}
                      onChange={(e) =>
                        setLocalForm((prev) =>
                          prev ? { ...prev, [chapa.clave]: e.target.checked } : prev,
                        )
                      }
                      className="accent-[#FF7A1F]"
                    />
                    <span>{chapa.texto}</span>
                  </label>
                ))}
              </div>

              {/* Calibrador de las 6 subnotas del local */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-rotulo text-lg uppercase text-[#F5EFE6]">
                    Calibrar las 6 Capas (KebabScore resultante:{' '}
                    <strong className="text-[#FF7A1F]">
                      {formatearNota(calcularKebabScore(localForm.subnotas))}
                    </strong>
                    )
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      { k: 'meat', nombre: 'Carne (30%)' },
                      { k: 'sauces', nombre: 'Salsas (20%)' },
                      { k: 'bread', nombre: 'Pan / Lavash (15%)' },
                      { k: 'value', nombre: 'Tamaño / Precio (15%)' },
                      { k: 'freshness', nombre: 'Verdura (10%)' },
                      { k: 'night', nombre: 'Horario 3 AM (10%)' },
                    ] as const
                  ).map((item) => (
                    <div
                      key={item.k}
                      className="rounded-lg border border-white/10 bg-[#120F0D] p-2.5"
                    >
                      <div className="flex justify-between font-ticket text-xs">
                        <span>{item.nombre}</span>
                        <strong className="text-[#FF7A1F]">
                          {formatearNota(localForm.subnotas[item.k])}
                        </strong>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.1}
                        value={localForm.subnotas[item.k]}
                        onChange={(e) => {
                          const v = Number.parseFloat(e.target.value);
                          setLocalForm((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  subnotas: { ...prev.subnotas, [item.k]: v },
                                }
                              : prev,
                          );
                        }}
                        className="mt-1.5 w-full accent-[#FF7A1F]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#FF7A1F] py-3 font-rotulo text-xl uppercase tracking-wider text-[#120F0D]"
              >
                GUARDAR CAMBIOS EN {localForm.nombre.toUpperCase()}
              </button>

              {/* Moderación de tickets térmicos de este local */}
              {localForm.tickets.length > 0 && (
                <div className="border-t border-white/10 pt-4">
                  <h4 className="font-rotulo text-base uppercase text-[#F5EFE6]">
                    Moderar Tickets Térmicos de este Local ({localForm.tickets.length})
                  </h4>
                  <div className="mt-2 space-y-2">
                    {localForm.tickets.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#120F0D] p-2.5 font-ticket text-xs"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-[#F5EFE6]">
                            {t.codigoTicket} · {t.autorNombre} (Nota{' '}
                            {formatearNota(t.notaTotal)})
                          </span>
                          <p className="truncate text-[11px] text-[#C9B9A6]">
                            {t.comentario}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            eliminarTicketDeLocal(localForm.id, t.id);
                            setLocalForm((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    tickets: prev.tickets.filter((x) => x.id !== t.id),
                                  }
                                : prev,
                            );
                            mostrarToast(`Ticket ${t.codigoTicket} eliminado`);
                          }}
                          className="shrink-0 rounded border border-[#FF3B30]/40 bg-[#FF3B30]/10 px-2.5 py-1 text-[10px] text-[#FF3B30]"
                        >
                          Anular Ticket
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}
        </section>
      )}

      {/* =================================================================
          PESTAÑA 4: CREADOR DE PEGATINAS DE ESCAPARATE
         ================================================================= */}
      {pestana === 'pegatinas' && (
        <section className="mt-5 space-y-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!pegatinaForm.titulo.trim()) return;
              guardarPegatina({
                ...pegatinaForm,
                id: pegatinaForm.id || `peg-${Date.now()}`,
              });
              setPegatinaForm({
                id: '',
                titulo: '',
                subtitulo: '',
                icono: 'local_fire_department',
                colorHex: '#FF7A1F',
                desbloqueada: true,
              });
              mostrarToast('Pegatina añadida a la vitrina');
            }}
            className="rounded-xl border border-white/15 bg-[#1B1613] p-4 space-y-3"
          >
            <h2 className="font-rotulo text-xl uppercase tracking-wide text-[#F5EFE6]">
              Diseñar Nueva Pegatina de Escaparate
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Nombre de la Pegatina
                </label>
                <input
                  type="text"
                  required
                  value={pegatinaForm.titulo}
                  onChange={(e) =>
                    setPegatinaForm((prev) => ({ ...prev, titulo: e.target.value }))
                  }
                  placeholder="Ej. Terror del Lavash"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 text-sm text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Requisito / Subtítulo
                </label>
                <input
                  type="text"
                  required
                  value={pegatinaForm.subtitulo}
                  onChange={(e) =>
                    setPegatinaForm((prev) => ({ ...prev, subtitulo: e.target.value }))
                  }
                  placeholder="Ej. 5 dürüms seguidos sin servilleta"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 text-sm text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Icono de la Pegatina
                </label>
                <select
                  value={pegatinaForm.icono}
                  onChange={(e) =>
                    setPegatinaForm((prev) => ({
                      ...prev,
                      icono: e.target.value as NombreIcono,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                >
                  {ICONOS_PEGATINA.map((ic) => (
                    <option key={ic.id} value={ic.id}>
                      {ic.etiqueta}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Color de Borde Neón
                </label>
                <div className="mt-1.5 flex gap-2">
                  {(['#35C759', '#FF7A1F', '#FF3B30', '#F2C14E'] as const).map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() =>
                        setPegatinaForm((prev) => ({ ...prev, colorHex: hex }))
                      }
                      style={{ backgroundColor: hex }}
                      className={`h-8 flex-1 rounded-lg ${
                        pegatinaForm.colorHex === hex ? 'ring-2 ring-white' : 'opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#F2C14E] py-3 font-rotulo text-lg uppercase tracking-wider text-[#120F0D]"
            >
              + CREAR PEGATINA DE ESCAPARATE
            </button>
          </form>

          <div className="grid gap-3 sm:grid-cols-2">
            {pegatinas.map((peg) => (
              <div
                key={peg.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#1B1613] p-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    style={{
                      borderColor: peg.colorHex,
                      color: peg.colorHex,
                    }}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-[#120F0D]"
                  >
                    <Icono nombre={peg.icono} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-rotulo text-sm uppercase text-[#F5EFE6]">
                      {peg.titulo}
                    </p>
                    <p className="truncate font-ticket text-[10px] text-[#C9B9A6]">
                      {peg.subtitulo}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => alternarPegatinaDesbloqueada(peg.id)}
                    className={`rounded px-2 py-1 font-ticket text-[10px] font-bold ${
                      peg.desbloqueada
                        ? 'bg-[#35C759] text-[#120F0D]'
                        : 'border border-white/15 text-[#C9B9A6]'
                    }`}
                  >
                    {peg.desbloqueada ? 'Tuya ✓' : 'Bloq.'}
                  </button>
                  <button
                    type="button"
                    onClick={() => eliminarPegatina(peg.id)}
                    className="rounded border border-[#FF3B30]/40 px-2 py-1 font-ticket text-[10px] text-[#FF3B30]"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =================================================================
          PESTAÑA 5: TEXTOS GLOBALES, PERFIL HUD Y BACKUP JSON
         ================================================================= */}
      {pestana === 'ajustes' && (
        <section className="mt-5 space-y-5">
          <div className="rounded-xl border border-white/15 bg-[#1B1613] p-4 space-y-3">
            <h2 className="font-rotulo text-xl uppercase tracking-wide text-[#F5EFE6]">
              Textos Globales de Portada y Perfil Crítico
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Pastilla Superior del Hero
                </label>
                <input
                  type="text"
                  value={ajustes.heroPastilla}
                  onChange={(e) => actualizarAjustes({ heroPastilla: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Titular Línea 1 (Blanco)
                </label>
                <input
                  type="text"
                  value={ajustes.heroLinea1}
                  onChange={(e) => actualizarAjustes({ heroLinea1: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 text-sm text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Titular Línea 2 (Naranja Brasa)
                </label>
                <input
                  type="text"
                  value={ajustes.heroLineaAcento}
                  onChange={(e) => actualizarAjustes({ heroLineaAcento: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 text-sm text-[#FF7A1F]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Subtítulo de Portada
                </label>
                <textarea
                  rows={2}
                  value={ajustes.heroSubtitulo}
                  onChange={(e) => actualizarAjustes({ heroSubtitulo: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 text-xs text-[#F5EFE6]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Cita de la Regla de Oro (Ticket #TKT-29001)
                </label>
                <input
                  type="text"
                  value={ajustes.reglaDeOroCita}
                  onChange={(e) => actualizarAjustes({ reglaDeOroCita: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Tu Nombre en el HUD
                </label>
                <input
                  type="text"
                  value={ajustes.nombreCritico}
                  onChange={(e) => actualizarAjustes({ nombreCritico: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Tu Rango Nocturno
                </label>
                <input
                  type="text"
                  value={ajustes.rangoCritico}
                  onChange={(e) => actualizarAjustes({ rangoCritico: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Tu Nivel (LVL)
                </label>
                <input
                  type="number"
                  min={1}
                  value={ajustes.nivelCritico}
                  onChange={(e) =>
                    actualizarAjustes({
                      nivelCritico: Number.parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block font-ticket text-[11px] uppercase text-[#C9B9A6]">
                  Tu XP Base
                </label>
                <input
                  type="number"
                  step={50}
                  value={ajustes.xpBaseCritico}
                  onChange={(e) =>
                    actualizarAjustes({
                      xpBaseCritico: Number.parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#120F0D] px-3 py-2 font-ticket text-xs text-[#F5EFE6]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => mostrarToast('Ajustes globales actualizados en vivo')}
              className="w-full rounded-xl bg-[#35C759] py-2.5 font-rotulo text-base uppercase tracking-wider text-[#120F0D]"
            >
              ✓ CAMBIOS APLICADOS AUTOMÁTICAMENTE
            </button>
          </div>

          {/* Exportar / Importar JSON */}
          <div className="rounded-xl border border-white/15 bg-[#1B1613] p-4 space-y-3">
            <h3 className="font-rotulo text-lg uppercase text-[#F5EFE6]">
              Copia de Seguridad (Exportar / Importar JSON)
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const data = JSON.stringify(
                    { eventos, misiones, pegatinas, locales, ajustes },
                    null,
                    2,
                  );
                  setJsonBackup(data);
                  mostrarToast('Configuración volcada en el cuadro inferior');
                }}
                className="rounded-lg bg-[#FF7A1F] px-3.5 py-2 font-ticket text-xs font-bold text-[#120F0D]"
              >
                Generar JSON actual
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!jsonBackup.trim()) return;
                  const ok = importarConfiguracionJson(jsonBackup);
                  mostrarToast(
                    ok ? 'Configuración JSON importada' : 'Error: JSON no válido',
                  );
                }}
                className="rounded-lg border border-white/15 bg-[#241D18] px-3.5 py-2 font-ticket text-xs text-[#F5EFE6]"
              >
                Importar desde el cuadro
              </button>
            </div>
            <textarea
              rows={5}
              value={jsonBackup}
              onChange={(e) => setJsonBackup(e.target.value)}
              placeholder="Pulsa 'Generar JSON actual' para copiar tu configuración o pega aquí un backup..."
              className="w-full rounded-lg border border-white/15 bg-[#120F0D] p-3 font-ticket text-[11px] text-[#C9B9A6]"
            />
          </div>
        </section>
      )}
    </div>
  );
}
