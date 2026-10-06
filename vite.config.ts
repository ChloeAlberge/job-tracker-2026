import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Politique de sécurité : seuls les fichiers de l'appli elle-même sont autorisés
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

// Ajoute la CSP dans index.html, uniquement à la compilation
function cspPlugin(): Plugin {
  return {
    name: 'inject-csp',
    apply: 'build',
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: CONTENT_SECURITY_POLICY },
          injectTo: 'head-prepend',
        },
      ]
    },
  }
}

export default defineConfig({
  // Adresse de l'appli sur GitHub Pages : chloealberge.github.io/job-tracker-2026/
  base: '/job-tracker-2026/',

  plugins: [
    cspPlugin(),
    VitePWA({
      // Le service worker se met à jour tout seul quand tu publies une nouvelle version
      registerType: 'autoUpdate',

      // Enregistrement via un fichier .js séparé, pas de script inline (compatible CSP)
      injectRegister: 'script',

      includeAssets: ['icons/*.png'],

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
          { src: 'icons/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})