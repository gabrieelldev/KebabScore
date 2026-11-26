// =====================================================================
// AjustesAvisos · panel para encender, afinar y probar los avisos
// ---------------------------------------------------------------------
// El permiso del navegador SOLO se pide desde aquí (o desde la tarjeta
// SugerenciaAvisos), siempre tras un toque del usuario.
// =====================================================================

'use client';

import { useState } from 'react';
import { Icono } from '@/components/ui/Icono';
import { enviarAvisoDePrueba, type PreferenciasAvisos } from '@/lib/avisos/buzon';
import { useAvisos } from '@/lib/avisos/useAvisos';

const TIPOS: ReadonlyArray<{ clave: keyof PreferenciasAvisos; titulo: string; detalle: string }> = [
  {
    clave: 'eventos',
    titulo: 'Eventos especiales',
    detalle: 'Un recordatorio por evento (Doble Brasa, torneos de barrio…).',
  },
  {
    clave: 'misiones',
    titulo: 'Misiones a punto',
    detalle: 'Solo cuando te falta poco para completar una.',
  },
  {
    clave: 'inactividad',
    titulo: 'Si desapareces',
    detalle: 'A la semana y a las 3 semanas sin entrar. Nunca más.',
  },
  {
    clave: 'silencio',
    titulo: 'Sin sonido',
    detalle: 'Llegan a la bandeja sin sonar ni vibrar.',
  },
];

function Interruptor({
  activo,
  onCambiar,
  etiqueta,
}: {
  activo: boolean;
  onCambiar: () => void;
  etiqueta: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      onClick={onCambiar}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
        activo ? 'border-primario bg-primario' : 'border-linea/20 bg-superficie-alta'
      }`}
    >
      <span
        className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-fondo shadow transition-[left] ${
          activo ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

export function AjustesAvisos() {
  const { preferencias, soporte, actualizar, activar, desactivar } = useAvisos();
  const [mensaje, setMensaje] = useState<string | null>(null);

  const permitido = soporte?.permiso === 'granted';
  const encendidos = preferencias.activos && permitido;

  async function alPulsarPrincipal() {
    setMensaje(null);
    if (encendidos) {
      await desactivar();
      return;
    }
    const permiso = await activar();
    if (permiso === 'denied') {
      setMensaje('El navegador tiene los avisos bloqueados. Permítelos en los ajustes del sitio y vuelve a probar.');
    } else if (permiso === 'no-disponible') {
      setMensaje('Este navegador no admite avisos.');
    }
  }

  async function probar() {
    const ok = await enviarAvisoDePrueba(preferencias.silencio);
    setMensaje(ok ? 'Aviso de prueba enviado: míralo en la bandeja de notificaciones.' : 'No se pudo enviar el aviso de prueba.');
  }

  return (
    <section aria-labelledby="titulo-avisos" className="rounded-xl border border-linea/10 bg-superficie-baja p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="titulo-avisos" className="font-rotulo text-xl uppercase leading-none tracking-wide text-texto">
            Avisos de la app
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-texto-suave">
            Pocos y a buena hora. Máximo uno al día y tres a la semana, solo de 12:00 a 23:30 y
            nunca mientras usas la app.
          </p>
        </div>
        {soporte?.notificaciones && soporte.permiso !== 'denied' && (
          <Interruptor
            activo={encendidos}
            onCambiar={alPulsarPrincipal}
            etiqueta="Recibir avisos de KebabScore"
          />
        )}
      </div>

      {soporte && !soporte.notificaciones && (
        <p className="mt-3 font-ticket text-[11px] text-texto-suave">Este navegador no admite avisos.</p>
      )}
      {soporte?.permiso === 'denied' && (
        <p className="mt-3 font-ticket text-[11px] text-guindilla">
          Has bloqueado los avisos en el navegador. Para recibirlos, permítelos en los ajustes del
          sitio (el candado junto a la dirección o los ajustes de la app).
        </p>
      )}

      {encendidos && (
        <>
          <ul className="mt-3 divide-y divide-linea/10 border-t border-linea/10">
            {TIPOS.map((t) => (
              <li key={t.clave} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-texto">{t.titulo}</p>
                  <p className="text-[11px] leading-snug text-texto-suave">{t.detalle}</p>
                </div>
                <Interruptor
                  activo={Boolean(preferencias[t.clave])}
                  onCambiar={() => actualizar({ [t.clave]: !preferencias[t.clave] })}
                  etiqueta={t.titulo}
                />
              </li>
            ))}
          </ul>

          {soporte && !soporte.segundoPlano && (
            <p className="mt-2 rounded-lg border border-mostaza/30 bg-mostaza-gold/10 px-3 py-2 text-[11px] leading-snug text-texto">
              {soporte.instalada
                ? 'Este dispositivo no deja revisar avisos con la app cerrada (pasa en iPhone y Firefox). Te llegará el aviso de prueba, pero los automáticos de momento solo funcionan en Android con Chrome o Edge.'
                : 'Para recibirlos con la app cerrada, instálala en la pantalla de inicio (Android con Chrome o Edge).'}
            </p>
          )}

          <button
            type="button"
            onClick={probar}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-linea/15 bg-superficie px-3 py-2 font-ticket text-xs font-bold uppercase text-texto"
          >
            <Icono nombre="bolt" className="h-4 w-4 text-acento" />
            Probar un aviso
          </button>
        </>
      )}

      {mensaje && (
        <p role="status" className="mt-2 font-ticket text-[11px] text-texto-suave">
          {mensaje}
        </p>
      )}
    </section>
  );
}
