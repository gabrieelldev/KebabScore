// =====================================================================
// Icono · versión SVG propia de los iconos Material Symbols de Stitch
// ---------------------------------------------------------------------
// ¿Por qué no cargamos la fuente de Google Fonts?
// 1. Pesa ~200 KB y muestra texto roto ("local_fire_department") mientras
//    descarga en una conexión móvil nocturna.
// 2. Estos SVG pesan <3 KB en total, se pintan en el primer milisegundo y
//    funcionan sin conexión.
// =====================================================================

export type NombreIcono =
  | 'local_fire_department'
  | 'whatshot'
  | 'verified'
  | 'receipt'
  | 'receipt_long'
  | 'search'
  | 'near_me'
  | 'location_on'
  | 'rotate_right'
  | 'stars'
  | 'award_star'
  | 'chevron_right'
  | 'arrow_back'
  | 'arrow_forward'
  | 'rate_review'
  | 'add_notes'
  | 'map'
  | 'explore'
  | 'military_tech'
  | 'person'
  | 'shield'
  | 'bakery_dining'
  | 'eco'
  | 'tune'
  | 'print'
  | 'lock'
  | 'add_a_photo'
  | 'add_photo_alternate'
  | 'close'
  | 'kebab_dining'
  | 'schedule'
  | 'sentiment_satisfied'
  | 'bolt'
  | 'redeem'
  | 'workspace_premium'
  | 'leaderboard'
  | 'refresh'
  | 'restaurant'
  | 'water_drop'
  | 'scale'
  | 'dark_mode'
  | 'check_circle'
  | 'share'
  | 'apps'
  | 'location_city'
  | 'Casino'
  | 'nightlight'
  | 'emoji_events';

type Props = {
  nombre: NombreIcono;
  className?: string;
};

export function Icono({ nombre, className = 'w-5 h-5' }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`inline-block shrink-0 select-none ${className}`}
    >
      {renderTrazo(nombre)}
    </svg>
  );
}

