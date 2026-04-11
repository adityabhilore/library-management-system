import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/theme.css'   // 1️⃣ Global CSS variables — MUST be first
import './index.css'           // 2️⃣ Reset defaults
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
