import { useState } from 'react'
import landingBG from './assets/landingBG.png'
import {
  Link
} from "react-router-dom";
import './landingPage.css'



function LoginPage() 
{
  const [loggedIn, setLogIn] = useState(false)
    return(
    <div className='landingPage'>
        <div>
            <TopNavBar />
        </div>
        <div className='loginBox'>
            <LoginBox/>
        </div>
    </div>
    )
  
}

export default LoginPage

function LoginBox()
{
    return(
        <div>
            <h2>Hello!</h2>

            <form className='login' onSubmit={console.log('submitted')}>
                <input type = "email"/>

                <input type="password"/>

                <input type='submit' className='loginButton'/>
            </form>
        </div>
    )
}

function TopNavBar()
{
    return(
        <nav className='navbar'>
            <div className='navbar-left'>
                <Link to="/">SOEN287 Project</Link>
            </div>
        </nav>
    )
}
