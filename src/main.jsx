import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from './lib/notifications.js'

console.log('🚀 Power Solar CRM: main.jsx loaded');

// Register Service Worker for PWA + push notifications
registerSW().catch(err => console.error('SW Error in main:', err));

console.log('🚀 Power Solar CRM: Attempting render');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
