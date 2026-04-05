import { NavLink, useLocation } from 'react-router-dom'
import './vertNavPane.css'
import { ROUTES } from './constants'

function Navbar() {
  const location = useLocation()

  if (
    location.pathname === '/' ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/signup')
  ) {
    return null
  }

  const linkClass = ({ isActive }) =>
    `nav-button dashboard-link icon icon-dashboard${isActive ? ' nav-button--active' : ''}`

  return (
    <>
      <nav className="vertical-navbar">
        <NavLink className={linkClass} to={ROUTES.DASHBOARD}>
          Dashboard
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `nav-button deadlines-link icon icon-calendar${isActive ? ' nav-button--active' : ''}`
          }
          to={ROUTES.DEADLINES}
        >
          Upcoming Deadlines
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `nav-button progress-link icon icon-progress${isActive ? ' nav-button--active' : ''}`
          }
          to={ROUTES.CHARTS}
        >
          My Progress
        </NavLink>
        <div className="spacing-line" />
        <NavLink
          className={({ isActive }) =>
            `nav-button account-link icon icon-user${isActive ? ' nav-button--active' : ''}`
          }
          to={ROUTES.ACCOUNT}
        >
          My Account
        </NavLink>
      </nav>
      <div className="nav-background" />
    </>
  )
}

export default Navbar
