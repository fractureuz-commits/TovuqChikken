import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { VitePWA } from 'vite-plugin-pwa'
import http from 'node:http'
import https from 'node:https'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const pkg = JSON.parse(readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8'))

const RUNTIME_API_PREFIX = '/runtime-api/'

const runtimeApiProxy = () => ({
  name: 'runtime-api-proxy',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (!req.url?.startsWith(RUNTIME_API_PREFIX)) {
        next()
        return
      }

      const rawTargetAndPath = req.url.slice(RUNTIME_API_PREFIX.length)
      const separatorIndex = rawTargetAndPath.indexOf('/')

      if (separatorIndex < 0) {
        res.statusCode = 400
        res.end('Runtime API proxy target missing')
        return
      }

      let targetBase
      try {
        targetBase = decodeURIComponent(rawTargetAndPath.slice(0, separatorIndex))
      } catch {
        res.statusCode = 400
        res.end('Runtime API proxy target is invalid')
        return
      }

      let targetUrl
      try {
        const targetPath = rawTargetAndPath.slice(separatorIndex)
        targetUrl = new URL(targetPath, targetBase)
      } catch {
        res.statusCode = 400
        res.end('Runtime API proxy URL is invalid')
        return
      }

      const transport = targetUrl.protocol === 'https:' ? https : http
      const proxyReq = transport.request({
        protocol: targetUrl.protocol,
        hostname: targetUrl.hostname,
        port: targetUrl.port,
        method: req.method,
        path: `${targetUrl.pathname}${targetUrl.search}`,
        headers: {
          ...req.headers,
          host: targetUrl.host,
          origin: `${targetUrl.protocol}//${targetUrl.host}`,
        },
      }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers)
        proxyRes.pipe(res)
      })

      proxyReq.on('error', (err) => {
        res.statusCode = 502
        res.end(`Runtime API proxy failed: ${err.message}`)
      })

      req.pipe(proxyReq)
    })
  },
})

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    basicSsl(),
    runtimeApiProxy(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'MSI',
        short_name: 'MSI',
        description: 'MSI savdo va ombor ilovasi',
        theme_color: '#006CAC',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  server: {
    host: true,
    port: 5174,
    https: true,
    proxy: {
      "/tovuq-api": {
        target: "http://93.170.220.162:80",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tovuq-api/, "")
      },
      "/konsta-api": {
        target: "http://93.170.220.162:80",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/konsta-api/, "")
      }
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
  base: "./",
})
