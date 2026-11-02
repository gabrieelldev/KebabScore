// =====================================================================
// Pantalla de inicio (/) · Server Component + Hidratación del Creador
// =====================================================================

import { InicioClienteConectado } from '@/components/kebab/InicioClienteConectado';
import { obtenerDatosInicio } from '@/lib/datos/consultas';

export default async function PaginaInicio() {
  const { locales, barrios, esDemo } = await obtenerDatosInicio();

  return (
    <InicioClienteConectado
      localesServidor={locales}
      barrios={barrios}
      esDemo={esDemo}
    />
  );
}
