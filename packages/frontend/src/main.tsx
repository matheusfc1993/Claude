import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import indexeddb from './services/indexeddb'

// Initialize PWA support
async function initPWA() {
  // Initialize IndexedDB
  try {
    await indexeddb.init()
    console.log('✓ IndexedDB initialized')
  } catch (error) {
    console.error('✗ Failed to initialize IndexedDB:', error)
  }

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      })
      console.log('✓ Service Worker registered:', registration.scope)

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        console.log('✓ Service Worker update available')
      })
    } catch (error) {
      console.warn('⚠ Service Worker registration failed:', error)
    }
  }
}

// Initialize PWA
initPWA()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
