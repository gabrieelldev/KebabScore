// =====================================================================
// Modo DÍA (terraza) / NOCHE (neón)
// ---------------------------------------------------------------------
// En automático, el neón se enciende al ATARDECER de Málaga y se apaga al
// amanecer. Usamos una tabla de 12 meses en vez de una librería: pesa
// unos pocos bytes y la precisión (±20 min) es de sobra para esto.
// El usuario puede forzar 'dia' o 'noche'; se guarda en localStorage.
// =====================================================================

export type Tema = 'dia' | 'noche';
export type Modo = 'auto' | Tema;

export const CLAVE_MODO = 'kebabscore-modo';

/**
 * [amanecer, atardecer] en minutos desde las 00:00, hora oficial de Málaga
 * (ya incluye el horario de verano). Valores aproximados a mitad de mes.
 */
export const TABLA_SOL: ReadonlyArray<readonly [number, number]> = [
  [8 * 60 + 30, 18 * 60 + 20], // enero
  [8 * 60 + 10, 18 * 60 + 55], // febrero
  [7 * 60 + 40, 19 * 60 + 25], // marzo
  [7 * 60 + 50, 20 * 60 + 50], // abril (ya en horario de verano)
  [7 * 60 + 15, 21 * 60 + 15], // mayo
  [7 * 60 + 0, 21 * 60 + 40], // junio
  [7 * 60 + 15, 21 * 60 + 35], // julio
  [7 * 60 + 40, 21 * 60 + 5], // agosto
  [8 * 60 + 5, 20 * 60 + 20], // septiembre
  [8 * 60 + 30, 19 * 60 + 35], // octubre
  [7 * 60 + 55, 18 * 60 + 15], // noviembre (horario de invierno)
  [8 * 60 + 20, 18 * 60 + 5], // diciembre
];

const formateador = new Intl.DateTimeFormat('es-ES', {
  timeZone: 'Europe/Madrid',
  month: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hourCycle: 'h23',
});

/** ¿Qué tema toca ahora mismo en Málaga? */
export function temaAutomatico(fecha: Date = new Date()): Tema {
  const partes = formateador.formatToParts(fecha);
  const valor = (tipo: string) => Number(partes.find((p) => p.type === tipo)?.value);
  const minutos = valor('hour') * 60 + valor('minute');
  const [amanecer, atardecer] = TABLA_SOL[valor('month') - 1];
  return minutos >= amanecer && minutos < atardecer ? 'dia' : 'noche';
}

/**
 * Script que va en el <head> y se ejecuta ANTES de pintar la página.
 * Sin él, veríamos un "parpadeo": primero el tema por defecto y luego el bueno.
 * Es JavaScript "a la antigua" (var, function) porque se inyecta como texto
 * tal cual, sin pasar por el compilador. Hace lo mismo que temaAutomatico().
 */
export const SCRIPT_TEMA_INICIAL = `(function(){try{
var m=localStorage.getItem(${JSON.stringify(CLAVE_MODO)});
var t=(m==="dia"||m==="noche")?m:null;
if(!t){
var s=${JSON.stringify(TABLA_SOL)};
var p=new Intl.DateTimeFormat("es-ES",{timeZone:"Europe/Madrid",month:"numeric",hour:"numeric",minute:"numeric",hourCycle:"h23"}).formatToParts(new Date());
var g=function(k){for(var i=0;i<p.length;i++){if(p[i].type===k)return +p[i].value}return 0};
var min=g("hour")*60+g("minute");var r=s[g("month")-1];
t=(min>=r[0]&&min<r[1])?"dia":"noche";
}
var h=document.documentElement;h.setAttribute("data-tema",t);h.setAttribute("data-modo",m||"auto");
}catch(e){}})();`;
