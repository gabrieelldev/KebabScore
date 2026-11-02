# KebabScore Málaga · Contexto de Diseño y Producto (para Google Stitch)

## 1. Qué es KebabScore
Web mobile-first donde los usuarios valoran **kebabs** (no el local en general) en **Málaga** con una nota de `0,0` a `10,0` llamada **KebabScore**, calculada a partir de **6 subnotas votadas por el usuario**:
1. **Carne** (30 %)
2. **Salsas** (20 %)
3. **Pan** (15 %)
4. **Tamaño / precio** (15 %)
5. **Verdura / frescura** (10 %)
6. **Horario nocturno** (10 %)

**Regla de oro:** los locales nunca pueden modificar su nota (se calcula automáticamente a partir de las reseñas).

---

## 2. Dirección de arte: «El kebab de las 3 de la mañana»
Estética de kebab de barrio por la noche: letreros de neón, cartas luminosas retroiluminadas encima del mostrador con fotos numeradas (`PLATO #01`, `PLATO #02`...), tickets de papel térmico de caja registradora con borde dentado y el trompo girando detrás del cristal. Cálido, nocturno, con humor, pero cuidado y 100 % legible (WCAG AA).

**Prohibido:** degradados morados/azules tipo SaaS, tarjetas blancas idénticas, fotos de stock genéricas o emojis como decoración.

### Paleta de colores (tokens CSS actuales)

#### Modo Noche (`3 AM` · por defecto y al atardecer de Málaga)
| Token | Hex | Uso |
|---|---|---|
| `--carbon-900` (`--fondo`) | `#1A1411` | Fondo principal: negro carbón cálido (no `#000`) |
| `--carbon-800` (`--superficie`) | `#251D18` | Tarjetas, paneles, barra inferior |
| `--carbon-700` (`--superficie-alta`) | `#352922` | Chips y estados secundarios |
| `--borde` | `#3E3027` | Líneas divisorias cálidas |
| `--crema-100` (`--texto`) | `#F7EEDB` | Texto principal (color salsa de yogur) |
| `--crema-300` (`--texto-suave`) | `#C9B9A0` | Texto secundario |
| `--brasa-500` (`--primario` / `--acento`) | `#FF7A1F` | Naranja brasa del asador; botones primarios con texto `#1A1411` |
| `--guindilla-500` (`--guindilla`) | `#FF4A3D` | Notas sobresalientes (`≥ 8,5 · Fuego`) y foco/alertas |
| `--lechuga-400` (`--lechuga`) | `#7ED957` | Piloto «Abierto ahora» y verificados |
| `--mostaza-400` (`--mostaza`) | `#F2C14E` | Notas medias (`5,0 – 6,9 · Suave`) |

#### Modo Día (`Terraza`)
- Fondo `#F7EEDB`, superficie `#FFF8EB`, borde `#D8C6A8`, texto `#1A1411`, texto suave `#5A4A3E`, acento `#A9430A`, guindilla `#B8231B`, lechuga `#276B12`, mostaza `#7A5E00` (el brillo de neón se apaga).

#### Ticket de papel térmico (igual en día y noche)
- Papel `--ticket-papel`: `#FBF6EA`
- Tinta `--ticket-tinta`: `#2B2420`
- Tinta secundaria `--ticket-suave`: `#6B5E54`
- Borde superior dentado en dientes de sierra de `10px`.

### Tipografías
- **Rótulos y encabezados (`--font-rotulo`)**: **Anton** (condensada, gruesa, mayúsculas, `letter-spacing: 0.04em`). Efecto neón sutil (`text-shadow` naranja/rojo) **solo** en el logo y como máximo en un `H1` por pantalla.
- **Cuerpo e interfaz (`--font-sans`)**: **DM Sans** (cálida, redondeada, mínimo `16px` en inputs).
- **Precios, notas, fechas y tickets (`--font-ticket`)**: **Space Mono** (`tabular-nums`, estilo caja registradora).

