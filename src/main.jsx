import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

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

createRoot(document.getElementById('root')).render(<App />)