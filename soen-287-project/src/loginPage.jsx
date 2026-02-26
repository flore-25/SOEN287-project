import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import landingBG from './assets/landingBG.png'
import TopNavBar from './components/TopNavBar'
import LoginBox from './components/LoginBox'
import { useAuth } from './context/AuthContext'
import { ROUTES, LOGIN, ROLES } from './constants'
import './loginPage.css'

function LoginPage() {
  useEffect(() => {
    document.body.classList.add('landing-page')
    return () => document.body.classList.remove('landing-page')
  }, [])

  return (
    <div className="loginPage">
      <TopNavBar/>
      <LoginBox/>
    </div>
  )
}


export default LoginPage
