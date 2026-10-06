import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/job-tracker-2026/',

  plugins: [
    VitePWA({
      registerType: 'autoUpdate',

      // Enregistrement via un fichier .js séparé, pas de script inline (compatible CSP)
      injectRegister: 'script',

      includeAssets: ['favicon.svg'],

      manifest: {
        name: 'Job Tracker 2026',
        short_name: 'Job Tracker',
        description: 'Suivi de mes candidatures',
        lang: 'fr',
        display: 'standalone',
        background_color: '#ff2e88',
        theme_color: '#ff2e88',
        icons: [
          { src: 'icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})