import { useState } from 'react'
import landingBG from './assets/landingBG.png'

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
                <a href='/' className='logo'>
                    SOEN Project cool
                </a>
            </div>

            <div className='navbar-right'>
                <a href='/login' className='login-button'>
                    Sign Up
                </a>
            </div>
        </nav>
    )
}
