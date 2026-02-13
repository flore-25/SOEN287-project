import { useState } from 'react'
import landingBG from './assets/landingBG.png'
import {
  Link
} from "react-router-dom";
import './landingPage.css'



function LandingPage() 
{
  const [loggedIn, setLogIn] = useState(false)
    return(
    <div className='landingPage'>
        <div>
            <TopNavBar />
        </div>
        <div className='picture'>
            <a target='_blank'>
                <img src={landingBG} className='logoLandingBG' alt='Landing Background' />
            </a>
        </div>
    </div>
    )
  
}

export default LandingPage

function TopNavBar()
{
    return(
        <nav className='navbar'>
            <div className='navbar-left'>
                <Link className="logo" to="/">SOEN287 Project</Link>
            </div>

            <div className='navbar-right'>
                <Link className='login-button' to="/login">Sign Up</Link>
            </div>
        </nav>
    )
}
