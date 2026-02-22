import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import landingBG from './assets/landingBG.png'
import TopNavBar from './components/TopNavBar'
import { useAuth } from './context/AuthContext'
import { ROUTES } from './constants'
import './landingPage.css'

function LandingPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    if (isLoggedIn) {
      navigate(ROUTES.DASHBOARD, { replace: true })
    }
  }, [isLoggedIn, navigate])

  useEffect(() => {
    document.body.classList.add('landing-page')
    return () => document.body.classList.remove('landing-page')
  }, [])

  return (
    <div className="landingPage">
      <div>
        <TopNavBar />
      </div>
      <div className="picture">
        <a target="_blank" rel="noreferrer">
          <img src={landingBG} className="logoLandingBG" alt="Landing Background" />
        </a>
      </div>
    </div>
  )
}

export default LandingPage
