import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import landingBG from './assets/landingBG.png'
import TopNavBar from './components/TopNavBar'
import SignupBox from './components/SignupBox'
import { useAuth } from './context/AuthContext'
import { ROUTES, LOGIN, ROLES } from './constants'
import './loginPage.css'

function SignupPage() {
  useEffect(() => {
    document.body.classList.add('landing-page')
    return () => document.body.classList.remove('landing-page')
  }, [])

  return (
    <div className="loginPage">
      <TopNavBar/>
      <SignupBox/>
    </div>
  )
}


export default SignupPage
