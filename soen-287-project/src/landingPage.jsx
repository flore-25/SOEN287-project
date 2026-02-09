import { useState } from 'react'
import landingBG from './assets/landingBG.png'

function LandingPage() 
{
  const [loggedIn, setLogIn] = useState(false)
    return(
    <>
        <div>
            <TopNavBar />
        </div>
        <div className='picture'>
            <a target='_blank'>
                <img src={landingBG} className='logo landingBG' alt='Landing Background' />
            </a>
        </div>
    </>
    )
  
}

export default LandingPage

function TopNavBar()
{
    return(
        <nav className='navbar'>
            <div className='navbar-left'>
                <a href='/' className='logo'>
                    SOEN Project
                </a>
            </div>

            <div className='navbar-right'>
                <a href='/login' className='login_button'>
                    Sign Up
                </a>
            </div>
        </nav>
    )
}
