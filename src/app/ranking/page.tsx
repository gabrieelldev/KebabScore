// =====================================================================
// Ruta /ranking · Carta Luminosa de Málaga (Pantalla 4 de Stitch)
// =====================================================================

import type { Metadata } from 'next';
import { CartaLuminosaCliente } from '@/components/kebab/CartaLuminosaCliente';
import { obtenerDatosInicio } from '@/lib/datos/consultas';

export const metadata: Metadata = {
  title: 'Carta Luminosa · Ranking Top Kebabs de Málaga',
  description:
    'El panel retroiluminado con los mejores dürüms y kebabs de Málaga ordenados por nota bayesiana, salsa casera, carne crujiente y horario nocturno.',
};

export default async function PaginaRanking() {
  const { locales, barrios } = await obtenerDatosInicio();

  return <CartaLuminosaCliente locales={locales} barrios={barrios} />;
}
