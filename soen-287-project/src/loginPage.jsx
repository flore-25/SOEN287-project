import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import landingBG from './assets/landingBG.png'
import TopNavBar from './components/TopNavBar'
import { useAuth } from './context/AuthContext'
import { ROUTES, LOGIN, ROLES } from './constants'
import './landingPage.css'

function LoginPage() {
  useEffect(() => {
    document.body.classList.add('landing-page')
    return () => document.body.classList.remove('landing-page')
  }, [])

  return (
    <div className="landingPage">
      <div>
        <TopNavBar />
      </div>
      <div className="loginBox">
        <LoginBox />
      </div>
    </div>
  )
}

function LoginBox() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Demo: log in as student. Replace with API call and role from backend later.
    login({
      id: 'demo-user-1',
      email: email || 'student@example.com',
      role: ROLES.STUDENT,
    })
    navigate(ROUTES.DASHBOARD)
  }

  return (
    <div>
      <h2>{LOGIN.GREETING}</h2>
      <form className="login" onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={LOGIN.EMAIL_PLACEHOLDER}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={LOGIN.PASSWORD_PLACEHOLDER}
        />
        <input type="submit" className="loginButton" value={LOGIN.SUBMIT} />
      </form>
    </div>
  )
}

export default LoginPage
