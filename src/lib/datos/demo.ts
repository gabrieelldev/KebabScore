// =====================================================================
// DATOS DE DEMOSTRACIÓN · AHORA CON LOS LOCALES Y FOTOS DE STITCH
// ---------------------------------------------------------------------
// Incluye los 5 locales protagonistas del diseño de Stitch con sus URLs
// de imagen (hotlinked directamente desde el HTML exportado de Stitch)
// más los demás locales de Málaga para el mapa y filtros por barrio.
// =====================================================================

import type { Barrio, Franja, MediasSubnotas, ResenaTicket } from './tipos';

export const FOTOS_STITCH = {
  trompoHero:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDoV0X0viZhb9g5xrSwkC8a8rtoLvLK9KBEs2Yq-kk091Rs6U07vTSgWigQ5NF-xyXTb_envbDUvYtn4ngjM_fp9ls1963pu_lcQ7O4tUX8HJcASbSqRS-P84YW2YIrbvdGmYIv3NCivtu5un4F4gVZkeZ7xQodSl4T9-OZjMouysT0BlAOBYeAIck0iUGYDN2AGlEYNmXTq6odAu-IvjRUAsjHMl58cuQwpg9yMGQ',
  plato01:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAafc2MSaUtrQjvnoG4hYxGP9WTyEaa-ko-aV3J6IxexvHaY50A0f5n9XtKLyF9r2cTgymWDKowPmz3NpMhl2jKfoh5547txF46zw9nK9eO4hEc4uRaJrnAHcHtNvJEBWP4HRA1SW8c96WAT9AqMUeARwQtBRcrv-_OpK55wCdiDPx530VFL9gXOxBXGz2yfP1-XnE_7u61gtJIDpghXuSToGySr124iJ2JRfPRl_g',
  plato01Oro:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAafc2MSaUtrQjvnoG4hYxGP9WTyEaa-ko-aV3J6IxexvHaY50A0f5n9XtKLyF9r2cTgymWDKowPmz3NpMhl2jKfoh5547txF46zw9nK9eO4hEc4uRaJrnAHcHtNvJEBWP4HRA1SW8c96WAT9AqMUeARwQtBRcrv-_OpK55wCdiDPx530VFL9gXOxBXGz2yfP1-XnE_7u61gtJIDpghXuSToGySr124iJ2JRfPRl_g',
  plato02:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuABLsuL03MAw-OGSA8tUr4kpTYkpenxIiiJujUsQ4pwaNsTg0zgdyUijiK4i4iMf7ZnnG54TR6GNMkM-bkX6LSCFd_jEUmsGrYy_S0i6_Dl9imB2mJr4rb-q_RtGQRUmwyaH63aYkn-wZCfZx2tmHLcqc4SzxfqmHK_rrMfJYPTeNAkgZj0ixdNzMky0HkyYcGKZeWDL9nQ7Ds1cW9dZnldgEt9G4aAGoCkvLM3byU',
  plato02Plata:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuABLsuL03MAw-OGSA8tUr4kpTYkpenxIiiJujUsQ4pwaNsTg0zgdyUijiK4i4iMf7ZnnG54TR6GNMkM-bkX6LSCFd_jEUmsGrYy_S0i6_Dl9imB2mJr4rb-q_RtGQRUmwyaH63aYkn-wZCfZx2tmHLcqc4SzxfqmHK_rrMfJYPTeNAkgZj0ixdNzMky0HkyYcGKZeWDL9nQ7Ds1cW9dZnldgEt9G4aAGoCkvLM3byU',
  plato03:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBq37x5vDozxyTYNlI9l2uIm2_8piGttfbWzZNTvhAfG5XxmSVFBpaF1Ejvh0myZENRjGy0qqAyzGA-F4_G2J6M9OLvKOI4EbMY4z3tuOReE5fMFAgV-juAcxMs9U1P_gcXOwraJ2qOcpsczxMCZV9uYtxjjP4crgjCTYORlaGl5oto43WqLT_23xZJDup9SVaUzEBIWfzjJZhOF5N0MG3P73hnIuUuCRNugltvfdM',
  plato03Bronce:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBq37x5vDozxyTYNlI9l2uIm2_8piGttfbWzZNTvhAfG5XxmSVFBpaF1Ejvh0myZENRjGy0qqAyzGA-F4_G2J6M9OLvKOI4EbMY4z3tuOReE5fMFAgV-juAcxMs9U1P_gcXOwraJ2qOcpsczxMCZV9uYtxjjP4crgjCTYORlaGl5oto43WqLT_23xZJDup9SVaUzEBIWfzjJZhOF5N0MG3P73hnIuUuCRNugltvfdM',
  durumMano:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCc9pcENoI8BPk7tOC0gcUvWXfo1syMrTM3qlmQ7ObPI6YjAI7cBnaphQnIAuNqG4ydcpUMTWEPkA3S4Kat3PEFnKnRqFwC4Y6elFFL3E161M2mMnVeff60vbFFKbbJXeBkCpgIjOl3KWASDXfUftkCtHMo3U-p99vxu2IZaoyrqDVwCP6RmUOko86XdbsSCYTJFjoo9vg00dqy68x4QbwCYAZGqLaQXdj4E97srRE',
  corteAluminio:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAsWN9Zxv_boaEAQqS4gYeUME2nEh_-g33RLEHZTudq4YmLAuA2MH3a8k5xUAnjraT--Iv_faZRlNxlQCk79RzFQZatXvIa0N2B6sF6NkLoxP3_ZCETdkrMTWzifvwkPHItujg60HJJ5ShlunC17vkifC905WAkxcxBo9_NnlNUobXAbhr8sxDtdcdhwsRcHwfNQBuli_7CQynVwOGlG0y1Ho4NHda8RQaJi3zquHM',
  corteLavash:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAsWN9Zxv_boaEAQqS4gYeUME2nEh_-g33RLEHZTudq4YmLAuA2MH3a8k5xUAnjraT--Iv_faZRlNxlQCk79RzFQZatXvIa0N2B6sF6NkLoxP3_ZCETdkrMTWzifvwkPHItujg60HJJ5ShlunC17vkifC905WAkxcxBo9_NnlNUobXAbhr8sxDtdcdhwsRcHwfNQBuli_7CQynVwOGlG0y1Ho4NHda8RQaJi3zquHM',
  platoCobre:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBq37x5vDozxyTYNlI9l2uIm2_8piGttfbWzZNTvhAfG5XxmSVFBpaF1Ejvh0myZENRjGy0qqAyzGA-F4_G2J6M9OLvKOI4EbMY4z3tuOReE5fMFAgV-juAcxMs9U1P_gcXOwraJ2qOcpsczxMCZV9uYtxjjP4crgjCTYORlaGl5oto43WqLT_23xZJDup9SVaUzEBIWfzjJZhOF5N0MG3P73hnIuUuCRNugltvfdM',
  avatarMarcos:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDoV0X0viZhb9g5xrSwkC8a8rtoLvLK9KBEs2Yq-kk091Rs6U07vTSgWigQ5NF-xyXTb_envbDUvYtn4ngjM_fp9ls1963pu_lcQ7O4tUX8HJcASbSqRS-P84YW2YIrbvdGmYIv3NCivtu5un4F4gVZkeZ7xQodSl4T9-OZjMouysT0BlAOBYeAIck0iUGYDN2AGlEYNmXTq6odAu-IvjRUAsjHMl58cuQwpg9yMGQ',
} as const;

