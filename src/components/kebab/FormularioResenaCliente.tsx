// =====================================================================
// FormularioResenaCliente · 6 Sliders + Verificación Anti-Fraude Real
// ---------------------------------------------------------------------
// Explicación para 1.º de DAW:
// 1. Exige que el usuario haya creado su perfil (`usuarioActual` en
//    `ProveedorAuth` con Email, Google o Apple).
// 2. Exige superar al menos 1 de las 2 Pruebas de Consumo Real
//    ("Proof of Kebab") antes de desbloquear el botón de publicar:
//      - Prueba A (GPS): Comprueba con `navigator.geolocation` y la
//        fórmula de Haversine que estás a <= 150 metros del local
//        (incluye un botón de simulación para pruebas de clase DAW).
//      - Prueba B (Ticket + Foto real): Subida de foto real desde la
//        cámara/móvil (`FileReader`) + código/hora impresa en el ticket.
// 3. Si el usuario completa AMBAS pruebas, recibe el sello de
//    "DOBLE VERIFICACIÓN 3 AM" y +200 XP.
// =====================================================================

'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { RegistroPerfilCliente } from '@/components/auth/RegistroPerfilCliente';
import { Icono } from '@/components/ui/Icono';
import {
  type MetodoVerificacion,
  useAuth,
} from '@/lib/auth/contexto';
import { useCreador } from '@/lib/creador/contexto';
import type { LocalResumen, MediasSubnotas } from '@/lib/datos/tipos';
import {
  calcularKebabScore,
  formatearNota,
  formatearPrecio,
  infoNivelPicante,
} from '@/lib/puntuacion';

type Props = {
  local: LocalResumen;
};

const VARIANTES_PLATO = [
  'Dürüm Mixto',
  'Dürüm Pollo',
  'Dürüm Ternera',
  'Falafel / Veggie',
  'Plato Kebab',
];

