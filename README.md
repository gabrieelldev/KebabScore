# 🥙 KebabScore Málaga — *"El kebab de las 3 de la mañana"*

Aplicación web **mobile-first** donde la comunidad audita y valora los **kebabs y dürüms de Málaga** capa a capa con un algoritmo propio (**KebabScore™** de `0` a `10`) y estética nocturna de asador de barrio: rótulos de neón, carta luminosa retroiluminada, tickets de papel térmico y el trompo girando detrás del cristal.

---

## 🧮 Fórmula KebabScore™ (6 subnotas ponderadas)

Cada ticket auditado puntúa **6 capas** de `0,0` a `10,0`:

| Capa | Peso | Qué se valora |
| :--- | :--- | :--- |
| **1. Carne y Tueste** (`meat`) | **30 %** | Jugosidad, marinado y corte directo del trompo |
| **2. Salsas** (`sauces`) | **20 %** | Yogur casero, picante de verdad y reparto hasta el final |
| **3. Pan / Lavash** (`bread`) | **15 %** | Tostado en plancha o tandoor y sellado sin grietas |
| **4. Tamaño / Precio** (`value`) | **15 %** | Peso en mano y honestidad por euro |
| **5. Verdura y Frescura** (`freshness`) | **10 %** | Lechuga, lombarda, tomate y cebolla con zumaque |
| **6. Horario Nocturno Golfo** (`night`) | **10 %** | Servicio a las 3:00 AM cuando todo lo demás ha cerrado |

Para ordenar el ranking de la **Carta Luminosa** sin que un local con 1 sola reseña de `10` supere a uno con 150 reseñas de `9,1`, se aplica una **media bayesiana** ($C = 5$, $m = 6{,}5$).

---

## 🛠️ Stack Tecnológico

- **Frontend & Backend:** Next.js 16 (App Router) + React 19 + TypeScript
- **Estilos:** Tailwind CSS v4 + variables de tema (`Auto` / `3 AM` / `Terraza`)
- **Tipografías autoalojadas:** `Anton` (rótulos), `DM Sans` (lectura) y `Space Mono` (tickets térmicos)
- **Base de datos, Auth y Storage:** Supabase (PostgreSQL + Row-Level Security + OAuth Google/Apple + Magic Link)
- **Mapa interactivo:** Radar Nocturno 3 AM + Callejero OpenStreetMap con Leaflet

---

## 📱 Pantallas principales

1. **Inicio (`/`)**: Rótulo de neón, Banner de Eventos Especiales en vivo, Ticket Térmico `#TKT-29001` con la fórmula oficial, buscador con filtros rápidos (`Abierto ahora`, `Cerca de mí`, barrios), **Radar de Asadores 3 AM / Mapa Callejero** y **Carta Luminosa Top 3**.
2. **Ficha de Local (`/kebab/[slug]`)**: Hero con brasas flotantes, placa colgante de precio, chapas metálicas (`HALAL`, `PAN CASERO`, `OPCIÓN FALAFEL`), **Corte Anatómico del Dürüm (6 capas)**, **Últimos Tickets Auditados** en papel térmico y generador de **Tarjeta Compartible 9:16 para Stories**.
3. **Dejar Ticket (`/kebab/[slug]/resenar`)**: Selector de plato, **los 6 Sliders de Salsa** con gota inclinada y **Previsualización en Vivo del Ticket Térmico** que se imprime mientras mueves cada barra.
4. **Carta Luminosa (`/ranking` y `/barrio/[slug]`)**: Panel retroiluminado filtrable por barrio y apertura nocturna, ordenable por `KebabScore`, `Mejor Salsa`, `Carne Crujiente` o `Gramo/€`.
5. **Misiones, Pegatinas y Ranking de la Peña (`/misiones` y `/perfil/[usuario]`)**: HUD del crítico con nivel y barra de XP, retos nocturnos, recibo `#4092` reclamable, vitrina de **Pegatinas de Escaparate** y clasificación general.
6. **Consola Privada del Creador (`/creador`)**: Backoffice protegido (acceso mediante PIN o haciendo **3 clics en la chapa `MLG`** de la cabecera) para crear/editar Eventos Especiales, Misiones, Locales, Pegatinas y Textos globales en tiempo real.

---

## 🚀 Cómo arrancar el proyecto en local

```bash
# 1. Instalar dependencias
npm install

# 2. Arrancar el servidor de desarrollo (http://localhost:3000)
npm run dev
```

> **Modo Demo incluido:** Si aún no has configurado `.env.local`, la aplicación funciona automáticamente con el catálogo de demostración de Málaga.
> Para conectar **Supabase**, copia `.env.local.example` a `.env.local`, rellena `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, y ejecuta las migraciones de `supabase/migrations/` (`0001` a `0005`) más `supabase/seed.sql`.
