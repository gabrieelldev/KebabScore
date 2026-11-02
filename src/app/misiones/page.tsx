// =====================================================================
// Ruta /misiones · Misiones, Retos Nocturnos y Ranking Total (Stitch)
// =====================================================================

import type { Metadata } from 'next';
import { MisionesYPerfilCliente } from '@/components/kebab/MisionesYPerfilCliente';

export const metadata: Metadata = {
  title: 'Misiones, Retos Nocturnos y Ranking de la Peña',
  description:
    'Completa retos nocturnos a las 3 AM en Málaga, desbloquea pegatinas de escaparate y sube en el Ranking de la Peña de KebabScore.',
};

export default function PaginaMisiones() {
  return <MisionesYPerfilCliente />;
}
