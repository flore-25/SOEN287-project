import { Link, useNavigate } from 'react-router-dom'
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
          <button type="button" className="nav-logout-button" onClick={handleLogout}>
            {NAV.LOG_OUT}
          </button>
        ) : (
          <Link className="login-button" to={ROUTES.SIGNUP}>
            {NAV.SIGN_UP}
          </Link>
        )}
      </div>
    </nav>
  )
}
