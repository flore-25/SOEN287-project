import { DASHBOARD } from '../constants'
import '../styles/addCourseButton.css'

export default function AddCourseButton({ onClick }) {
  return (
    <button
      type="button"
      className="add-course-button"
      onClick={onClick}
      aria-label={DASHBOARD.ADD_COURSE}
      title={DASHBOARD.ADD_COURSE}
    >
      <span className="add-course-button__icon">+</span>
    </button>
  )
}