### Escala de «Picante» (nunca usar solo color; siempre número + etiqueta)
- `8,5 – 10,0` → **Fuego** (`#FF4A3D`)
- `7,0 – 8,4` → **Picante** (`#FF7A1F`)
- `5,0 – 6,9` → **Suave** (`#F2C14E`)
- `0,0 – 4,9` → **Sosa** (`#352922`)
- `< 3 reseñas` → etiqueta `· provisional`

---

## 3. Qué tenemos ya construido (Pasos 1 y 2)

### Stack técnico
- **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4**
- **Supabase** (PostgreSQL + RLS + triggers antifraude + Storage + Auth con Email, Google y Apple)
- **Leaflet + OpenStreetMap** para el mapa interactivo

### Pantalla 1 · Inicio (`/`) — YA IMPLEMENTADA
Estructura actual de arriba abajo:
1. **Cabecera fija (`Cabecera`)**:
   - Logo `KEBABSCORE` en Anton con efecto neón + chapa `MÁLAGA` en Space Mono.
   - Enlaces en escritorio (`Mapa y buscador`, `Carta luminosa (Top)`, `Entrar`).
   - Selector de ambiente (`Auto` / `3 AM` / `Terraza`).
2. **Hero nocturno + Recibo de fórmula**:
   - Subtítulo monoespaciado: *«Málaga · Abierto hasta que cierre el último asador»*.
   - `H1` en neón: *«Kebabs de Málaga, puntuados capa a capa.»*
   - A la derecha: mini **ticket térmico** con el desglose de pesos de las 6 subnotas (`Carne 30%`, `Salsas 20%`, `Pan 15%`, `Tamaño/precio 15%`, `Verdura/frescura 10%`, `Horario nocturno 10%`).
3. **Bloque Explorador (`ExploradorInicio`)**:
   - Buscador grande con label en Anton *«¿Dónde cenas esta noche?»* y placeholder *«Barrio, calle o nombre del local»*.
   - Botón **«Abierto ahora»** con piloto verde brillante `#7ED957` y contador en vivo + botón **«Cerca de mí»** (geolocalización).
   - Tira horizontal deslizable de pastillas de barrios (`Toda Málaga`, `Centro Histórico`, `El Perchel`, `La Trinidad`, `Soho`, `Lagunillas`, `El Palo`, `Pedregalejo`, `Huelin`, `Teatinos`, `Cruz de Humilladero`, `Ciudad Jardín`).
   - Layout 2 columnas (7/12 + 5/12 en desktop; apilado en móvil):
     - **Izquierda**: Mapa Leaflet con **pines con forma de mini dürüm en SVG** y banderola con la nota coloreada por nivel de picante.
     - **Derecha**: Lista de tarjetas de locales con ilustración SVG de dürüm en corte (cuando no hay foto), nombre en Anton, dirección, badge `NotaPicante`, estado `Abierto · Cierra a las 04:00`, etiquetas (`Halal`, `Opción veg`, `Domicilio`) y precio del dürüm (`6,50 €`).
4. **Carta Luminosa · Top 3 de Málaga (`PodioCarta`)**:
   - Contenedor `.panel-luminoso` que imita el cartel retroiluminado sobre el mostrador.
   - 3 tarjetas numeradas como platos (`PLATO #01`, `PLATO #02`, `PLATO #03`), etiqueta `DÜRÜM 6,50 €` en color papel térmico, ilustración/foto del kebab, nota con nivel de picante y contador de tickets.
5. **Rejilla de Barrios (SEO)** + **Barra fija del pulgar en móvil (`BarraPulgar`)** con 3 botones de `48px` de alto (`Mapa`, CTA naranja `Valorar kebab`, `Top Málaga`).

---

## 4. Pantallas que faltan por diseñar en Stitch (en este orden)

