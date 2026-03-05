import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES, LOGIN, ROLES } from '../constants'
import '../loginPage.css'
import { FontAwesomeIcon } from 'react-fontawesome'


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
    <div className='loginDiv'>
      <h2 className='greeting'>{LOGIN.GREETING}</h2>
      <form className="login" onSubmit={handleSubmit}>
        <div className='input-group'>
          <span className='fa-solid fa-envelope'></span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={LOGIN.EMAIL_PLACEHOLDER}
            className="emailField field icon-placeholder"
          />
        </div>
        <div className='input-group'>
          <span className='fa-solid fa-lock'></span>
          <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={LOGIN.PASSWORD_PLACEHOLDER}
          className="passwordField field icon icon-password"
        />
        </div>
        <input type="submit" className="loginButton" value={LOGIN.SUBMIT} />
      </form>
    </div>
  )
}

export default LoginBox