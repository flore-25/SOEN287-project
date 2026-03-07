import { DASHBOARD } from '../constants'
import '../styles/addCourseButton.css'

export default function AddCourseButton({ onClick, ariaLabel, title }) {
  const label = ariaLabel ?? DASHBOARD.ADD_COURSE
  return (
    <button
      type="button"
      className="add-course-button"
      onClick={onClick}
      aria-label={label}
      title={title ?? label}
    >
      <span className="add-course-button__icon">+</span>
    </button>
  )
}
