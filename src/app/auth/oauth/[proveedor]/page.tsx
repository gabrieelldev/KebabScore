// =====================================================================
// Ruta /auth/oauth/[proveedor] · Pasarela OAuth 2.0 (Google / Apple)
// =====================================================================

import { Suspense } from 'react';
import { PasarelaOAuthCliente } from '@/components/auth/PasarelaOAuthCliente';

export function generateStaticParams() {
  return [{ proveedor: 'google' }, { proveedor: 'apple' }];
}

type Props = {
  params: Promise<{ proveedor: string }>;
};

export default async function PaginaOAuthProveedor({ params }: Props) {
  const { proveedor } = await params;
  const provNormalizado = proveedor === 'apple' ? 'apple' : 'google';

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-12 text-center font-ticket text-xs text-[#C9B9A6]">
          Conectando con {provNormalizado === 'google' ? 'Google' : 'Apple'}...
        </div>
      }
    >
      <PasarelaOAuthCliente proveedor={provNormalizado} />
    </Suspense>
  );
}
