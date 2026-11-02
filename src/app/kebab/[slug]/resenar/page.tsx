// =====================================================================
// Ruta /kebab/[slug]/resenar · Formulario de reseña (Dejar Ticket)
// =====================================================================

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FormularioResenaCliente } from '@/components/kebab/FormularioResenaCliente';
import { obtenerLocalPorSlug } from '@/lib/datos/consultas';
import { LOCALES_DEMO } from '@/lib/datos/demo';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return LOCALES_DEMO.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const local = await obtenerLocalPorSlug(slug);
  if (!local) return { title: 'Auditar Dürüm' };
  return {
    title: `Auditar Dürüm en ${local.nombre} · Dejar Ticket`,
    description: `Valora las 6 capas del kebab de ${local.nombre} (${local.barrio.nombre}) con los sliders de salsa e imprime tu ticket térmico.`,
  };
}

export default async function PaginaResenarKebab({ params }: { params: Params }) {
  const { slug } = await params;
  const local = await obtenerLocalPorSlug(slug);

  if (!local) {
    notFound();
  }

  return <FormularioResenaCliente local={local} />;
}
