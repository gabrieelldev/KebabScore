// =====================================================================
// Ruta privada /creador · Consola del Maestro Asador
// ---------------------------------------------------------------------
// Incluye `robots: { index: false, follow: false }` para que Google y
// otros buscadores nunca indexen tu panel privado de administración.
// =====================================================================

import type { Metadata } from 'next';
import { PanelCreadorCliente } from '@/components/creador/PanelCreadorCliente';

export const metadata: Metadata = {
  title: 'Consola del Maestro Asador · Panel de Creador',
  description: 'Panel privado de administración y edición en vivo de KebabScore Málaga.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaginaCreador() {
  return <PanelCreadorCliente />;
}
