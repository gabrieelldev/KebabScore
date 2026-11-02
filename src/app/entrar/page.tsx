// =====================================================================
// Ruta /entrar · Creación de Perfil o Acceso (Google, Apple, Email)
// =====================================================================

'use client';

import { useRouter } from 'next/navigation';
import { RegistroPerfilCliente } from '@/components/auth/RegistroPerfilCliente';
import { useAuth } from '@/lib/auth/contexto';

export default function PaginaEntrar() {
  const router = useRouter();
  const { usuarioActual } = useAuth();

  return (
    <RegistroPerfilCliente
      tituloPersonalizado={
        usuarioActual ? 'CAMBIAR O ACTUALIZAR PERFIL' : 'CREA TU PERFIL DE CRÍTICO'
      }
      onCompletado={() => router.push('/perfil/marcos-padrino')}
    />
  );
}
