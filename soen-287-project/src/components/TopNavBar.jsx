import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ROUTES, APP_NAME, NAV } from '../constants'
import { useAuth } from '../context/AuthContext'
import '../styles/navbar.css'

export default function TopNavBar() {
  const { isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout().then(() => {
      navigate(ROUTES.LOGIN);
    });
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link className="logo" to={ROUTES.HOME}>
          {APP_NAME}
        </Link>
      </div>
      <div className="navbar-right">
        {isLoggedIn ? (
          <div className="navbar-authed">
            <button type="button" className="navbar-authed__logout" onClick={handleLogout}>
              {NAV.LOG_OUT}
            </button>
            <span className="navbar-authed__sep" aria-hidden>
              {' '}
              |{' '}
            </span>
            <NavLink
              className={({ isActive }) =>
                `navbar-authed__account${isActive ? ' navbar-authed__account--active' : ''}`
              }
              to={ROUTES.ACCOUNT}
            >
              {NAV.MY_ACCOUNT}
            </NavLink>
          </div>
        ) : (
          <Link className="login-button" to={ROUTES.SIGNUP}>
            {NAV.SIGN_UP}
          </Link>
        )}
      </div>
    </nav>
  )
}
