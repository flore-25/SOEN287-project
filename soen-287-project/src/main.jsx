import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { CoursesProvider } from './context/CoursesContext.jsx'
import './index.css'
import LandingPage from './landingPage.jsx'
import LoginPage from './loginPage.jsx'
import Dashboard from './Dashboard.jsx'
import Navbar from './vertNavPane.jsx'
import TopNavBar from './components/TopNavBar.jsx'
import CourseDetail from './pages/CourseDetail.jsx'
import { ROUTES } from './constants/index.js'
import Deadlines from './deadlines.jsx'
import Charts from './charts.jsx'
import SignupPage from './signupPage.jsx'
import MyAccount from './pages/MyAccount.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="app-root">
    <>
      <AuthProvider>
        <CoursesProvider>
        <Router>
          <Routes>
            <Route path={ROUTES.HOME} element={<LandingPage />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <div className="dashboard-route">
                  <TopNavBar />
                  <div className="app-layout">
                    <div className="app-layout__nav">
                      <Navbar />
                    </div>
                    <div className="app-layout__content">
                      <Dashboard />
                    </div>
                  </div>
                </div>
              }
            />
            <Route
              path={ROUTES.COURSE_DETAIL}
              element={
                <div className="dashboard-route">
                  <TopNavBar />
                  <div className="app-layout">
                    <div className="app-layout__nav">
                      <Navbar />
                    </div>
                    <div className="app-layout__content">
                      <CourseDetail />
                    </div>
                  </div>
                </div>
              }
            />
            <Route
              path="/deadlines"
              element={
                <div className="dashboard-route">
                  <TopNavBar />
                  <div className="app-layout">
                    <div className="app-layout__nav">
                      <Navbar />
                    </div>
                    <div className="app-layout__content">
                      <Deadlines />
                    </div>
                  </div>
                </div>
              }
            />
            <Route
              path="/charts"
              element={
                <div className="dashboard-route">
                  <TopNavBar />
                  <div className="app-layout">
                    <div className="app-layout__nav">
                      <Navbar />
                    </div>
                    <div className="app-layout__content">
                      <Charts />
                    </div>
                  </div>
                </div>
              }
            />
            <Route
              path={ROUTES.ACCOUNT}
              element={
                <div className="dashboard-route">
                  <TopNavBar />
                  <div className="app-layout">
                    <div className="app-layout__nav">
                      <Navbar />
                    </div>
                    <div className="app-layout__content">
                      <MyAccount />
                    </div>
                  </div>
                </div>
              }
            />
          </Routes>
        </Router>
        </CoursesProvider>
      </AuthProvider>
      </>
    </div>
  </StrictMode>
)