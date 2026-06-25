import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { setupDomTranslator } from './utils/i18n'

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
}

/* =========================
   DESKTOP ZOOM BLOCK
========================= */

// Ctrl + Scroll
window.addEventListener('wheel', function (e) {
  if (e.ctrlKey) {
    e.preventDefault()
  }
}, { passive: false })

// Ctrl + / -
window.addEventListener('keydown', function (e) {
  if (
    (e.ctrlKey && ['+', '-', '=', '_'].includes(e.key)) ||
    e.key === 'F11'
  ) {
    e.preventDefault()
  }
})


/* =========================
   MOBILE PINCH BLOCK
========================= */

let lastTouchEnd = 0

// // Double tap zoom block
// document.addEventListener('touchend', function (e) {
//   const now = new Date().getTime()
//   if (now - lastTouchEnd <= 300) {
//     e.preventDefault()
//   }
//   lastTouchEnd = now
// }, false)

// Pinch zoom block
document.addEventListener('touchmove', function (e) {
  if (e.touches.length > 1) {
    e.preventDefault()
  }
}, { passive: false })

// iOS gesture block
document.addEventListener('gesturestart', function (e) {
  e.preventDefault()
})

setupDomTranslator()

createRoot(document.getElementById('root')).render(<App />)
