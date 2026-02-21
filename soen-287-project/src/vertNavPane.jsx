import {
  Link
} from "react-router-dom";
import './vertNavPane.css'
import { useLocation } from "react-router-dom";

function Navbar()
{
    let location = useLocation();

    if(location.pathname === '/' || location.pathname.startsWith('/login')) return null;

    return(
        <nav className='vertical-navbar'>
            <h3>
                Soen 287 Project
            </h3>
            <Link className="nav-button dashboard-link icon icon-dashboard" to="/">Dashboard</Link>
            <Link className="nav-button deadlines-link icon icon-calendar" to="/">Upcoming Deadlines</Link>
            <Link className="nav-button progress-link icon icon-progress" to="/">My Progress</Link>
            <div className="spacing-line"></div>
            <Link className="nav-button account-link icon icon-user" to="/">My Account</Link>
        </nav>
    )
}

export default Navbar