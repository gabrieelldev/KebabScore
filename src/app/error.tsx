// En Next.js, error.tsx SIEMPRE debe ser un Client Component.
'use client';

import { TEXTOS } from '@/lib/textos';

export default function ErrorGlobal({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-md items-center justify-center px-4 py-12">
      <div className="ticket-termico w-full rounded-b-lg p-6 pt-8 text-center">
        <p className="text-xs uppercase tracking-widest text-ticket-suave">AVERÍA EN EL ASADOR</p>
        <h1 className="mt-2 font-rotulo text-3xl uppercase text-ticket-tinta">
          {TEXTOS.errorTitulo}
        </h1>
        <p className="mt-3 font-sans text-sm text-ticket-suave">{TEXTOS.errorTexto}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-primario px-5 py-2 font-ticket text-xs font-bold uppercase text-primario-texto"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