export const BARRIOS_DEMO: Barrio[] = [
  { slug: 'centro', nombre: 'Centro Histórico', distrito: 'Centro' },
  { slug: 'el-perchel', nombre: 'El Perchel', distrito: 'Centro' },
  { slug: 'la-trinidad', nombre: 'La Trinidad', distrito: 'Centro' },
  { slug: 'soho', nombre: 'Soho', distrito: 'Centro' },
  { slug: 'teatinos', nombre: 'Teatinos', distrito: 'Teatinos-Universidad' },
  { slug: 'huelin', nombre: 'Huelin', distrito: 'Carretera de Cádiz' },
  { slug: 'pedregalejo', nombre: 'Pedregalejo', distrito: 'Este' },
  { slug: 'el-palo', nombre: 'El Palo', distrito: 'Este' },
  { slug: 'lagunillas', nombre: 'Lagunillas', distrito: 'Centro' },
  { slug: 'cruz-de-humilladero', nombre: 'Cruz de Humilladero', distrito: 'Cruz de Humilladero' },
  { slug: 'ciudad-jardin', nombre: 'Ciudad Jardín', distrito: 'Ciudad Jardín' },
];

function franjas(dias: number[], abre: string, cierra: string): Franja[] {
  return dias.map((dia) => ({ dia, abre, cierra }));
}

