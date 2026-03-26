import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from './lib/notifications.js'

// Register Service Worker for PWA + push notifications
registerSW().catch(err => console.error('SW Error in main:', err));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
