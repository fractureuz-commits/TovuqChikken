import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { setupDomTranslator } from './utils/i18n'
import { initPwaUpdate } from './utils/pwaUpdate'

if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((registration) => registration.unregister()))

      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((key) => caches.delete(key)))
      }
    } catch (err) {
      console.warn('Service worker cleanup failed:', err)
    }
  })
} else if (import.meta.env.PROD) {
  initPwaUpdate()
}

const LOCKED_VIEWPORT_CONTENT = 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'

function lockViewportScale() {
  const viewport = document.querySelector('meta[name="viewport"]')

  if (viewport && viewport.getAttribute('content') !== LOCKED_VIEWPORT_CONTENT) {
    viewport.setAttribute('content', LOCKED_VIEWPORT_CONTENT)
  }
}

lockViewportScale()
window.addEventListener('pageshow', lockViewportScale)
window.addEventListener('orientationchange', lockViewportScale)
window.visualViewport?.addEventListener('resize', lockViewportScale)

const preventZoom = (event) => event.preventDefault()
const zoomKeys = ['+', '-', '=', '_', '0']

window.addEventListener('wheel', (event) => {
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault()
  }
}, { passive: false })

window.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && zoomKeys.includes(event.key)) {
    event.preventDefault()
  }
}, { capture: true })

document.addEventListener('dblclick', preventZoom, { passive: false })

document.addEventListener('touchstart', (event) => {
  if (event.touches.length > 1) {
    event.preventDefault()
  }
}, { passive: false })

document.addEventListener('touchmove', (event) => {
  if (event.touches.length > 1) {
    event.preventDefault()
  }
}, { passive: false })

for (const gestureEventName of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(gestureEventName, preventZoom, { passive: false })
}

setupDomTranslator()

createRoot(document.getElementById('root')).render(<App />)
