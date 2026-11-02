// =====================================================================
// Configuración de Next.js (Web + PWA + Exportación Móvil Capacitor)
// ---------------------------------------------------------------------
// - En modo normal (`npm run build`), compila para Vercel / servidor Node.
// - Cuando `NEXT_OUTPUT_EXPORT=true` (al empaquetar para Android / iOS
//   con Capacitor), activa `output: 'export'` para generar la carpeta
//   estática `out/` que se mete dentro del `.apk` o `.ipa`.
// =====================================================================

import type { NextConfig } from 'next';

const esExportacionMovil = process.env.NEXT_OUTPUT_EXPORT === 'true';

const nextConfig: NextConfig = {
  ...(esExportacionMovil ? { output: 'export' } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
