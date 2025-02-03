import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // Importar el plugin PWA

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Registro automático de actualizaciones
      manifest: {
        name: 'Mi Aplicación PWA',
        short_name: 'MiApp',
        description: 'Una aplicación PWA creada con Vite y React',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        
        orientation: 'portrait',
        icons: [
          {
            src: '/logo1.png', // Nuevo logo agregado
            sizes: '128x128', // Cambia el tamaño si es necesario
            type: 'image/png',
          },
          {
            src: '/logo2.png', // Nuevo logo agregado
            sizes: '256x256', // Cambia el tamaño si es necesario
            type: 'image/png',
          },
          {
            src: '/logo3.png', // Nuevo logo agregado
            sizes: '384x384', // Cambia el tamaño si es necesario
            type: 'image/png',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/mi-backend-url\.com\/.*$/, // Cambia esta URL a la de tu backend
            handler: 'NetworkFirst', // Estrategia de caché: primero red, luego caché
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 día
              },
            },
          },
          {
            urlPattern: /\.(?:js|css|html|png|jpg|jpeg|svg)$/, // Cachea recursos estáticos
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 semana
              },
            },
          },
        ],
      },
    }),
  ],
});
