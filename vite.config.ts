import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Se publica en https://ezreik.github.io/mi-closet/, no en la raíz del dominio.
  base: '/mi-closet/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icono-180.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
      },
      manifest: {
        name: 'Mi Clóset — control de ventas',
        short_name: 'Mi Clóset',
        description: 'Inventario y ganancias de la ropa que compro en España y vendo en México.',
        lang: 'es',
        id: '/mi-closet/',
        start_url: '/mi-closet/',
        scope: '/mi-closet/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#000000',
        theme_color: '#FF007F',
        icons: [
          { src: 'icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icono-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icono-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