### Pantalla 2 · Ficha de local (`/kebab/[slug]`)
- Cabecera del local: foto grande (o ilustración de dürüm de mostrador si aún no tiene foto), nombre en rótulo Anton, barrio, dirección, piloto «Abierto ahora / Cierra a las 03:00», etiquetas tipo cartelito colgado (`Halal`, `Vegetariano`, `A domicilio`) y **precio del dürüm en estilo ticket** (`DÜRÜM: 6,50 €`).
- **KebabScore en capas (`CapasKebab`)**: visualización protagonista donde las **6 subnotas** (Carne, Salsas, Pan, Tamaño/precio, Verdura/frescura, Horario nocturno) se ven como **capas apiladas de un dürüm visto en corte**, cada capa más o menos rellena según su nota de 0 a 10, junto con la nota global grande.
- **Lista de reseñas como tickets de caja (`Ticket`)**: tarjetas con aspecto de papel térmico `#FBF6EA`, borde dentado arriba, tipografía `Space Mono`, fecha/hora, desglose de las 6 subnotas en líneas punteadas (`CARNE ........ 9/10`), comentario del usuario, fotos adjuntas, `TOTAL: 8,7` en grande, ligera inclinación fija (`±1,2°`) y botón para compartir como story 9:16.
- CTA fijo al alcance del pulgar en móvil: **«Dejar mi ticket (Valorar)»**.

### Pantalla 3 · Formulario de reseña (`/kebab/[slug]/resenar`) + Login (`/entrar`)
- **6 Sliders de salsa (`SliderSalsa`)**: uno por subnota (0 a 10). Al arrastrar, la barra se rellena como un chorro de salsa (roja picante, blanca de yogur, naranja brasa…) con una pequeña gota en el extremo al soltar.
- Campo de comentario (20–1000 caracteres) con contador y subida de hasta 3 fotos.
- **Vista previa en vivo del ticket térmico**: mientras el usuario mueve los sliders, ve su ticket actualizándose con el `TOTAL` calculado en tiempo real.
- Pantalla `/entrar`: tarjeta estilo caja nocturna con **enlace mágico por email**, **Continuar con Google** y **Continuar con Apple**.

### Pantalla 4 · Ranking «Top kebabs de Málaga» (`/ranking` y `/barrio/[slug]`)
- **Carta luminosa a pantalla completa**: panel retroiluminado de mostrador con todos los locales numerados (`PLATO #01`, `#02`, `#03`…), filtrable por **barrio** y por **«Abierto ahora»**.

### Pantalla 5 · Perfil de usuario (`/perfil/[usuario]`)
- Cabecera del crítico nocturno + estadísticas (`tickets emitidos`, `barrios conquistados`).
- **Insignias como pegatinas troqueladas de escaparate (`Pegatina`)**: con borde blanco grueso y ligera rotación:
  - *«Primer Mordisco»* (1.ª reseña)
  - *«Cliente de las 3 AM»* (10 reseñas)
  - *«Rey del Barrio»* (5 barrios distintos de Málaga)
- Histórico de sus reseñas en formato ticket térmico.

### Pantalla 6 · Tarjeta compartible 9:16 para Instagram Stories (`/resena/[id]/tarjeta`)
- Formato vertical `1080 × 1920` (9:16) listo para descargar o compartir: fondo carbón con halo neón, foto del kebab arriba, ticket térmico en el centro con las 6 subnotas y el `TOTAL`, nombre del local y sello `KEBABSCORE MÁLAGA`.

---

## 5. Prompts listos para copiar y pegar en Google Stitch

