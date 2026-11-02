# 📱 Guía para convertir KebabScore en App Instalable (PWA) y App Móvil Nativa (Android / iOS)

Tu proyecto **KebabScore Málaga** ya está preparado en tres niveles para funcionar como aplicación:

1. **Nivel 1 · PWA (Progressive Web App)**: Ya configurada y activa. Se instala directamente desde el navegador del móvil o PC sin pasar por tiendas.
2. **Nivel 2 · Despliegue en la Nube con Vercel**: Conectado a tu repositorio `https://github.com/gabrieelldev/KebabStore`.
3. **Nivel 3 · App Nativa Android (`.apk` / Google Play) e iOS (App Store) con Capacitor**: Lista con [`capacitor.config.json`](file:///C:/Users/gabri/.gemini/antigravity/scratch/kebabscore/capacitor.config.json) y exportación estática (`out/`).

---

## 1️⃣ Instalarla hoy mismo como Aplicación (PWA)

Gracias a [`src/app/manifest.ts`](file:///C:/Users/gabri/.gemini/antigravity/scratch/kebabscore/src/app/manifest.ts), al icono [`src/app/icon.svg`](file:///C:/Users/gabri/.gemini/antigravity/scratch/kebabscore/src/app/icon.svg) y al Service Worker [`public/sw.js`](file:///C:/Users/gabri/.gemini/antigravity/scratch/kebabscore/public/sw.js):

- **En Android (Chrome)**:
  Al abrir la web te aparecerá automáticamente la barra verde **"Instalar App KebabScore"** en la parte superior (o desde el menú `⋮` → **Instalar aplicación**). Se creará el icono del trompo 3 AM en tu cajón de aplicaciones y se abrirá a pantalla completa sin barra de navegador.
- **En iPhone / iPad (Safari)**:
  Pulsa el botón **Compartir** (cuadrado con flecha hacia arriba) → **Añadir a pantalla de inicio**.
- **En Windows / Mac (Chrome o Edge)**:
  Haz clic en el icono de pantalla con flecha en la parte derecha de la barra de direcciones (`Instalar KebabScore Málaga`).

---

## 2️⃣ Publicarla gratis en Internet con Vercel (1 minuto)

1. Entra en **https://vercel.com** e inicia sesión con tu cuenta de **GitHub** (`gabrieelldev`).
2. Haz clic en **Add New... → Project** y selecciona tu repositorio **`KebabStore`**.
3. Pulsa **Deploy** (si ya tienes tu proyecto de Supabase, añade en *Environment Variables* `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `NEXT_PUBLIC_CREATOR_PIN`).
4. Vercel te dará una URL con `https://...vercel.app` que podrás abrir desde cualquier móvil para instalar la PWA al instante. Each vez que hagas `git push`, Vercel actualizará la app sola.

---

## 3️⃣ Convertirla en App Móvil Nativa (`.apk` para Android o `.ipa` para iOS) con Capacitor

¿Qué es **Capacitor**? Es el puente oficial que envuelve tu proyecto de Next.js dentro de un contenedor nativo de Android Studio / Xcode, permitiéndote generar un archivo `.apk` instalable o subirla a Google Play Store y App Store usando **el mismo código** que ya tienes.

### Paso A: Instalar los paquetes de Capacitor (solo la primera vez)

Abre la terminal en la carpeta del proyecto y ejecuta:

```powershell
npm install @capacitor/core
npm install -D @capacitor/cli @capacitor/android @capacitor/ios
```

### Paso B: Generar la carpeta estática `out/` para el móvil

En PowerShell, exporta todas las rutas de Next.js en modo móvil:

```powershell
$env:NEXT_OUTPUT_EXPORT="true"; npm run build
```

*(Esto creará la carpeta `out/` con todas las pantallas de KebabScore listas para empaquetarse dentro del teléfono).*

### Paso C: Crear y abrir el proyecto nativo de Android

```powershell
# 1. Crear la carpeta nativa de Android (solo la primera vez)
npx cap add android

# 2. Copiar la carpeta out/ dentro del proyecto Android
npm run cap:sync

# 3. Abrir en Android Studio para probar en emulador o generar el .apk
npm run cap:android
```

Dentro de **Android Studio**, solo tienes que ir al menú **Build → Build Bundle(s) / APK(s) → Build APK(s)** y tendrás tu archivo `app-debug.apk` o `app-release.apk` listo para instalar en cualquier móvil Android.
