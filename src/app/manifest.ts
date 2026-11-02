// =====================================================================
// Web App Manifest (/manifest.webmanifest) · Configuración PWA
// ---------------------------------------------------------------------
// Explicación para 1.º de DAW:
// Este archivo le dice a Android (Chrome), iOS (Safari) y Windows/macOS
// que KebabScore NO es solo una página web, sino una APLICACIÓN
// instalable:
//   - `display: 'standalone'` quita la barra de direcciones del navegador
//     para que se vea a pantalla completa como una app nativa.
//   - `shortcuts` añade accesos directos al mantener pulsado el icono de
//     la app en el móvil ("Auditar Dürüm", "Carta Luminosa", "Misiones").
// =====================================================================

import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: 'es.malaga.kebabscore',
    name: 'KebabScore Málaga · El kebab de las 3 AM',
    short_name: 'KebabScore',
    description:
      'Encuentra y valora los mejores kebabs y dürüms de Málaga capa a capa: carne, salsas, pan, tamaño/precio, verdura y horario nocturno.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#120F0D',
    theme_color: '#120F0D',
    lang: 'es-ES',
    categories: ['food', 'lifestyle', 'navigation'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Auditar Dürüm (Dejar Ticket)',
        short_name: 'Valorar',
        description: 'Puntúa las 6 capas e imprime un ticket térmico',
        url: '/kebab/el-trompo-de-oro/resenar',
      },
      {
        name: 'Carta Luminosa (Ranking)',
        short_name: 'Ranking',
        description: 'Top kebabs de Málaga por barrio',
        url: '/ranking',
      },
      {
        name: 'Misiones Nocturnas 3 AM',
        short_name: 'Misiones',
        description: 'Retos nocturnos, XP y pegatinas de escaparate',
        url: '/misiones',
      },
    ],
  };
}