### Prompt A · Para rediseñar o iterar la Pantalla de Inicio (`/`)
> Design a mobile-first dark web app home screen for **"KebabScore Málaga"**, a kebab review platform with a **"3 AM neighborhood kebab shop"** aesthetic. Warm charcoal background (`#1A1411`), dark surface panels (`#251D18`), warm border (`#3E3027`), yogurt-cream text (`#F7EEDB`), spit-roast orange primary accent (`#FF7A1F` with `#1A1411` text), chili-red high-score badges (`#FF4A3D`), and lettuce-green "Open now" indicator (`#7ED957`). Typography: condensed bold uppercase display headers (**Anton**) with a subtle orange neon glow on the logo and H1 only, clean body text (**DM Sans**), and cash-register monospace (**Space Mono**) for prices and scores.
> Include: (1) Sticky top bar with neon `KEBABSCORE` logo + `MÁLAGA` tag and a `Auto / 3 AM / Terraza` theme pill switcher; (2) Hero headline *"Kebabs de Málaga, puntuados capa a capa"* next to a serrated thermal-paper receipt (`#FBF6EA` background, `#2B2420` ink) showing the 6 sub-score weights; (3) Large search bar *"¿Dónde cenas esta noche?"*, glowing green *"Abierto ahora"* filter button, horizontal neighborhood chips (*Centro, El Perchel, El Palo, Teatinos, Huelin...*), an interactive dark map with custom mini-dürüm pins showing numeric scores, and a matching venue list; (4) A backlit counter menu board (*"Carta Luminosa"*) showcasing the **Top 3 Kebabs de Málaga** as numbered menu plates (`PLATO #01`, `PLATO #02`, `PLATO #03`) with price tags (`DÜRÜM 6,50 €`) and spice-level score badges (`8,9 · Fuego`); (5) Fixed bottom thumb-zone navigation bar on mobile. No purple gradients, no stock photos, no emojis.

### Prompt B · Para diseñar la Ficha de Local (`/kebab/[slug]`)
> Design a mobile-first venue detail screen for **"KebabScore Málaga"** following the **"3 AM kebab shop"** aesthetic (`#1A1411` warm charcoal background, `#251D18` surfaces, `#F7EEDB` cream text, `#FF7A1F` orange primary, `#FF4A3D` chili red, `#7ED957` lettuce green, **Anton** condensed headers, **DM Sans** body, **Space Mono** numbers).
> Include: (1) Venue header with illustrated or real kebab hero frame, uppercase Anton title *"EL TROMPO DE ORO"*, neighborhood & address, glowing green *"Abierto · Cierra a las 04:00"* badge, hanging price tag *"DÜRÜM 6,50 €"*, and tags (*Halal, A domicilio*); (2) **Layered Dürüm Breakdown ("KebabScore en Capas")**: a custom cross-section visual of a wrapped dürüm divided into 6 stacked layers (*Carne 30%, Salsas 20%, Pan 15%, Tamaño/precio 15%, Verdura/frescura 10%, Horario nocturno 10%*), each filled proportionally to its average score (0–10), paired with the overall `8,9 · FUEGO` badge; (3) **Thermal Receipt Reviews**: user reviews styled as serrated `#FBF6EA` paper receipts with monospace dotted lines for the 6 sub-scores, review comment, attached food photo, bold `TOTAL: 8,9`, and a subtle `1deg` tilt; (4) Sticky bottom thumb CTA button *"Dejar mi ticket (Valorar)"*.

### Prompt C · Para diseñar el Formulario de Reseña (`/kebab/[slug]/resenar`)
> Design a mobile-first review creation screen for **"KebabScore Málaga"** in the **"3 AM kebab shop"** style (`#1A1411` charcoal, `#251D18` panels, `#F7EEDB` cream, `#FF7A1F` spit-orange, `#FF4A3D` chili-red, **Anton** + **DM Sans** + **Space Mono**).
> Include: (1) Header with venue name and back button; (2) **6 Sauce-Squeeze Sliders (0–10)** for *Carne, Salsas, Pan, Tamaño/precio, Verdura/frescura, Horario nocturno*, where each slider track fills like a stream of kebab sauce (yogurt white, chili red, brasa orange) with a small sauce drop on the thumb; (3) Comment textarea (20–1000 chars) and photo upload slots (max 3 photos); (4) **Live Thermal Receipt Preview** (`#FBF6EA` paper with serrated top edge and Space Mono font) that updates the itemized lines and `TOTAL: 8,7` in real time as sliders move; (5) Primary orange submit button in the mobile thumb zone *"Imprimir ticket (Publicar reseña)"*.
