// =====================================================================
// BotonCheckinRapido24h · Pase GPS Nocturno de 24 horas en el local
// ---------------------------------------------------------------------
// Explicación para 1.º de DAW:
// - Permite al usuario fichar en 1 toque cuando está en la cola del kebab
//   a las 3:00 AM (con las manos ocupadas) y guardar un "Sello GPS" válido
//   durante 24 horas en su perfil (`sellosGps[localSlug]`).
// - Así puede escribir su reseña tranquilamente al día siguiente desde casa
//   con la prueba GPS ya verificada.
// =====================================================================

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Icono } from '@/components/ui/Icono';
import { useAuth } from '@/lib/auth/contexto';

type Props = {
  localSlug: string;
  localNombre: string;
  lat: number;
  lng: number;
};

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

export function BotonCheckinRapido24h({
  localSlug,
  localNombre,
  lat,
  lng,
}: Props) {
  const { usuarioActual, registrarSelloGps } = useAuth();
  const [comprobando, setComprobando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const selloExistente = usuarioActual?.sellosGps?.[localSlug] ?? null;

  function ficharPorGpsReal() {
    if (!usuarioActual) return;
    setMensajeError(null);
    setComprobando(true);

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setComprobando(false);
      setMensajeError('Tu navegador no tiene geolocalización activa.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setComprobando(false);
        const metros = distanciaEnMetros(
          pos.coords.latitude,
          pos.coords.longitude,
          lat,
          lng,
        );
        if (metros <= 150) {
          registrarSelloGps(localSlug, metros);
        } else {
          setMensajeError(
            `Estás a ${metros} m de ${localNombre} (máx. 150 m). Usa el botón de simulación DAW si estás probando desde casa.`,
          );
        }
      },
      () => {
        setComprobando(false);
        setMensajeError(
          'No se pudo leer el GPS. Puedes usar el botón de simulación DAW para probar el pase 24h.',
        );
      },
      { enableHighAccuracy: true, timeout: 7000 },
    );
  }

  function simularCheckinDaw() {
    if (!usuarioActual) return;
    setMensajeError(null);
    registrarSelloGps(localSlug, 14);
  }

  return (
    <section aria-label="Check-in GPS rápido 24h" className="mt-3 px-4">
      <div className="rounded-xl border border-[#2ECC71]/35 bg-[#1B1613] p-3.5 shadow-[0_10px_24px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2ECC71]/15 text-[#2ECC71]">
              <Icono nombre="near_me" className="h-4 w-4" />
            </span>
            <div>
              <p className="font-ticket text-[10px] font-bold uppercase tracking-wider text-[#2ECC71]">
                PASE GPS NOCTURNO 24H · ANTI-RESEÑAS FALSAS
              </p>
              <p className="text-xs text-[#C9B9A6]">
                Ficha en 1 toque en el mostrador y escribe tu reseña mañana desde casa.
              </p>
            </div>
          </div>
        </div>

        {!usuarioActual ? (
          <Link
            href="/entrar"
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#FF7A1F]/40 bg-[#FF7A1F]/15 py-2 font-ticket text-[11px] font-bold uppercase text-[#FF7A1F] hover:bg-[#FF7A1F]/25"
          >
            <Icono nombre="person" className="h-3.5 w-3.5" />
            <span>Inicia sesión con tu correo para fichar GPS</span>
          </Link>
        ) : selloExistente ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#2ECC71]/40 bg-[#2ECC71]/15 px-3 py-2 font-ticket text-[11px] text-[#2ECC71]">
            <span>
              ✓ PASE GPS 24H ACTIVO (A {selloExistente.distanciaMetros} m del local)
            </span>
            <Link
              href={`/kebab/${localSlug}/resenar`}
              className="rounded bg-[#2ECC71] px-2.5 py-1 font-bold text-[#120F0D]"
            >
              Auditar ahora →
            </Link>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={comprobando}
                onClick={ficharPorGpsReal}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#2ECC71] px-3 py-2 font-ticket text-[11px] font-bold uppercase text-[#120F0D] transition-transform active:scale-95 disabled:opacity-50"
              >
                <Icono nombre="near_me" className="h-3.5 w-3.5" />
                <span>
                  {comprobando
                    ? 'Comprobando GPS...'
                    : '📍 Fichar que estoy aquí (Guarda 24h)'}
                </span>
              </button>
              <button
                type="button"
                onClick={simularCheckinDaw}
                className="rounded-lg border border-[#F2C14E]/40 bg-[#F2C14E]/15 px-2.5 py-2 font-ticket text-[10px] font-bold text-[#F2C14E] hover:bg-[#F2C14E]/25"
              >
                🧪 Simular (DAW)
              </button>
            </div>
            {mensajeError && (
              <p className="font-ticket text-[10px] text-[#FF3B30]">
                {mensajeError}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
