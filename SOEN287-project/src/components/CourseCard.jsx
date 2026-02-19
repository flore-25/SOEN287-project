import { useState, useRef, useEffect } from 'react'
import { DASHBOARD, COURSE_MENU } from '../constants'
import CourseMenu from './CourseMenu'
import '../styles/courseCard.css'

/**
 * Single course card - reusable
 * @param {{ id: string, code: string, instructor: string, term: string }} course
 * @param {() => void} onEdit
 * @param {() => void} onRemove
 * @param {boolean} showActions - false for non-students
 */
export default function CourseCard({ course, onEdit, onRemove, showActions }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const gradientStyle = getGradientForCourse(course)

  return (
    <article className="course-card">
      <div className="course-card__accent" style={gradientStyle} aria-hidden />
      <div className="course-card__body">
        <h3 className="course-card__code">{course.code}</h3>
        <p className="course-card__meta">
          {DASHBOARD.INSTRUCTOR_LABEL}: {course.instructor}
        </p>
        <p className="course-card__term">{course.term}</p>
      </div>
      {showActions && (
        <div className="course-card__actions" ref={menuRef}>
          <button
            type="button"
            className="course-card__menu-trigger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Course options"
          >
            <span className="course-card__ellipsis">⋮</span>
          </button>
          {menuOpen && (
            <CourseMenu
              onEdit={() => {
                onEdit()
                setMenuOpen(false)
              }}
              onRemove={() => {
                onRemove()
                setMenuOpen(false)
              }}
              onClose={() => setMenuOpen(false)}
            />
          )}
        </div>
      )}
    </article>
  )
}

/** random gradient for visual variety. */
function getGradientForCourse(course) {
  const hash = (course.id || course.code || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const hue1 = (hash * 37) % 360
  const hue2 = (hash * 17 + 120) % 360
  return {
    background: `linear-gradient(135deg, hsl(${hue1}, 70%, 85%), hsl(${hue2}, 70%, 80%))`,
  }
}
