import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom' // Usamos HashRouter para que GitHub Pages no falle
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter> 
      <App />
    </HashRouter>
  </StrictMode>,
)