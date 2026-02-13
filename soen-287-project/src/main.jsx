import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter as Router,
  Route,
  Link,
  Routes
} from "react-router-dom";
import './index.css'
import LandingPage from './landingPage.jsx'
import LoginPage from './loginPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" Component={LandingPage}/>
        <Route path="/login" Component={LoginPage}/>
      </Routes>
    </Router>
  </StrictMode>
)