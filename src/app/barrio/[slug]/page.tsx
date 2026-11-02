// =====================================================================
// Ruta /barrio/[slug] · Carta Luminosa filtrada por barrio (SEO local)
// =====================================================================

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CartaLuminosaCliente } from '@/components/kebab/CartaLuminosaCliente';
import { obtenerDatosInicio } from '@/lib/datos/consultas';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const { barrios } = await obtenerDatosInicio();
  const barrio = barrios.find((b) => b.slug === slug);
  if (!barrio) return { title: 'Barrio de Málaga' };
  return {
    title: `Mejores Kebabs en ${barrio.nombre} (Málaga) · Carta Luminosa`,
    description: `Ranking actualizado de kebabs y dürüms en el barrio de ${barrio.nombre}, Málaga. Notas por carne, salsa, pan y horario 3 AM.`,
  };
}

export default async function PaginaBarrio({ params }: { params: Params }) {
  const { slug } = await params;
  const { locales, barrios } = await obtenerDatosInicio();
  const barrio = barrios.find((b) => b.slug === slug);

  if (!barrio) {
    notFound();
  }

  return (
    <CartaLuminosaCliente
      locales={locales}
      barrios={barrios}
      barrioInicial={barrio.slug}
      tituloPersonalizado={`CARTA LUMINOSA · ${barrio.nombre.toUpperCase()}`}
    />
  );
}
