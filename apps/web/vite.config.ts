import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Las imágenes viven en `assets/` de la raíz del repositorio: se
 * sirven tal cual en la raíz del sitio (ej. `/SHlarge.webp`).
 */
const assetsDir = fileURLToPath(new URL('../../assets', import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'icon-maskable-512.png'],
      manifest: {
        id: '/',
        name: 'Student HUB',
        short_name: 'Student HUB',
        description: 'Tu Portal Educativo y Carnet Digital Premium',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#060b1e',
        theme_color: '#0130B2',
        /**
         * Chrome sólo ofrece "Instalar aplicación" con al menos un ícono de
         * 192x192 y uno de 512x512, cuadrados y con el tamaño declarado igual
         * al real. Si no, ofrece "Agregar acceso directo", que es un marcador
         * y no la app instalada.
         *
         * El `maskable` va aparte y no combinado en un mismo `purpose`: el
         * lanzador de Android recorta ese ícono con su propia forma, así que
         * necesita más margen que el que se ve entero.
         */
        icons: [
          { src: '/icon-192.png', type: 'image/png', sizes: '192x192' },
          { src: '/icon-512.png', type: 'image/png', sizes: '512x512' },
          {
            src: '/icon-maskable-512.png',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'maskable',
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
