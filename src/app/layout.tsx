// =====================================================================
// Layout raíz · PWA + Capacitor Ready + ProveedorCreador + BarraPulgar
// =====================================================================

import '@fontsource/anton/latin-400.css';
import '@fontsource-variable/dm-sans';
import '@fontsource/space-mono/latin-400.css';
import '@fontsource/space-mono/latin-700.css';
import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { BarraPulgar, Cabecera } from '@/components/layout/Cabecera';
import { InstaladorPwa } from '@/components/pwa/InstaladorPwa';
import { ProveedorCreador } from '@/lib/creador/contexto';
import { SCRIPT_TEMA_INICIAL } from '@/lib/tema';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#120F0D',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: {
    default: 'KebabScore Málaga · Kebabs puntuados capa a capa',
    template: '%s · KebabScore Málaga',
  },
  description:
    'Encuentra dónde cenar esta noche en Málaga. Valoramos el kebab (carne, salsas, pan, tamaño/precio, verdura y horario nocturno), no el local.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KebabScore',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-tema="noche" suppressHydrationWarning className="h-full antialiased">
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA_INICIAL }} />
      </head>
      <body className="flex min-h-screen flex-col overflow-x-hidden bg-surface font-body-md text-crema-100 selection:bg-brasa-orange selection:text-carbon-900">
        <ProveedorCreador>
          {/* ASCUAS DECORATIVAS DEL ASADOR (partículas suaves de Stitch) */}
          <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
            <span
              className="ember h-1.5 w-1.5 bg-brasa-orange shadow-[0_0_8px_#ff7a1f]"
              style={{ left: '18%', bottom: '25%', animationDuration: '5.5s', animationDelay: '0.2s' }}
            />
            <span
              className="ember h-1 w-1 bg-mostaza-gold shadow-[0_0_6px_#f2c14e]"
              style={{ left: '45%', bottom: '35%', animationDuration: '4.8s', animationDelay: '1.6s' }}
            />
            <span
              className="ember h-2 w-2 bg-guindilla-red/90 shadow-[0_0_10px_#ff4a3d]"
              style={{ left: '78%', bottom: '20%', animationDuration: '6.2s', animationDelay: '0.8s' }}
            />
            <span
              className="ember h-1.5 w-1.5 bg-brasa-orange/80 shadow-[0_0_8px_#ff7a1f]"
              style={{ left: '88%', bottom: '40%', animationDuration: '5.1s', animationDelay: '2.3s' }}
            />
            <span
              className="ember h-1 w-1 bg-crema-100 shadow-[0_0_6px_#ffffff]"
              style={{ left: '32%', bottom: '50%', animationDuration: '6.8s', animationDelay: '3s' }}
            />
          </div>

          <a
            href="#contenido-principal"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brasa-orange focus:px-4 focus:py-2 focus:font-bold focus:text-carbon-900"
          >
            Saltar al contenido
          </a>

          <Suspense fallback={null}>
            <Cabecera />
          </Suspense>

          <main id="contenido-principal" className="relative z-20 flex-1 pt-20 pb-20">
            <InstaladorPwa />
            {children}
          </main>

          <Suspense fallback={null}>
            <BarraPulgar />
          </Suspense>
        </ProveedorCreador>
      </body>
    </html>
  );
}
