import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'
import LandingPage from './landingPage.jsx'
import LoginPage from './loginPage.jsx'
import Dashboard from './Dashboard.jsx'
import { ROUTES } from './constants/index.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="app-root">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path={ROUTES.HOME} element={<LandingPage />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route
            path={ROUTES.DASHBOARD}
            element={
              <div className="route-layout route-layout--dashboard">
                <Dashboard />
              </div>
            }
          />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  </StrictMode>
)