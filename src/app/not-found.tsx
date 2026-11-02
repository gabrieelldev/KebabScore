// Página 404 personalizada con estética de ticket de caja.
import Link from 'next/link';
import { TEXTOS } from '@/lib/textos';

export default function NoEncontrado() {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-md items-center justify-center px-4 py-12">
      <div className="ticket-termico w-full rounded-b-lg p-6 pt-8 text-center">
        <p className="text-xs uppercase tracking-widest text-ticket-suave">
          CAJA #01 · PEDIDO EXTRAVIADO
        </p>
        <h1 className="mt-2 font-rotulo text-3xl uppercase text-ticket-tinta">
          {TEXTOS.error404Titulo}
        </h1>
        <p className="mt-3 font-sans text-sm text-ticket-suave">{TEXTOS.error404Texto}</p>
        <div className="mt-5 border-t border-dashed border-ticket-suave/50 pt-4">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primario px-5 py-2 font-ticket text-xs font-bold uppercase text-primario-texto"
          >
            Volver al mostrador (Inicio)
          </Link>
        </div>
      </div>
    </div>
  );
}
