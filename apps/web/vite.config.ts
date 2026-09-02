import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Las imágenes siguen viviendo en el `assets/` de la raíz del repositorio: se
 * sirven tal cual, sin duplicarlas ni tocar la app actual. Quedan expuestas en
 * la raíz del sitio (`/SHlarge.svg`).
 */
const assetsDir = fileURLToPath(new URL('../../assets', import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['SHlogo.svg'],
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
            src: '/SHlogo.svg',
            type: 'image/svg+xml',
            sizes: 'any',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Precaché sólo del shell y las fuentes. Las imágenes de `assets/`
        // pesan ~7 MB sin optimizar; entran al caché bajo demanda, no de golpe.
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
