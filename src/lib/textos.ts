// =====================================================================
// Microtextos con humor, todos en un único sitio.
// Ventajas: tono coherente, fáciles de revisar y, si algún día
// traducimos la web, solo hay que tocar este archivo.
// =====================================================================

export const TEXTOS = {
  lema: 'Kebabs de Málaga, puntuados capa a capa.',
  subLema: 'Sin patrocinios. Los locales no pueden tocar su nota.',
  buscadorPregunta: '¿Dónde cenas esta noche?',
  buscadorPlaceholder: 'Barrio, calle o nombre del local',

  sinResultados: (consulta: string) =>
    `Ni rastro de «${consulta}». O el trompo se ha apagado o lo has escrito con hambre.`,
  sinAbiertos: 'A estas horas no queda nada abierto por aquí. Toca tirar de nevera.',
  barrioVacio: 'Este barrio todavía no tiene kebabs reseñados. Sé el primer valiente.',
  podioVacio: 'Todavía no hay podio. Faltan valientes con hambre y criterio.',
  sinNota: 'Sin reseñas',

  geoBuscando: 'Olfateando dónde estás…',
  geoDenegada: 'Sin ubicación no hay olfato. Busca tu barrio a mano.',
  geoNoDisponible: 'Tu navegador no sabe dónde estás. Busca tu barrio a mano.',

  cargando: 'Cortando lámina…',
  error404Titulo: '404: este kebab se ha acabado',
  error404Texto:
    'Lo que buscas ya no está en el asador. Puede que el enlace esté mal o que el local haya echado el cierre.',
  errorTitulo: 'Se nos ha caído la salsa al suelo',
  errorTexto: 'Algo ha fallado en la cocina. Prueba otra vez; normalmente a la segunda sale.',

  avisoDemo:
    'Modo demo · Los locales y las notas son FICTICIOS. Conecta Supabase en .env.local para usar datos reales.',
} as const;
