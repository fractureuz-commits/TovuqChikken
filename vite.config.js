import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Tovuq',
        short_name: 'Tovuq',
        theme_color: '#b3261e',
        background_color: '#ffffff',
        display: 'standalone',
        icons: []
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    host: true,
    port: 5174,
    https: true,
    proxy: {
      "/tovuq-api": {
        target: "http://192.168.1.107",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tovuq-api/, "")
      },
      "/konsta-api": {
        target: "http://192.168.1.107",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/konsta-api/, "")
      }
    },
  },
  base: "./",
})