const LUN_JUE = [1, 2, 3, 4];
const VIE_SAB = [5, 6];
const TODOS = [1, 2, 3, 4, 5, 6, 7];

export type LocalDemo = {
  slug: string;
  nombre: string;
  barrioSlug: string;
  direccion: string;
  lat: number;
  lng: number;
  precioDurumCentimos: number | null;
  halal: boolean;
  vegetariano: boolean;
  domicilio: boolean;
  panCasero?: boolean;
  insignia?: string;
  pesoGramos?: number;
  fotoPortada: string | null;
  horario: Franja[];
  notaDemo: number | null;
  resenasDemo: number;
  subnotas: MediasSubnotas;
  tickets: ResenaTicket[];
};

const TICKETS_TROMPO_DE_ORO: ResenaTicket[] = [
  {
    id: 'tkt-4092-b',
    codigoTicket: '#4092-B',
    autorNombre: 'Marcos "Padrino" P.',
    autorIniciales: 'MP',
    autorRol: 'Maestro Trompero · LVL 5',
    plato: 'DÜRÜM COMPLETO',
    horaTexto: '03:14 AM · SÁBADO',
    notas: { meat: 9.2, sauces: 9.5, bread: 9.0, value: 9.8, freshness: 8.0, night: 10.0 },
    notaTotal: 9.1,
    comentario:
      'Salvación total tras salir de la plaza. La salsa roja pica de verdad y el pan lo hornean ellos en el instante delante tuya. No se deshizo ni una gota al final del envoltorio.',
    fotoUrl: FOTOS_STITCH.durumMano,
  },
  {
    id: 'tkt-4088-c',
    codigoTicket: '#4088-C',
    autorNombre: 'Elena G. (Crítica Callejera)',
    autorIniciales: 'EG',
    autorRol: 'Crítica Nocturna · LVL 4',
    plato: 'DÜRÜM MIXTO',
    horaTexto: '02:45 AM · VIERNES',
    notas: { meat: 8.8, sauces: 8.6, bread: 9.4, value: 8.5, freshness: 8.2, night: 9.0 },
    notaTotal: 8.7,
    comentario:
      'El pan recién estirado en el horno cambia completamente la experiencia. No es el típico pan industrial chicloso. De los 3 mejores de Málaga.',
    fotoUrl: null,
  },
];