function renderTrazo(nombre: NombreIcono) {
  switch (nombre) {
    case 'local_fire_department':
    case 'whatshot':
      return (
        <path
          fill="currentColor"
          stroke="none"
          d="M12 2c.6 2.6-.9 4.5-2.1 5.9-1.4 1.6-2.4 3.1-2.4 5.3 0 2.9 2.2 5.3 5 5.3s5-2.4 5-5.3c0-1.9-.8-3.7-2.1-5.2-.2 1.4-1 2.4-2.1 2.8.6-2.1.2-4.8-1.3-8.8Zm0 18.5c-1.8 0-3.2-1.4-3.2-3.2 0-1.5.9-2.5 2.1-3.6.7 1.2 1.8 1.9 2.9 2.1-.3.5-.4 1.1-.4 1.7 0 .9.5 1.7 1.2 2.1-.7.6-1.6.9-2.6.9Z"
        />
      );
    case 'verified':
    case 'check_circle':
      return (
        <>
          <path d="M12 2.5 14.8 4l3.1-.4.9 3 2.7 1.6-.8 3 .8 3-2.7 1.6-.9 3-3.1-.4L12 21.5 9.2 20l-3.1.4-.9-3-2.7-1.6.8-3-.8-3 2.7-1.6.9-3 3.1.4L12 2.5Z" />
          <path d="m8.8 12.2 2.2 2.2 4.4-4.4" />
        </>
      );
    case 'receipt':
    case 'receipt_long':
      return (
        <>
          <path d="M5 3v18l2.5-1.6L10 21l2-1.6L14 21l2.5-1.6L19 21V3l-2.5 1.6L14 3l-2 1.6L10 3 7.5 4.6 5 3Z" />
          <path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4.5" />
        </>
      );
    case 'search':
      return (
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </>
      );
    case 'near_me':
      return <polygon points="3 11 21 3 13 21 11 13 3 11" />;
    case 'location_on':
      return (
        <>
          <path d="M12 21s-6.5-5.8-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.2-6.5 11-6.5 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </>
      );
    case 'rotate_right':
    case 'refresh':
      return (
        <>
          <path d="M20 11a8 8 0 1 0 2 5.3" />
          <polyline points="20 4 20 11 13 11" />
        </>
      );
    case 'stars':
    case 'award_star':
      return (
        <polygon
          fill="currentColor"
          stroke="none"
          points="12 2.5 14.9 8.4 21.4 9.3 16.7 13.9 17.8 20.4 12 17.3 6.2 20.4 7.3 13.9 2.6 9.3 9.1 8.4 12 2.5"
        />
      );
    case 'chevron_right':
      return <polyline points="9 6 15 12 9 18" />;
    case 'arrow_back':
      return (
        <>
          <path d="M19 12H5" />
          <polyline points="12 19 5 12 12 5" />
        </>
      );
    case 'arrow_forward':
      return (
        <>
          <path d="M5 12h14" />
          <polyline points="12 5 19 12 12 19" />
        </>
      );
    case 'rate_review':
    case 'add_notes':
      return (
        <>
          <path d="M4 4h16v12H7.5L4 19.5V4Z" />
          <path d="M9 9h6M9 12.5h4" />
        </>
      );
    case 'map':
    case 'explore':
      return (
        <>
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6" />
          <line x1="9" y1="3" x2="9" y2="18" />
          <line x1="15" y1="6" x2="15" y2="21" />
        </>
      );
    case 'military_tech':
    case 'workspace_premium':
    case 'emoji_events':
      return (
        <>
          <circle cx="12" cy="9" r="5.5" />
          <path d="m9.5 14-1.5 7 4-2.2 4 2.2-1.5-7" />
        </>
      );
    case 'person':
      return (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
        </>
      );
    case 'shield':
      return <path d="M12 2.5 19 5.5v6c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10v-6l7-3Z" />;
    case 'bakery_dining':
      return (
        <>
          <path d="M3 15c1-4 4-6 9-6s8 2 9 6H3Z" />
          <path d="M7 9.5V15M12 9V15M17 9.5V15" />
        </>
      );
    case 'eco':
      return (
        <>
          <path d="M19.5 4.5C12 4.5 5 9 5 16.5c0 1.4.5 2.5 1.5 3 7.5 0 13-5 13-15Z" />
          <path d="M5.5 19.5 14 11" />
        </>
      );
    case 'tune':
      return (
        <>
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
          <circle cx="9" cy="6" r="2" fill="currentColor" />
          <circle cx="15" cy="12" r="2" fill="currentColor" />
          <circle cx="10" cy="18" r="2" fill="currentColor" />
        </>
      );
    case 'print':
      return (
        <>
          <path d="M7 8V4h10v4" />
          <rect x="4" y="8" width="16" height="8" rx="2" />
          <rect x="7" y="14" width="10" height="6" />
        </>
      );
    case 'lock':
      return (
        <>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </>
      );
    case 'add_a_photo':
    case 'add_photo_alternate':
      return (
        <>
          <rect x="3" y="6" width="16" height="14" rx="2" />
          <circle cx="11" cy="13" r="3.2" />
          <path d="M19 2v5M16.5 4.5h5" />
        </>
      );
    case 'close':
      return <path d="M6 6l12 12M18 6 6 18" />;
    case 'kebab_dining':
      return (
        <>
          <line x1="12" y1="2" x2="12" y2="22" />
          <rect x="7" y="5" width="10" height="3.5" rx="1.7" />
          <rect x="6" y="10.2" width="12" height="3.6" rx="1.8" />
          <rect x="7.5" y="15.5" width="9" height="3.5" rx="1.7" />
        </>
      );
    case 'schedule':
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15.5 14" />
        </>
      );
    case 'sentiment_satisfied':
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <circle cx="9" cy="10" r="1" fill="currentColor" />
          <circle cx="15" cy="10" r="1" fill="currentColor" />
          <path d="M8.5 14.5a4 4 0 0 0 7 0" />
        </>
      );
    case 'bolt':
      return (
        <polygon
          fill="currentColor"
          stroke="none"
          points="13 2 4 14 11 14 10 22 20 10 13 10 13 2"
        />
      );
    case 'redeem':
      return (
        <>
          <rect x="3" y="8" width="18" height="13" rx="2" />
          <line x1="12" y1="8" x2="12" y2="21" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <path d="M12 8c-2 0-4-1.2-4-3a2 2 0 0 1 4 0c0-1.8 2-3 4-3a2 2 0 0 1 0 6" />
        </>
      );
    case 'leaderboard':
      return (
        <>
          <rect x="3" y="11" width="5" height="9" rx="1" />
          <rect x="9.5" y="5" width="5" height="15" rx="1" />
          <rect x="16" y="14" width="5" height="6" rx="1" />
        </>
      );
    case 'restaurant':
      return (
        <>
          <path d="M7 3v8a3 3 0 0 1-3 3v7" />
          <path d="M4 3v5M10 3v5a3 3 0 0 1-3 3" />
          <path d="M16 3v18M16 3c2.5 0 4 2.5 4 6.5V14h-4" />
        </>
      );
    case 'water_drop':
      return <path d="M12 2.8S6 10 6 14.5a6 6 0 0 0 12 0C18 10 12 2.8 12 2.8Z" />;
    case 'scale':
      return (
        <>
          <path d="M12 3v18M5 21h14M4 7h16" />
          <path d="m6 7-3 6h6L6 7ZM18 7l-3 6h6l-3-6Z" />
        </>
      );
    case 'dark_mode':
    case 'nightlight':
      return <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />;
    case 'share':
      return (
        <>
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <line x1="8.3" y1="10.8" x2="15.7" y2="6.2" />
          <line x1="8.3" y1="13.2" x2="15.7" y2="17.8" />
        </>
      );
    case 'apps':
      return (
        <>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </>
      );
    case 'location_city':
      return (
        <>
          <path d="M3 21V9l6-3v15M9 21V4l6 3v14M15 21v-9l6 2v7" />
          <path d="M5.5 12h1M5.5 15.5h1M11.5 9h1M11.5 12.5h1M11.5 16h1" />
        </>
      );
    case 'Casino':
      return (
        <>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" />
          <circle cx="15.5" cy="8.5" r="1.2" fill="currentColor" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
          <circle cx="8.5" cy="15.5" r="1.2" fill="currentColor" />
          <circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" />
        </>
      );
  }
}
