import { useState } from 'react'
import { useNavigate, Link} from 'react-router-dom'
import { ROUTES, NAV, SIGN_UP } from '../constants'
import '../loginPage.css'

function SignupBox() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [roleID, setRoleID] = useState(0)
  const [role, setRole] = useState(0)

  const handleSubmit = (e) => {
    e.preventDefault()

    const dataOut = {
      name: name,
      email: email,
      password: password,
      role: role,
      roleID: roleID
    };
     fetch('/signup/password', {
      method: "POST",
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataOut),
    })
      .then(async (response) => {
        const text = await response.text()
        let data
        try {
          data = JSON.parse(text)
        } catch {
          throw new Error('Invalid response from server')
        }
        if (!response.ok) {
          throw new Error(data.message || 'Sign up failed.')
        }
        navigate(data.redirect)
      })
      .catch((error) => {
        alert(error.message || 'There has been an error.')
        console.error('There has been an error: ', error)
      })
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
          <span className='fa-solid fa-address-card'></span>
          <input
            type="roleID"
            value={roleID}
            onChange={(e) => setRoleID(e.target.value)}
            placeholder="Student/Admin ID"
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
        <fieldset className="account-type-fieldset">
          <legend>{SIGN_UP.ACCOUNT_TYPE}</legend>
          <div className="account-type-options">
            <label>
              <input
                type="radio"
                name="accountType"
                checked={role === 0}
                onChange={() => setRole(0)}
              />
              {SIGN_UP.STUDENT}
            </label>
            <label>
              <input
                type="radio"
                name="accountType"
                checked={role === 1}
                onChange={() => setRole(1)}
              />
              {SIGN_UP.INSTRUCTOR}
            </label>
          </div>
        </fieldset>
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