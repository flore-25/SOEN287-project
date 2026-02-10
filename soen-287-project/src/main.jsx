import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './landingPage.css'
import LandingPage from './landingPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LandingPage />
  </StrictMode>,
)
