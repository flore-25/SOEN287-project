import { useState } from 'react'
import { useNavigate, Link} from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES, ROLES, NAV, SIGN_UP } from '../constants'
import '../loginPage.css'
import { FontAwesomeIcon } from 'react-fontawesome'


function SignupBox() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

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
      <h2 className='greeting'>{SIGN_UP.GREETING}</h2>
      <form className="login" onSubmit={handleSubmit}>
        <div className='input-group'>
          <span className='fa-solid fa-address-card'></span>
          <input
            type="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={SIGN_UP.NAME}
            className="nameField field icon-placeholder"
          />
        </div>
        <div className='input-group'>
          <span className='fa-solid fa-envelope'></span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={SIGN_UP.EMAIL_PLACEHOLDER}
            className="emailField field icon-placeholder"
          />
        </div>
        <div className='input-group'>
          <span className='fa-solid fa-lock'></span>
          <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={SIGN_UP.PASSWORD_PLACEHOLDER}
          className="passwordField field icon icon-password"
        />
        </div>
        <input type="submit" className="loginButton" value={SIGN_UP.SUBMIT} />
      </form>
      <>
        Already have an account?
      </>
      <Link className="login-button" to={ROUTES.LOGIN}>
            {NAV.LOGIN}
      </Link>
    </div>
  )
}

export default SignupBox