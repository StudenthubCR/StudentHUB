import { rm } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Las imágenes siguen viviendo en el `assets/` de la raíz del repositorio: se
 * sirven tal cual, sin duplicarlas ni tocar la app actual. Quedan expuestas en
 * la raíz del sitio (`/SHlarge.webp`).
 */
const assetsDir = fileURLToPath(new URL('../../assets', import.meta.url))

/**
 * Nota sobre el enrutado del SPA: aquí hubo un archivo `_redirects` con la
 * regla `/* -> /index.html 200`, que es como se resuelve en Cloudflare Pages.
 * En Workers con assets estáticos esa regla es inválida y el despliegue la
 * rechaza: Workers ya quita `.html` y `/index` por su cuenta, así que
 * `/index.html` se reescribe a `/`, vuelve a caer en `/*` y detecta el bucle.
 *
 * Lo que corresponde ahí es `not_found_handling: "single-page-application"`,
 * que está en wrangler.jsonc y hace exactamente lo mismo de forma nativa.
 */

/**
 * Saca del build los originales que sólo usa la app de la raíz.
 *
 * `publicDir` apunta a la carpeta `assets/` compartida y Vite la copia entera,
 * así que el despliegue se llevaba también los PNG de 700 KB y los SVG de
 * 1.1 MB que la app nueva ya no referencia: unos 7 MB de subida por despliegue
 * que nadie descarga nunca. Se quedan en el repositorio; sólo no viajan aquí.
 */
function sinOriginalesDeLaAppVieja(): Plugin {
  const soloParaLaAppVieja = [
    'SHOG.svg',
    'SHlarge.svg',
    'SHlogo.svg',
    'Paleta de colores.png',
    'student.png',
    'news_dia_estudiante.png',
    'news_expotecnica.png',
    'news_feria_cientifica.png',
    'news_feria_vocacional.png',
    'news_torneo_futsal.png',
  ]

  return {
    name: 'studenthub-sin-originales',
    apply: 'build',
    async closeBundle() {
      for (const archivo of soloParaLaAppVieja) {
        await rm(fileURLToPath(new URL(`./dist/${archivo}`, import.meta.url)), { force: true })
      }
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['SHlogo.png'],
      manifest: {
        name: 'Student HUB',
        short_name: 'Student HUB',
        description: 'Tu Portal Educativo y Carnet Digital Premium',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#060b1e',
        theme_color: '#0130B2',
        icons: [
          {
            src: '/SHlogo.png',
            type: 'image/png',
            sizes: '512x302',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Precaché del shell y las fuentes. Los afiches de noticias entran al
        // caché bajo demanda: son 90 KB cada uno y sólo se ve uno a la vez.
        globPatterns: ['**/*.{js,css,html,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'studenthub-imagenes',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Menús del comedor (Apps Script). `StaleWhileRevalidate` como
            // indica el plan §3.5: la última respuesta buena se muestra de
            // inmediato — también sin red — y se refresca por detrás. Apps
            // Script redirige a script.googleusercontent.com, así que hay que
            // contemplar los dos dominios.
            urlPattern: ({ url }) =>
              url.hostname === 'script.google.com' ||
              url.hostname === 'script.googleusercontent.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'studenthub-comedor',
              expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 14 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
    sinOriginalesDeLaAppVieja(),
  ],
  publicDir: assetsDir,
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
