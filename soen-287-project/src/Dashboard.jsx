import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CourseCard from './components/CourseCard'
import AddCourseButton from './components/AddCourseButton'
import CourseFormInstructor from './components/CourseFormInstructor'
import CourseFormStudent from './components/CourseFormStudent'
import { useAuth, useIsStudent } from './context/AuthContext'
import { useCourses } from './context/CoursesContext'
import { ROUTES, DASHBOARD as DASHBOARD_LABELS } from './constants'
import './dashboard.css'

/** Generate a simple unique id for local state. Replace with API id when backend exists. */
function nextId() {
  return String(Date.now())
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { isLoggedIn, loading } = useAuth()
  const isStudent = useIsStudent()
  const { courses, setCourses } = useCourses()

  const [formState, setFormState] = useState({ open: false, course: null })

  useEffect(() => {
    if(loading) return;
    if (!isLoggedIn) {
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }, [isLoggedIn, loading, navigate])

  // Ensure body has no landing-page class so global layout isn’t constrained
  useEffect(() => {
    document.body.classList.remove('landing-page')
    document.body.classList.add('dashboard-page')
    return () => {
      document.body.classList.remove('dashboard-page')
    }
  }, [])

const openAdd = useCallback(() => setFormState({ open: true, course: null }), [])
const openEdit = useCallback((course) => setFormState({ open: true, course }), [])
const closeForm = useCallback(() => setFormState({ open: false, course: null }), [])

const handleSave = useCallback((values) => {
  const url = isStudent ? '/api/courses/enroll' : '/api/courses/create';
  fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values)
  })
  .then(res => res.ok ? res.json() : null)
  .then(() => fetch('/api/courses', {
    credentials: 'include',
    headers: { 'Cache-Control': 'no-cache' }
  }))
  .then(res => res.ok ? res.json() : null)
  .then(data => {
    console.log("courses data:", data);
    if (data?.courses) {
      setCourses(data.courses.map(c => ({
          ...c,
          id: String(c.course_id),
          code: c.course_code,
          instructor: c.instructor ?? '',
          term: c.term ?? '',
        })));
    }
    closeForm();
  })
  .catch(err => console.error('Failed to save course:', err));
}, [formState.course, closeForm, isStudent]);

const handleRemove = useCallback((course) => {
  fetch('/api/courses/remove', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ course_id: course.course_id })
  })
  .then(res => res.ok ? res.json() : null)
  .then(() => {
    setCourses(prev => prev.filter(c => c.course_id !== course.course_id));
  })
  .catch(err => console.error('Failed to remove course:', err));
}, []);

useEffect(() => {
  if (loading || !isLoggedIn) return;
  fetch('/api/courses', {
    credentials: 'include',
    headers: { 'Cache-Control': 'no-cache' }
  })
  .then(res => res.ok ? res.json() : null)
  .then(data => {
    console.log("courses data:", data);
    if (data?.courses)
      {
        setCourses(data.courses.map(c => ({
          ...c,
          id: String(c.course_id),
          code: c.course_code,
          instructor: c.instructor ?? '',
          term: c.term ?? '',
        })));
        console.log("setting courses:", mapped);
        setCourses(mapped);
        console.log("setCourses called");
      } else {
      console.log("no courses in data");
    }
  })
  .catch(err => console.error('Failed to load courses:', err));
}, [isLoggedIn, loading]);

console.log("rendering courses:", courses);

  if (loading) return null;
  if (!isLoggedIn) return null;

  return (
    <div className="dashboard">
      <main className="dashboard__main">
        <header className="dashboard__header">
          <h1 className="dashboard__title">{DASHBOARD_LABELS.TITLE}</h1>
          {(
            <div className="dashboard__add">
              <AddCourseButton onClick={openAdd} />
            </div>
          )}
        </header>
        <div className="dashboard__grid">
          {courses.map((course) => (
            <CourseCard
              key={course.course_id}
              course={course}
              onEdit={() => openEdit(course)}
              onRemove={() => handleRemove(course)}
              showActions={isStudent}
            />
          ))}
        </div>
      </main>

      {formState.open && isStudent &&(
        <CourseFormStudent
          initialCourse={formState.course}
          onSubmit={handleSave}
          onCancel={closeForm}
        />
      )}
      {formState.open && !isStudent &&(
        <CourseFormInstructor
          initialCourse={formState.course}
          onSubmit={handleSave}
          onCancel={closeForm}
        />
      )}
    </div>
  )
}