export const LOCALES_DEMO: LocalDemo[] = [
  {
    slug: 'el-trompo-de-oro',
    nombre: 'Shawarma El Trompo de Oro',
    barrioSlug: 'centro',
    direccion: 'Calle Carretería, 42',
    lat: 36.7241,
    lng: -4.4216,
    precioDurumCentimos: 650,
    halal: true,
    vegetariano: true,
    domicilio: true,
    panCasero: true,
    insignia: 'Rey del Pan Casero',
    pesoGramos: 650,
    fotoPortada: FOTOS_STITCH.plato01,
    horario: [
      ...franjas(LUN_JUE, '12:00', '03:30'),
      ...franjas(VIE_SAB, '12:00', '05:00'),
      ...franjas([7], '13:00', '04:30'),
    ],
    notaDemo: 9.1,
    resenasDemo: 482,
    subnotas: { meat: 9.4, sauces: 9.0, bread: 9.2, value: 9.5, freshness: 7.8, night: 10.0 },
    tickets: TICKETS_TROMPO_DE_ORO,
  },
  {
    slug: 'kebab-malaga-centro',
    nombre: 'Kebab Málaga Centro',
    barrioSlug: 'centro',
    direccion: 'Calle Álamos, 12',
    lat: 36.7235,
    lng: -4.4191,
    precioDurumCentimos: 600,
    halal: true,
    vegetariano: true,
    domicilio: true,
    panCasero: true,
    insignia: 'Salsa Roja Secreta',
    pesoGramos: 620,
    fotoPortada: FOTOS_STITCH.plato02,
    horario: [
      ...franjas(LUN_JUE, '12:30', '03:00'),
      ...franjas([5, 6, 7], '12:30', '04:30'),
    ],
    notaDemo: 8.7,
    resenasDemo: 319,
    subnotas: { meat: 8.8, sauces: 9.4, bread: 8.6, value: 8.5, freshness: 8.1, night: 9.0 },
    tickets: [
      {
        id: 'tkt-3190-a',
        codigoTicket: '#3190-A',
        autorNombre: 'Salva_Doner99',
        autorIniciales: 'SD',
        plato: 'DÜRÜM SALSA ROJA',
        horaTexto: '03:50 AM · SÁBADO',
        notas: { meat: 8.8, sauces: 9.6, bread: 8.5, value: 8.4, freshness: 8.0, night: 9.2 },
        notaTotal: 8.8,
        comentario:
          'La salsa roja secreta de la calle Álamos tiene picante real con comino tostado. A las 4 de la mañana sigue saliendo el trompo jugoso.',
        fotoUrl: FOTOS_STITCH.corteAluminio,
      },
    ],
  },
  {
    slug: 'durum-rey-teatinos',
    nombre: 'Dürüm Rey Teatinos',
    barrioSlug: 'teatinos',
    direccion: 'Av. Plutarco, 22',
    lat: 36.7198,
    lng: -4.4742,
    precioDurumCentimos: 590,
    halal: true,
    vegetariano: true,
    domicilio: true,
    panCasero: false,
    insignia: 'Porción Gigante 700g',
    pesoGramos: 710,
    fotoPortada: FOTOS_STITCH.plato03,
    horario: franjas(TODOS, '12:30', '03:00'),
    notaDemo: 8.2,
    resenasDemo: 261,
    subnotas: { meat: 8.1, sauces: 8.0, bread: 8.3, value: 9.4, freshness: 7.9, night: 8.4 },
    tickets: [
      {
        id: 'tkt-2610-t',
        codigoTicket: '#2610-T',
        autorNombre: 'KebabMaster_Vialia',
        autorIniciales: 'KM',
        plato: 'DÜRÜM XXL 700G',
        horaTexto: '01:40 AM · JUEVES',
        notas: { meat: 8.2, sauces: 8.0, bread: 8.4, value: 9.6, freshness: 7.8, night: 8.2 },
        notaTotal: 8.3,
        comentario:
          'Relación gramo/euro imbatible en la zona universitaria: 118 g por euro y doble papel de aluminio bien prensado.',
        fotoUrl: null,
      },
    ],
  },
  {
    slug: 'istanbul-nights-huelin',
    nombre: 'Istanbul Nights Huelin',
    barrioSlug: 'huelin',
    direccion: 'Calle Tomás Echeverría, 8',
    lat: 36.7049,
    lng: -4.4411,
    precioDurumCentimos: 620,
    halal: true,
    vegetariano: false,
    domicilio: true,
    insignia: 'Brasa Nocturna',
    pesoGramos: 610,
    fotoPortada: FOTOS_STITCH.trompoHero,
    horario: franjas(TODOS, '13:00', '03:30'),
    notaDemo: 7.9,
    resenasDemo: 194,
    subnotas: { meat: 8.2, sauces: 7.8, bread: 7.7, value: 8.0, freshness: 7.5, night: 8.2 },
    tickets: TICKETS_TROMPO_DE_ORO.slice(1),
  },
  {
    slug: 'babylon-spit-la-trinidad',
    nombre: 'Babylon Spit La Trinidad',
    barrioSlug: 'la-trinidad',
    direccion: 'Calle Mármoles, 15',
    lat: 36.7266,
    lng: -4.4331,
    precioDurumCentimos: 550,
    halal: true,
    vegetariano: false,
    domicilio: false,
    insignia: 'Clásico Económico',
    pesoGramos: 560,
    fotoPortada: FOTOS_STITCH.corteAluminio,
    horario: franjas(TODOS, '13:00', '02:00'),
    notaDemo: 7.4,
    resenasDemo: 148,
    subnotas: { meat: 7.5, sauces: 7.4, bread: 7.2, value: 8.2, freshness: 7.0, night: 7.1 },
    tickets: TICKETS_TROMPO_DE_ORO.slice(1),
  },
  {
    slug: 'durum-atlas',
    nombre: 'Dürüm Atlas',
    barrioSlug: 'el-perchel',
    direccion: 'Pasaje de la Lámina, 3',
    lat: 36.7151,
    lng: -4.4302,
    precioDurumCentimos: 600,
    halal: true,
    vegetariano: true,
    domicilio: false,
    panCasero: true,
    insignia: 'Lavash al Carbón',
    pesoGramos: 630,
    fotoPortada: FOTOS_STITCH.plato02,
    horario: [...franjas(LUN_JUE, '13:00', '02:30'), ...franjas(VIE_SAB, '13:00', '04:00')],
    notaDemo: 8.5,
    resenasDemo: 96,
    subnotas: { meat: 8.6, sauces: 8.5, bread: 8.8, value: 8.3, freshness: 8.2, night: 8.4 },
    tickets: TICKETS_TROMPO_DE_ORO,
  },
  {
    slug: 'kebab-rompeolas',
    nombre: 'Kebab Rompeolas',
    barrioSlug: 'el-palo',
    direccion: 'Paseo del Asador, 33',
    lat: 36.7209,
    lng: -4.3612,
    precioDurumCentimos: 650,
    halal: false,
    vegetariano: true,
    domicilio: false,
    insignia: 'Brisa del Este',
    pesoGramos: 600,
    fotoPortada: FOTOS_STITCH.plato03,
    horario: [
      ...franjas(TODOS, '13:00', '16:30'),
      ...franjas(TODOS, '20:00', '03:00'),
    ],
    notaDemo: 8.3,
    resenasDemo: 64,
    subnotas: { meat: 8.4, sauces: 8.2, bread: 8.1, value: 8.0, freshness: 8.8, night: 8.2 },
    tickets: TICKETS_TROMPO_DE_ORO.slice(1),
  },
  {
    slug: 'doner-lunatico',
    nombre: 'Döner Lunático',
    barrioSlug: 'soho',
    direccion: 'Calle de la Medianoche, 4',
    lat: 36.7169,
    lng: -4.4241,
    precioDurumCentimos: 700,
    halal: false,
    vegetariano: true,
    domicilio: false,
    insignia: 'Guardia 05:00 AM',
    pesoGramos: 640,
    fotoPortada: FOTOS_STITCH.durumMano,
    horario: franjas([3, 4, 5, 6, 7], '20:30', '05:00'),
    notaDemo: 9.6,
    resenasDemo: 2,
    subnotas: { meat: 9.5, sauces: 9.5, bread: 9.5, value: 9.0, freshness: 9.5, night: 10.0 },
    tickets: TICKETS_TROMPO_DE_ORO.slice(0, 1),
  },
  {
    slug: 'durumcito-pedregalejo',
    nombre: 'Dürümcito Pedregalejo',
    barrioSlug: 'pedregalejo',
    direccion: 'Calle del Comino, 18',
    lat: 36.7203,
    lng: -4.3791,
    precioDurumCentimos: 580,
    halal: false,
    vegetariano: true,
    domicilio: true,
    pesoGramos: 590,
    fotoPortada: FOTOS_STITCH.plato01,
    horario: franjas([4, 5, 6, 7], '20:00', '03:30'),
    notaDemo: 7.7,
    resenasDemo: 41,
    subnotas: { meat: 7.8, sauces: 7.9, bread: 7.6, value: 7.5, freshness: 8.1, night: 7.4 },
    tickets: TICKETS_TROMPO_DE_ORO.slice(1),
  },
];
