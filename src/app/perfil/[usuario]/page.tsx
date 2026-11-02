// =====================================================================
// Ruta /perfil/[usuario] · Perfil del crítico, pegatinas y misiones
// =====================================================================

import type { Metadata } from 'next';
import { MisionesYPerfilCliente } from '@/components/kebab/MisionesYPerfilCliente';

type Params = Promise<{ usuario: string }>;

export function generateStaticParams() {
  return [
    { usuario: 'marcos-padrino' },
    { usuario: 'salva-doner99' },
    { usuario: 'elena-callejera' },
  ];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { usuario } = await params;
  return {
    title: `Perfil de ${usuario} · Pegatinas de Escaparate y Tickets`,
    description: `Consulta el rango nocturno, las pegatinas de escaparate y las misiones completadas por ${usuario} en KebabScore Málaga.`,
  };
}

export default async function PaginaPerfilUsuario({ params }: { params: Params }) {
  const { usuario } = await params;
  return <MisionesYPerfilCliente aliasUsuario={usuario} />;
}