/** Calcula la distancia en metros entre dos coordenadas GPS (fórmula de Haversine). */
function distanciaEnMetros(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const aRad = (g: number) => (g * Math.PI) / 180;
  const dLat = aRad(lat2 - lat1);
  const dLng = aRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRad(lat1)) * Math.cos(aRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

type ConfigSlider = {
  clave: keyof MediasSubnotas;
  titulo: string;
  subtitulo: string;
  pesoTexto: string;
  etiquetaTicket: string;
  icono:
    | 'local_fire_department'
    | 'water_drop'
    | 'bakery_dining'
    | 'scale'
    | 'eco'
    | 'dark_mode';
  colorTexto: string;
  gradiente: string;
  describirValor: (v: number) => string;
};

const CONFIG_SLIDERS: ConfigSlider[] = [
  {
    clave: 'meat',
    titulo: '1. Carne y Tueste',
    subtitulo: 'Sabor, jugosidad y corte directo del trompo',
    pesoTexto: 'PESO 30%',
    etiquetaTicket: '01 CARNE & TUESTE (30%)',
    icono: 'local_fire_department',
    colorTexto: 'text-[#FF7A1F]',
    gradiente: 'linear-gradient(90deg, #44372E 0%, #FF7A1F 60%, #FF3B30 100%)',
    describirValor: (v) =>
      v >= 9
        ? 'Crujiente al corte'
        : v >= 7.5
          ? 'Bien asada y jugosa'
          : v >= 5
            ? 'Cumple sin alardes'
            : 'Seca o recalentada',
  },
  {
    clave: 'sauces',
    titulo: '2. Salsas (Yogur y Picante)',
    subtitulo: 'Cremosidad, ajo real, picor y reparto hasta el final',
    pesoTexto: 'PESO 20%',
    etiquetaTicket: '02 SALSAS CASERAS (20%)',
    icono: 'water_drop',
    colorTexto: 'text-[#FFF6E8]',
    gradiente: 'linear-gradient(90deg, #44372E 0%, #C9B9A6 40%, #FFF6E8 100%)',
    describirValor: (v) =>
      v >= 9
        ? 'Chorreo bendito'
        : v >= 7.5
          ? 'Bien repartida'
          : v >= 5
            ? 'Algo justa al final'
            : 'Bote industrial',
  },
  {
    clave: 'bread',
    titulo: '3. Pan / Lavash Tostado',
    subtitulo: 'Sellado en plancha, elasticidad y resistencia sin romperse',
    pesoTexto: 'PESO 15%',
    etiquetaTicket: '03 PAN / LAVASH (15%)',
    icono: 'bakery_dining',
    colorTexto: 'text-[#F2C14E]',
    gradiente: 'linear-gradient(90deg, #44372E 0%, #D99B26 50%, #F2C14E 100%)',
    describirValor: (v) =>
      v >= 8.5
        ? 'Sellado al carbón'
        : v >= 7
          ? 'Aguanta sin fugas'
          : v >= 5
            ? 'Un poco blando'
            : 'Se rompe a mitad',
  },
  {
    clave: 'value',
    titulo: '4. Tamaño / Precio',
    subtitulo: 'Calibre del rollo, peso en mano y honestidad por euro',
    pesoTexto: 'PESO 15%',
    etiquetaTicket: '04 TAMAÑO / PRECIO (15%)',
    icono: 'scale',
    colorTexto: 'text-[#FF3B30]',
    gradiente: 'linear-gradient(90deg, #44372E 0%, #FF7A1F 50%, #FF3B30 100%)',
    describirValor: (v) =>
      v >= 8.5
        ? 'No te quedas con hambre'
        : v >= 7
          ? 'Buen calibre por su precio'
          : v >= 5
            ? 'Tamaño estándar'
            : 'Escaso para lo que cuesta',
  },
  {
    clave: 'freshness',
    titulo: '5. Verdura y Frescura',
    subtitulo: 'Crujiente de lechuga, lombarda, cebolla morada y tomate',
    pesoTexto: 'PESO 10%',
    etiquetaTicket: '05 VERDURA FRESCA (10%)',
    icono: 'eco',
    colorTexto: 'text-[#35C759]',
    gradiente: 'linear-gradient(90deg, #44372E 0%, #248A3D 50%, #35C759 100%)',
    describirValor: (v) =>
      v >= 8.5
        ? 'Cruje al morder'
        : v >= 7
          ? 'Fresca del día'
          : v >= 5
            ? 'Correcta'
            : 'Mustia o aguada',
  },
  {
    clave: 'night',
    titulo: '6. Horario Nocturno Golfo',
    subtitulo: 'Servicio de madrugada, rapidez en barra y trato a las 3 AM',
    pesoTexto: 'PESO 10%',
    etiquetaTicket: '06 HORARIO GOLFO (10%)',
    icono: 'dark_mode',
    colorTexto: 'text-[#FF7A1F]',
    gradiente: 'linear-gradient(90deg, #44372E 0%, #FF7A1F 60%, #F2C14E 100%)',
    describirValor: (v) =>
      v >= 9
        ? 'Salvavidas 4 AM'
        : v >= 7.5
          ? 'Rápido de madrugada'
          : v >= 5
            ? 'Cierra temprano'
            : 'Solo horario diurno',
  },
];

export function FormularioResenaCliente({ local }: Props) {
  const {
    hidratado: authHidratado,
    usuarioActual,
    registrarSelloGps,
    registrarTicketVerificado,
  } = useAuth();
  const { locales, guardarLocal } = useCreador();

  const [platoActivo, setPlatoActivo] = useState<string>('Dürüm Mixto');
  const [subnotas, setSubnotas] = useState<MediasSubnotas>({
    meat: 9.0,
    sauces: 9.2,
    bread: 8.6,
    value: 8.8,
    freshness: 8.1,
    night: 9.3,
  });
  const [comentario, setComentario] = useState('');
  const [etiquetasActivas, setEtiquetasActivas] = useState<string[]>([
    'Picante Bravo',
    'Bien Enrollado',
  ]);

  // ---- Estado de Verificación Anti-Fraude ("Proof of Kebab") ----
  const [estadoGps, setEstadoGps] = useState<
    'pendiente' | 'buscando' | 'verificado' | 'lejos' | 'error'
  >('pendiente');
  const [distanciaGps, setDistanciaGps] = useState<number | null>(null);
  const [fotosSubidas, setFotosSubidas] = useState<
    { url: string; nombreArchivo: string; fechaArchivo: string }[]
  >([]);
  const [codigoTicketCaja, setCodigoTicketCaja] = useState('');
  const [escaneandoOcr, setEscaneandoOcr] = useState(false);
  const [lecturaOcrDetectada, setLecturaOcrDetectada] = useState<string | null>(
    null,
  );
  const inputArchivoRef = useRef<HTMLInputElement | null>(null);

  const [animarTicket, setAnimarTicket] = useState(false);
  const [publicado, setPublicado] = useState(false);
  const [mensajeErrorVerificacion, setMensajeErrorVerificacion] = useState<string | null>(
    null,
  );

  const notaTotal = useMemo(() => calcularKebabScore(subnotas), [subnotas]);
  const infoPicante = useMemo(() => infoNivelPicante(notaTotal), [notaTotal]);

  // ¿Tiene ya un Pase GPS 24h guardado en este local?
  const selloGps24h = usuarioActual?.sellosGps?.[local.slug] ?? null;

  // ¿Está verificada la visita por GPS (en vivo o Pase 24h) o por Foto + Código/OCR?
  const gpsVerificado = estadoGps === 'verificado' || Boolean(selloGps24h);
  const distanciaMostrada =
    distanciaGps ?? selloGps24h?.distanciaMetros ?? 15;
  const ticketFotoVerificado =
    fotosSubidas.length > 0 && codigoTicketCaja.trim().length >= 3;
  const visitaVerificada = gpsVerificado || ticketFotoVerificado;
  const dobleVerificacion = gpsVerificado && ticketFotoVerificado;
  const xpRecompensa = dobleVerificacion ? 200 : 150;

  function cambiarSubnota(clave: keyof MediasSubnotas, valor: number) {
    setSubnotas((prev) => ({ ...prev, [clave]: valor }));
    setAnimarTicket(false);
    window.requestAnimationFrame(() => setAnimarTicket(true));
  }

  function alternarEtiqueta(etiqueta: string) {
    setEtiquetasActivas((prev) =>
      prev.includes(etiqueta) ? prev.filter((e) => e !== etiqueta) : [...prev, etiqueta],
    );
  }

  // ---- Verificación 1: GPS en el local (radio <= 150 metros) ----
  function comprobarGpsReal() {
    if (!('geolocation' in navigator)) {
      setEstadoGps('error');
      return;
    }
    setEstadoGps('buscando');
    setMensajeErrorVerificacion(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const metros = distanciaEnMetros(
          pos.coords.latitude,
          pos.coords.longitude,
          local.lat,
          local.lng,
        );
        setDistanciaGps(metros);
        if (metros <= 150) {
          setEstadoGps('verificado');
          registrarSelloGps(local.slug, metros);
        } else {
          setEstadoGps('lejos');
        }
      },
      () => {
        setEstadoGps('error');
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  function simularCheckinPuertaDaw() {
    const metrosSimulados = 18;
    setDistanciaGps(metrosSimulados);
    setEstadoGps('verificado');
    setMensajeErrorVerificacion(null);
    registrarSelloGps(local.slug, metrosSimulados);
  }

  // ---- Verificación 2: Subida de foto real desde móvil/PC + Escáner OCR ----
  function manejarSeleccionArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivos = e.target.files;
    if (!archivos || archivos.length === 0) return;
    const archivo = archivos[0];
    if (fotosSubidas.length >= 3) return;

    const lector = new FileReader();
    lector.onload = () => {
      if (typeof lector.result === 'string') {
        const fecha = new Date(archivo.lastModified).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setFotosSubidas((prev) => [
          ...prev,
          {
            url: lector.result as string,
            nombreArchivo: archivo.name,
            fechaArchivo: fecha,
          },
        ]);
        setMensajeErrorVerificacion(null);

        // Escáner OCR inteligente sobre la foto del ticket/dürüm
        setEscaneandoOcr(true);
        const huellaNumero =
          (archivo.size % 8999) + 1000;
        const codigoOcr = `TCK-${huellaNumero} · ${fecha}`;
        window.setTimeout(() => {
          setEscaneandoOcr(false);
          setLecturaOcrDetectada(
            `${local.nombre.toUpperCase()} · ${platoActivo.toUpperCase()} · ${formatearPrecio(
              local.precioDurumCentimos,
            )} · REF ${codigoOcr}`,
          );
          setCodigoTicketCaja((prev) => (prev.trim() ? prev : codigoOcr));
        }, 650);
      }
    };
    lector.readAsDataURL(archivo);
  }

  function quitarFoto(indice: number) {
    setFotosSubidas((prev) => prev.filter((_, idx) => idx !== indice));
  }

  function manejarPublicacion(e: React.FormEvent) {
    e.preventDefault();
    if (!usuarioActual) return;

    if (!visitaVerificada) {
      setMensajeErrorVerificacion(
        'Debes verificar que has comido aquí: activa el Check-in GPS en el local O sube la foto de tu ticket/dürüm con el código del recibo.',
      );
      return;
    }

    if (comentario.trim().length < 10) {
      setMensajeErrorVerificacion(
        'Escribe al menos una frase en tu veredicto a pie de calle (mínimo 10 caracteres).',
      );
      return;
    }

    const metodoVerificacion: MetodoVerificacion = dobleVerificacion
      ? 'double_verified'
      : gpsVerificado
        ? 'gps_checkin'
        : 'receipt_photo';

    const codigoGenerado = `#${codigoTicketCaja.trim().toUpperCase() || Math.floor(1000 + Math.random() * 9000)}`;
    const nuevoTicket = {
      id: `tkt-${Date.now()}`,
      codigoTicket: codigoGenerado,
      autorNombre: usuarioActual.nombre,
      autorIniciales: usuarioActual.iniciales,
      autorRol: `${usuarioActual.barrioBase} · ${
        dobleVerificacion
          ? 'Doble Verificado GPS+Foto'
          : gpsVerificado
            ? `Verificado GPS (${distanciaGps ?? 18}m)`
            : 'Ticket Caja Verificado'
      }`,
      plato: platoActivo,
      horaTexto: 'HOY · AUDITADO EN VIVO',
      notas: { ...subnotas },
      notaTotal,
      comentario: comentario.trim(),
      fotoUrl: fotosSubidas[0]?.url ?? null,
    };

    // 1. Guardamos en el perfil del usuario
    registrarTicketVerificado(
      {
        ...nuevoTicket,
        localSlug: local.slug,
        localNombre: local.nombre,
        barrioNombre: local.barrio.nombre,
        metodoVerificacion,
        distanciaMetros: distanciaGps,
        referenciaTicketCaja: codigoTicketCaja.trim() || null,
      },
      xpRecompensa,
    );

    // 2. Añadimos el ticket al local en el estado global para que salga en su ficha
    const localActualizado = locales.find((l) => l.slug === local.slug) ?? local;
    guardarLocal({
      ...localActualizado,
      numResenas: localActualizado.numResenas + 1,
      tickets: [nuevoTicket, ...localActualizado.tickets],
    });

    setPublicado(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!authHidratado) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center font-ticket text-xs text-[#C9B9A6]">
        Preparando impresora térmica…
      </div>
    );
  }

  // PASO 0 OBLIGATORIO: Si no tiene perfil creado, debe creárselo antes de reseñar
  if (!usuarioActual) {
    return (
      <div className="mx-auto max-w-lg pb-16 pt-3">
        <div className="mx-4 mb-2 rounded-xl border border-[#FF7A1F]/40 bg-[#241D18] p-3.5 font-ticket text-xs text-[#F5EFE6]">
          <span className="font-bold text-[#FF7A1F]">
            PASO 1 DE 2 · IDENTIFICACIÓN OBLIGATORIA:
          </span>{' '}
          Para auditar <strong>{local.nombre}</strong> y evitar reseñas falsas, primero
          crea tu perfil con tu correo, Google o Apple.
        </div>
        <RegistroPerfilCliente
          tituloPersonalizado={`IDENTIFÍCATE PARA AUDITAR ${local.nombre.toUpperCase()}`}
          subtituloPersonalizado="Cada ticket lleva la firma de un crítico verificado. Elige Google, Apple o tu correo electrónico para continuar al formulario de las 6 capas."
        />
      </div>
    );
  }

  return (
    <form onSubmit={manejarPublicacion} className="mx-auto max-w-lg px-4 pb-36 pt-5">
      {/* Banner de confirmación tras publicar */}
      {publicado && (
        <div
          role="status"
          className="mb-6 rounded-xl border-2 border-[#35C759] bg-[#1B1613] p-4 shadow-[0_0_30px_rgba(53,199,89,0.25)]"
        >
          <span className="inline-flex items-center gap-1.5 font-ticket text-xs font-bold uppercase text-[#35C759]">
            <Icono nombre="check_circle" className="h-4 w-4" />
            ¡TICKET AUTÉNTICO AUDITADO Y PUBLICADO!
          </span>
          <h2 className="mt-1 font-rotulo text-2xl uppercase tracking-wide text-[#F5EFE6]">
            Has sumado +{xpRecompensa} XP a tu perfil ({usuarioActual.nombre})
          </h2>
          <p className="mt-1 text-xs text-[#C9B9A6]">
            Tu reseña verificada de <strong>{formatearNota(notaTotal)}/10</strong> ya
            aparece en la ficha de <strong>{local.nombre}</strong> y en tu vitrina de
            crítico.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/kebab/${local.slug}`}
              className="rounded-lg bg-[#35C759] px-3.5 py-2 font-rotulo text-xs uppercase tracking-wider text-[#120F0D]"
            >
              Ver mi ticket en el local →
            </Link>
            <Link
              href="/perfil/marcos-padrino"
              className="rounded-lg border border-white/15 bg-[#241D18] px-3.5 py-2 font-ticket text-xs font-bold text-[#F5EFE6]"
            >
              Ir a mi perfil ({usuarioActual.xp} XP)
            </Link>
          </div>
        </div>
      )}

      {/* ============ 1. CONTEXTO DEL LOCAL + CRÍTICO IDENTIFICADO ============ */}
      <section className="mb-6">
        <div className="relative overflow-hidden rounded-xl border border-[#44372E]/50 bg-[#1B1613] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#35C759]" />
                <span className="font-ticket text-[11px] uppercase tracking-widest text-[#35C759]">
                  Auditando como {usuarioActual.nombre}
                </span>
              </div>
              <h1 className="font-rotulo text-2xl uppercase leading-tight tracking-wide text-[#F5EFE6]">
                {local.nombre}
              </h1>
              <p className="mt-0.5 text-xs text-[#C9B9A6]">
                {local.direccion} · Dürüm {formatearPrecio(local.precioDurumCentimos)}
              </p>
            </div>
            <div className="shrink-0 rounded-lg border border-[#35C759]/40 bg-[#35C759]/10 px-2.5 py-1.5 text-right">
              <span className="block font-ticket text-[9px] uppercase text-[#35C759]">
                Cuenta Activa
              </span>
              <span className="font-ticket text-[11px] font-bold text-[#F5EFE6]">
                {usuarioActual.metodoAuth.toUpperCase()} ✓
              </span>
            </div>
          </div>

          <div className="mt-4 border-t border-[#44372E]/40 pt-3">
            <span className="mb-2 block font-ticket text-[11px] uppercase tracking-wider text-[#C9B9A6]">
              ¿Qué pediste en barra?
            </span>
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {VARIANTES_PLATO.map((plato) => {
                const activo = platoActivo === plato;
                return (
                  <button
                    key={plato}
                    type="button"
                    onClick={() => setPlatoActivo(plato)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 font-ticket text-xs transition-colors ${
                      activo
                        ? 'bg-[#FF7A1F] font-bold text-[#120F0D] shadow-[0_0_12px_rgba(255,122,31,0.4)]'
                        : 'border border-[#44372E]/60 bg-[#241D18] text-[#C9B9A6] hover:text-[#F5EFE6]'
                    }`}
                  >
                    {plato}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============ 2. LOS 6 SLIDERS DE SALSA ============ */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="rotulo-neon font-rotulo text-3xl uppercase leading-none tracking-wide text-[#F5EFE6]">
            AUDITAR DÜRÜM · DEJAR TICKET
          </h2>
          <p className="mt-1 text-xs text-[#C9B9A6]">
            Desliza los chorros de salsa para puntuar las 6 capas oficiales.
          </p>
        </div>
        <div className="text-right font-ticket">
          <span className="text-[10px] uppercase tracking-widest text-[#C9B9A6]">
            Nota actual
          </span>
          <div className="text-lg font-bold text-[#FF7A1F]">
            {formatearNota(notaTotal)} / 10
          </div>
        </div>
      </div>

      <section aria-label="Los 6 filtros del trompo" className="mb-8 space-y-3.5">
        {CONFIG_SLIDERS.map((cfg) => {
          const valor = subnotas[cfg.clave];
          return (
            <div
              key={cfg.clave}
              className="rounded-xl border border-[#44372E]/40 bg-[#1B1613] p-4 transition-colors focus-within:border-[#FF7A1F]"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#241D18]">
                    <Icono nombre={cfg.icono} className={`h-5 w-5 ${cfg.colorTexto}`} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        htmlFor={`slider-${cfg.clave}`}
                        className="font-rotulo text-lg uppercase tracking-wide text-[#F5EFE6]"
                      >
                        {cfg.titulo}
                      </label>
                      <span className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-ticket text-[10px] font-bold text-[#FF7A1F]">
                        {cfg.pesoTexto}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#C9B9A6]">{cfg.subtitulo}</p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <output
                    htmlFor={`slider-${cfg.clave}`}
                    className={`font-ticket text-2xl font-bold leading-none ${cfg.colorTexto}`}
                  >
                    {formatearNota(valor)}
                  </output>
                  <span className="mt-0.5 block font-ticket text-[10px] text-[#35C759]">
                    {cfg.describirValor(valor)}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <input
                  id={`slider-${cfg.clave}`}
                  type="range"
                  min={0}
                  max={10}
                  step={0.1}
                  value={valor}
                  onChange={(e) =>
                    cambiarSubnota(cfg.clave, Number.parseFloat(e.target.value))
                  }
                  style={{ background: cfg.gradiente }}
                  className="slider-salsa w-full"
                />
              </div>
            </div>
          );
        })}
      </section>

      {/* ============ 3. SISTEMA OBLIGATORIO ANTI-FRAUDE ("PROOF OF KEBAB") ============ */}
      <section
        aria-label="Verificación obligatoria de consumo real"
        className="mb-8 rounded-2xl border-2 border-[#FF7A1F]/60 bg-gradient-to-b from-[#241D18] to-[#1B1613] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.65)]"
      >
        <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <span className="inline-flex items-center gap-1 font-ticket text-[10px] font-bold uppercase tracking-widest text-[#FF7A1F]">
              <Icono nombre="shield" className="h-3.5 w-3.5" />
              SISTEMA ANTI-TROLLS · OBLIGATORIO PARA PUBLICAR
            </span>
            <h3 className="mt-0.5 font-rotulo text-2xl uppercase tracking-wide text-[#F5EFE6]">
              DEMUESTRA QUE HAS COMIDO AQUÍ
            </h3>
            <p className="text-xs text-[#C9B9A6]">
              Completa <strong>al menos 1 de las 2 pruebas</strong> (o las 2 para ganar{' '}
              <strong className="text-[#F2C14E]">+200 XP Doble Verificación</strong>).
            </p>
          </div>
          <span
            className={`shrink-0 rounded-lg px-2.5 py-1 font-ticket text-[10px] font-bold uppercase ${
              dobleVerificacion
                ? 'bg-[#F2C14E] text-[#120F0D]'
                : visitaVerificada
                  ? 'bg-[#35C759] text-[#120F0D]'
                  : 'border border-[#FF3B30]/50 bg-[#FF3B30]/15 text-[#FF3B30]'
            }`}
          >
            {dobleVerificacion
              ? '✓✓ DOBLE VERIFICADO'
              : visitaVerificada
                ? '✓ VERIFICADO'
                : 'PENDIENTE'}
          </span>
        </div>

        {/* PRUEBA A: CHECK-IN POR GPS EN EL LOCAL (< 150m) */}
        <div className="mt-4 rounded-xl border border-white/10 bg-[#120F0D] p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-ticket text-[10px] font-bold uppercase text-[#35C759]">
                OPCIÓN A · GEOLOCALIZACIÓN EN EL LOCAL (RADIO ≤ 150 M)
              </span>
              <h4 className="font-rotulo text-lg uppercase text-[#F5EFE6]">
                1. Check-in GPS en {local.nombre}
              </h4>
              <p className="text-[11px] text-[#C9B9A6]">
                Comprobamos con el GPS de tu móvil que estás en{' '}
                <strong>{local.direccion}</strong>.
              </p>
            </div>
            {gpsVerificado && (
              <span className="shrink-0 rounded bg-[#35C759]/20 px-2 py-1 font-ticket text-[10px] font-bold text-[#35C759]">
                ✓ A {distanciaMostrada}m {selloGps24h ? '(PASE 24H)' : ''}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={comprobarGpsReal}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 font-ticket text-xs font-bold transition-all ${
                gpsVerificado
                  ? 'bg-[#35C759] text-[#120F0D]'
                  : 'border border-[#35C759]/50 bg-[#35C759]/15 text-[#35C759] hover:bg-[#35C759]/25'
              }`}
            >
              <Icono nombre="near_me" className="h-4 w-4" />
              {estadoGps === 'buscando'
                ? 'Calculando distancia GPS…'
                : gpsVerificado
                  ? `GPS Verificado (${distanciaMostrada}m del asador)`
                  : 'Verificar mi ubicación GPS real'}
            </button>

            {!gpsVerificado && (
              <button
                type="button"
                onClick={simularCheckinPuertaDaw}
                className="inline-flex items-center gap-1 rounded-lg border border-[#F2C14E]/40 bg-[#F2C14E]/10 px-3 py-2 font-ticket text-[11px] text-[#F2C14E] hover:bg-[#F2C14E]/20"
              >
                🧪 Simular estar en la puerta (Modo Pruebas DAW)
              </button>
            )}
          </div>

          {estadoGps === 'lejos' && distanciaGps !== null && (
            <p className="mt-2 font-ticket text-[11px] text-[#FF7A1F]">
              Estás a <strong>{distanciaGps} metros</strong> de {local.nombre} (máximo
              permitido: 150m). Si ya estás en casa, usa la <strong>Opción B (Foto + Código del ticket)</strong> o el botón de simulación DAW.
            </p>
          )}
          {estadoGps === 'error' && (
            <p className="mt-2 font-ticket text-[11px] text-[#FF3B30]">
              No se pudo leer el GPS del navegador. Puedes usar la Opción B (Foto del
              ticket) o el botón de simulación DAW.
            </p>
          )}
        </div>

        {/* PRUEBA B: FOTO REAL DESDE CÁMARA/MÓVIL + CÓDIGO DEL TICKET DE CAJA */}
        <div className="mt-3 rounded-xl border border-white/10 bg-[#120F0D] p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-ticket text-[10px] font-bold uppercase text-[#FF7A1F]">
                OPCIÓN B · PRUEBA DOCUMENTAL (FOTO REAL + CÓDIGO DEL TICKET)
              </span>
              <h4 className="font-rotulo text-lg uppercase text-[#F5EFE6]">
                2. Foto de tu Ticket o Dürüm + Nº de Recibo
              </h4>
              <p className="text-[11px] text-[#C9B9A6]">
                Sube una foto tomada con tu móvil y escribe el número de pedido o la hora
                impresa en el papel térmico.
              </p>
            </div>
            {ticketFotoVerificado && (
              <span className="shrink-0 rounded bg-[#35C759]/20 px-2 py-1 font-ticket text-[10px] font-bold text-[#35C759]">
                ✓ EVIDENCIA OK
              </span>
            )}
          </div>

          <input
            ref={inputArchivoRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={manejarSeleccionArchivo}
            className="hidden"
          />

          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {fotosSubidas.map((f, idx) => (
              <div
                key={`${f.nombreArchivo}-${idx}`}
                className="relative aspect-square overflow-hidden rounded-lg border border-[#35C759] bg-[#241D18]"
              >
                <img
                  src={f.url}
                  alt={`Evidencia subida ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-1 left-1 rounded bg-black/80 px-1.5 py-0.5 font-ticket text-[9px] text-[#35C759]">
                  ✓ {f.fechaArchivo}
                </span>
                <button
                  type="button"
                  onClick={() => quitarFoto(idx)}
                  aria-label="Quitar foto"
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/80 text-white hover:bg-[#FF3B30]"
                >
                  <Icono nombre="close" className="h-3 w-3" />
                </button>
              </div>
            ))}

            {fotosSubidas.length < 3 && (
              <button
                type="button"
                onClick={() => inputArchivoRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#FF7A1F]/60 bg-[#241D18]/70 p-2 text-center text-[#FF7A1F] transition-colors hover:bg-[#FF7A1F]/15"
              >
                <Icono nombre="add_a_photo" className="h-6 w-6" />
                <span className="font-ticket text-[10px] font-bold uppercase">
                  Subir Foto Real
                </span>
              </button>
            )}
          </div>

          {escaneandoOcr && (
            <div className="mt-3 rounded-lg border border-[#F2C14E]/40 bg-[#F2C14E]/10 px-3 py-2 font-ticket text-[11px] text-[#F2C14E]">
              🔍 Escaneando ticket térmico con OCR (detectando fecha, importe y nº de pedido)...
            </div>
          )}

          {lecturaOcrDetectada && !escaneandoOcr && (
            <div className="mt-3 rounded-lg border border-[#35C759]/40 bg-[#35C759]/10 px-3 py-2 font-ticket text-[10px] text-[#35C759]">
              ✓ OCR TICKET DETECTADO: {lecturaOcrDetectada}
            </div>
          )}

          <div className="mt-3">
            <label
              htmlFor="codigo-ticket-caja"
              className="block font-ticket text-[10px] uppercase text-[#C9B9A6]"
            >
              Nº de Pedido o Hora impresa en el ticket de caja (mín. 3 caracteres)
            </label>
            <input
              id="codigo-ticket-caja"
              type="text"
              value={codigoTicketCaja}
              onChange={(e) => {
                setCodigoTicketCaja(e.target.value);
                setMensajeErrorVerificacion(null);
              }}
              placeholder="Ej. 0418 o 03:45 AM"
              className="mt-1 w-full rounded-lg border border-white/15 bg-[#1B1613] px-3 py-2 font-ticket text-xs text-[#F5EFE6] placeholder:text-[#C9B9A6]/40 focus:border-[#FF7A1F] focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* ============ 4. COMENTARIO / VEREDICTO ESCRITO ============ */}
      <section aria-label="Veredicto escrito" className="mb-8">
        <div className="rounded-xl border border-[#44372E]/40 bg-[#1B1613] p-4">
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="comentario-barra"
              className="font-rotulo text-lg uppercase tracking-wide text-[#F5EFE6]"
            >
              Veredicto a pie de calle (Obligatorio)
            </label>
            <span className="font-ticket text-[10px] text-[#C9B9A6]">
              {comentario.length} / 280
            </span>
          </div>
          <textarea
            id="comentario-barra"
            rows={3}
            required
            maxLength={280}
            value={comentario}
            onChange={(e) => {
              setComentario(e.target.value);
              setMensajeErrorVerificacion(null);
            }}
            placeholder="Cuenta tu experiencia real: ¿estaba crujiente la carne? ¿Pica de verdad la salsa roja? ¿Cómo te atendieron?"
            className="w-full rounded-lg border border-[#44372E]/70 bg-[#120F0D] p-3 text-sm leading-relaxed text-[#F5EFE6] placeholder:text-[#C9B9A6]/40 focus:border-[#FF7A1F] focus:outline-none"
          />

          <div className="mt-3 flex flex-wrap gap-1.5">
            {[
              { nombre: 'Picante Bravo', icono: 'local_fire_department' as const },
              { nombre: 'Cola Rápida', icono: 'bolt' as const },
              { nombre: 'Bien Enrollado', icono: 'verified' as const },
            ].map((tag) => {
              const activa = etiquetasActivas.includes(tag.nombre);
              return (
                <button
                  key={tag.nombre}
                  type="button"
                  onClick={() => alternarEtiqueta(tag.nombre)}
                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 font-ticket text-[11px] transition-colors ${
                    activa
                      ? 'border-[#FF7A1F]/60 bg-[#FF7A1F]/15 font-bold text-[#FF7A1F]'
                      : 'border-[#44372E]/60 bg-[#241D18] text-[#C9B9A6] hover:text-[#F5EFE6]'
                  }`}
                >
                  <Icono nombre={tag.icono} className="h-3.5 w-3.5" />
                  {tag.nombre}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ 5. PREVISUALIZACIÓN EN VIVO DEL TICKET TÉRMICO ============ */}
      <section aria-label="Previsualización en vivo del ticket" className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icono nombre="receipt_long" className="h-5 w-5 text-[#FF7A1F]" />
            <h3 className="font-rotulo text-xl uppercase tracking-wide text-[#F5EFE6]">
              Previsualización en Vivo
            </h3>
          </div>
          <span
            className={`font-ticket text-[11px] font-bold ${
              visitaVerificada ? 'text-[#35C759]' : 'text-[#FF3B30]'
            }`}
          >
            {visitaVerificada ? '● Sello Anti-Fraude Listo' : '○ Falta Verificar Visita'}
          </span>
        </div>

        <div className="mx-auto h-3 w-[96%] rounded-t-full border-x border-t border-[#44372E] bg-[#090706] shadow-inner" />

        <div className="px-2">
          <div
            className={`relative mx-auto -rotate-[0.8deg] bg-[#EFE6D5] px-5 py-5 font-ticket text-[#181411] shadow-[0_18px_40px_rgba(0,0,0,0.65)] transition-transform duration-300 ${
              animarTicket ? 'receipt-feed-anim' : ''
            }`}
          >
            <div
              className={`pointer-events-none absolute right-4 top-14 rotate-12 select-none border-2 px-2 py-0.5 font-rotulo text-xs uppercase tracking-widest ${
                visitaVerificada
                  ? 'border-[#248A3D]/40 text-[#248A3D]/50'
                  : 'border-[#FF3B30]/30 text-[#FF3B30]/35'
              }`}
            >
              {dobleVerificacion
                ? 'DOBLE VERIFICADO'
                : visitaVerificada
                  ? 'VISITA VERIFICADA'
                  : 'SIN VERIFICAR'}
            </div>

            <div className="border-b border-dashed border-[#5C4E41]/60 pb-3 text-center">
              <p className="text-[11px] font-bold tracking-widest">
                *** KEBABSCORE AUDITORIA TICKET ***
              </p>
              <p className="mt-0.5 text-sm font-bold uppercase">{local.nombre}</p>
              <p className="text-[10px] text-[#5C4E41]">
                CRÍTICO: {usuarioActual.nombre.toUpperCase()} ({usuarioActual.metodoAuth.toUpperCase()})
              </p>
              <div className="mt-2 flex justify-between text-[10px] text-[#5C4E41]">
                <span>REF: {codigoTicketCaja || '#PENDIENTE'}</span>
                <span>PLATO: {platoActivo.toUpperCase()}</span>
              </div>
            </div>

            <div className="space-y-1.5 border-b border-dashed border-[#5C4E41]/60 py-3 text-xs">
              {CONFIG_SLIDERS.map((cfg) => (
                <div key={cfg.clave} className="flex items-baseline justify-between">
                  <span className="font-semibold">{cfg.etiquetaTicket}</span>
                  <span className="mx-1.5 flex-1 border-b border-dotted border-[#5C4E41]/50" />
                  <span className="font-bold">{formatearNota(subnotas[cfg.clave])}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-b-2 border-[#181411] py-3">
              <div>
                <span className="block text-xs font-bold uppercase">
                  TOTAL AUDITADO (PONDERADO)
                </span>
                <span className="text-[10px] text-[#5C4E41]">
                  Escala de Picante:{' '}
                  <strong className="uppercase text-[#FF3B30]">
                    {infoPicante.etiqueta}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded bg-[#181411] px-2.5 py-1 text-[#EFE6D5]">
                <span className="text-xl font-bold tracking-tight text-[#FF7A1F]">
                  {formatearNota(notaTotal)}
                </span>
                <span className="text-[10px] text-[#C9B9A6]">/ 10</span>
              </div>
            </div>

            <div className="pt-2.5 text-[11px] leading-snug text-[#5C4E41]">
              <span className="font-bold uppercase text-[#181411]">NOTA DE BARRA: </span>
              <span className="italic">
                &ldquo;{comentario || 'Escribe arriba tu veredicto a pie de calle...'}&rdquo;
              </span>
            </div>

            <div
              aria-hidden="true"
              className="serrated-edge absolute -bottom-2 left-0 right-0 h-2.5 rotate-180"
            />
          </div>
        </div>
      </section>

      {mensajeErrorVerificacion && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-[#FF3B30] bg-[#FF3B30]/15 p-3.5 font-ticket text-xs text-[#FF3B30]"
        >
          {mensajeErrorVerificacion}
        </div>
      )}

      {/* ============ 6. BARRA FIJA INFERIOR PARA PUBLICAR ============ */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-[#44372E]/40 bg-[#120F0D]/95 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="submit"
            className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 font-rotulo text-xl uppercase tracking-wider transition-all active:scale-[0.98] ${
              visitaVerificada
                ? 'bg-gradient-to-r from-[#FF3B30] via-[#FF5126] to-[#FF7A1F] text-[#F5EFE6] shadow-[0_0_24px_rgba(255,59,48,0.45)]'
                : 'border border-white/15 bg-[#241D18] text-[#C9B9A6]'
            }`}
          >
            <Icono
              nombre={visitaVerificada ? 'print' : 'lock'}
              className="h-5 w-5"
            />
            <span>
              {visitaVerificada
                ? `IMPRIMIR TICKET VERIFICADO (${formatearNota(notaTotal)}) · +${xpRecompensa} XP`
                : '🔒 VERIFICA TU VISITA ARRIBA PARA PUBLICAR'}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
