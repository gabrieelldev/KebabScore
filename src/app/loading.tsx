// Next.js muestra este archivo automáticamente cuando una ruta tarda en cargar.
import { TrompoCarga } from '@/components/kebab/TrompoCarga';

export default function Cargando() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-4">
      <TrompoCarga />
    </div>
  );
}
