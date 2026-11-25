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
      includeAssets: [
        'favicon.ico',
        'favicon.png',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'favicon-48x48.png',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-maskable-512x512.png',
        'icon-192.png',
        'icon-512.png',
        'icon-maskable-512.png',
        'studenthub-icon.webp',
        'studenthub-icon.png',
        'studenthub-logo.webp',
        'studenthub-logo-dark.webp',
        'studenthub-logo-vertical.webp',
        'studenthub-logo-vertical-dark.webp',
      ],
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
         * Chrome y Android ofrecen "Instalar aplicación" con íconos de
         * 192x192 y 512x512 estándar, más el maskable con 20% de margen.
         */
        icons: [
          { src: '/pwa-192x192.png', type: 'image/png', sizes: '192x192' },
          { src: '/pwa-512x512.png', type: 'image/png', sizes: '512x512' },
          {
            src: '/pwa-maskable-512x512.png',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'maskable',
          },
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
        // Precaché completo del App Shell: HTML, chunks JS/CSS diferidos, fuentes locales, logos e íconos.
        globPatterns: ['**/*.{js,css,html,woff2,woff,svg,png,webp,ico}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // Privacidad Ley N° 8968: nunca almacenar Auth ni registros privados de Supabase en Service Worker.
            urlPattern: ({ url }) => url.hostname.endsWith('.supabase.co'),
            handler: 'NetworkOnly',
          },
          {
            // APIs de Google Apps Script (Comedor y Horarios públicos): respuesta instantánea en caché
            // y revalidación automática en segundo plano al recuperar conexión.
            urlPattern: ({ url }) =>
              url.hostname === 'script.google.com' ||
              url.hostname === 'script.googleusercontent.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'studenthub-apps-script',
              expiration: { maxEntries: 48, maxAgeSeconds: 60 * 60 * 24 * 14 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Imágenes y fuentes estáticas locales o remotas
            urlPattern: ({ request }) =>
              request.destination === 'image' || request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'studenthub-media-fonts',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-motion': ['motion'],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    testTimeout: 15000,
  },
})
