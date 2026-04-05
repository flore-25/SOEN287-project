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
  const [role, setRole] = useState('')
  const [roleID, setRoleID] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Demo: log in as student. Replace with API call and role from backend later.
    
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
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dataOut)
    })
    .then(response => {
      return response.text();
    })
    .then(text => {
      console.log("raw response test: ", text);
      const data = JSON.parse(text);
      navigate(data.redirect);
    })
    .catch(error => {
      if(error.responseJson) {
        alert(error.responseJson.message);
      } else {
        console.error('There has been an error: ', error);
      }
    });
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
        <div className='input-group'>
          <label for="role">Role:</label>
          <select name="role" id="role" required onChange={(e) => setRole(e.target.value)}>
            <option value="admin">Administrator</option>
            <option value="student" selected>Student</option>
          </select>
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