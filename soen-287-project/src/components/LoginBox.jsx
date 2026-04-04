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
    
    const dataOut = {
      email: email,
      password: password
    };
     fetch('/login/password', {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dataOut)
     })
    .then(response =>
    {
      console.log("checking password...");
      if (!response.ok) {
        return response.json().then(errorData => {
          const error = new Error(`HTTP error! status ${response.status}`);
          error.responseJson = errorData;
          throw error;
        });
      }
      return response.json();
    })
    .then(data => {
    window.location.href = data.redirect;
    })
    .catch(error =>
    {
      if(error.responseJson) 
      {
         alert(error.responseJson.message);
      }
      else
      {
        console.error('There has been an error: ', error.message)
      }
    });
  }

  return (
    <div className='loginDiv'>
      <h2 className='greeting'>{LOGIN.GREETING}</h2>
      <form className="login" onSubmit={handleSubmit}>
        <div className='input-group'>
          <span className='fa-solid fa-envelope'></span>
          <input
            type="email"
            name="email"
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
          name="password"
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