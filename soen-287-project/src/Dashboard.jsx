import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CourseCard from './components/CourseCard'
import AddCourseButton from './components/AddCourseButton'
import CourseForm from './components/CourseForm'
import { useAuth, useIsStudent } from './context/AuthContext'
import { ROUTES, DASHBOARD as DASHBOARD_LABELS } from './constants'
import { SAMPLE_COURSES } from './data/sampleCourses'
import './dashboard.css'

/** Generate a simple unique id for local state. Replace with API id when backend exists. */
function nextId() {
  return String(Date.now())
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const isStudent = useIsStudent()

  const [courses, setCourses] = useState(SAMPLE_COURSES)
  const [formState, setFormState] = useState({ open: false, course: null })

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }, [isLoggedIn, navigate])

  // Ensure body has no landing-page class so global layout isn’t constrained
  useEffect(() => {
    document.body.classList.remove('landing-page')
    document.body.classList.add('dashboard-page')
    return () => {
      document.body.classList.remove('dashboard-page')
    }
  }, [])

  if (!isLoggedIn) {
    return null
  }

  const openAdd = useCallback(() => setFormState({ open: true, course: null }), [])
  const openEdit = useCallback((course) => setFormState({ open: true, course }), [])
  const closeForm = useCallback(() => setFormState({ open: false, course: null }), [])

  const handleSave = useCallback(
    (values) => {
      if (formState.course?.id) {
        setCourses((prev) =>
          prev.map((c) => (c.id === formState.course.id ? { ...c, ...values } : c))
        )
      } else {
        setCourses((prev) => [...prev, { ...values, id: nextId() }])
      }
      closeForm()
    },
    [formState.course, closeForm]
  )

  const handleRemove = useCallback((course) => {
    setCourses((prev) => prev.filter((c) => c.id !== course.id))
  }, [])

  return (
    <div className="dashboard">
      <main className="dashboard__main">
        <header className="dashboard__header">
          <h1 className="dashboard__title">{DASHBOARD_LABELS.TITLE}</h1>
          {isStudent && (
            <div className="dashboard__add">
              <AddCourseButton onClick={openAdd} />
            </div>
          )}
        </header>
        <div className="dashboard__grid">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={() => openEdit(course)}
              onRemove={() => handleRemove(course)}
              showActions={isStudent}
            />
          ))}
        </div>
      </main>
      {formState.open && (
        <CourseForm
          initialCourse={formState.course}
          onSubmit={handleSave}
          onCancel={closeForm}
        />
      )}
    </div>
  )
}
