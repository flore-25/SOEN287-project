import { COURSE_MENU } from '../constants'
import '../styles/courseMenu.css'

export default function CourseMenu({ onEdit, onRemove, onClose }) {
  return (
    <div className="course-menu" role="menu">
      <button type="button" className="course-menu__item" role="menuitem" onClick={onEdit}>
        {COURSE_MENU.EDIT}
      </button>
      <button type="button" className="course-menu__item course-menu__item--danger" role="menuitem" onClick={onRemove}>
        {COURSE_MENU.REMOVE}
      </button>
    </div>
  )
}
