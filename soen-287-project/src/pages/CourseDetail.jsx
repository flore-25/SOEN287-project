import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCourses } from '../context/CoursesContext'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../constants'
import { ROUTES } from '../constants/routes'
import {
  COURSE_DETAIL,
  ASSIGNMENT_CATEGORIES,
  ASSIGNMENT_STATUS,
} from '../constants/labels'
import './CourseDetail.css'

export default function CourseDetail() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getCourseById, updateAssignments, addAssignment } = useCourses()
  const course = getCourseById(courseId)

  const [selectedIds, setSelectedIds] = useState(new Set())

  const isInstructor = user?.role === ROLES.ADMINISTRATOR
  const isStudent = user?.role === ROLES.STUDENT

  const assignments = course?.assignments ?? []

  const { weightedAverage, earnedPercent } = useMemo(() => {
    const withGrade = assignments.filter((a) => a.grade != null && a.grade !== '')
    const totalWeightGraded = withGrade.reduce((sum, a) => sum + (Number(a.weight) || 0), 0)
    const weightedSum = withGrade.reduce(
      (sum, a) => sum + ((Number(a.grade) || 0) / 100) * (Number(a.weight) || 0),
      0
    )
    const totalWeightAll = assignments.reduce((sum, a) => sum + (Number(a.weight) || 0), 0)
    const earnedSoFar = withGrade.reduce((sum, a) => sum + (Number(a.weight) || 0), 0)
    const avg =
      totalWeightGraded > 0 ? (weightedSum / totalWeightGraded) * 100 : 0
    const earned =
      totalWeightAll > 0 ? (earnedSoFar / totalWeightAll) * 100 : 0
    return {
      weightedAverage: Math.round(avg),
      earnedPercent: Math.round(earned),
    }
  }, [assignments])

  const toggleSelected = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === assignments.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(assignments.map((a) => a.id)))
    }
  }

  const removeSelected = () => {
    if (!courseId) return
    const next = assignments.filter((a) => !selectedIds.has(a.id))
    updateAssignments(courseId, next)
    setSelectedIds(new Set())
  }

  const updateOne = (assignmentId, field, value) => {
    const next = assignments.map((a) =>
      a.id === assignmentId ? { ...a, [field]: value } : a
    )
    updateAssignments(courseId, next)
  }

  const handleAddAssignment = () => {
    addAssignment(courseId, {
      name: 'New assignment',
      dueDate: new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }),
      category: ASSIGNMENT_CATEGORIES[0],
      grade: null,
      weight: 10,
      status: ASSIGNMENT_STATUS.PENDING,
    })
  }

  useEffect(() => {
    if (courseId && !course) {
      navigate(ROUTES.DASHBOARD, { replace: true })
    }
  }, [courseId, course, navigate])

  if (!course) {
    return null
  }

  return (
    <div className="course-detail">
      <h1 className="course-detail__title">{course.code}</h1>

      <div className="course-detail__grade-card">
        <h2 className="course-detail__grade-card-title">{COURSE_DETAIL.GRADE}</h2>
        <p className="course-detail__grade-value">{weightedAverage}%</p>
        <p className="course-detail__grade-earned">
          {earnedPercent}% {COURSE_DETAIL.EARNED_SO_FAR}
        </p>
      </div>

      <section className="course-detail__assessments">
        <div className="course-detail__assessments-header">
          <h2>{COURSE_DETAIL.ASSESSMENTS}</h2>
          {isInstructor && (
            <button
              type="button"
              className="course-detail__add-btn"
              onClick={handleAddAssignment}
              aria-label={COURSE_DETAIL.ADD_ASSIGNMENT}
            >
              +
            </button>
          )}
          {isStudent && selectedIds.size > 0 && (
            <button
              type="button"
              className="course-detail__remove-btn"
              onClick={removeSelected}
            >
              {COURSE_DETAIL.REMOVE_SELECTED}
            </button>
          )}
        </div>

        <div className="course-detail__table-wrap">
          <table className="course-detail__table">
            <thead>
              <tr>
                <th>
                  {isStudent && (
                    <input
                      type="checkbox"
                      checked={assignments.length > 0 && selectedIds.size === assignments.length}
                      onChange={selectAll}
                      aria-label="Select all"
                    />
                  )}
                </th>
                <th>{COURSE_DETAIL.ASSESSMENT}</th>
                <th>{COURSE_DETAIL.DUE_DATE}</th>
                <th>{COURSE_DETAIL.CATEGORIE}</th>
                <th>{COURSE_DETAIL.GRADE_LABEL}</th>
                <th>{COURSE_DETAIL.WEIGHT}</th>
                <th>{COURSE_DETAIL.STATUS}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td>
                    {isStudent && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(a.id)}
                        onChange={() => toggleSelected(a.id)}
                        aria-label={`Select ${a.name}`}
                      />
                    )}
                  </td>
                  <td>{a.name}</td>
                  <td>{a.dueDate}</td>
                  <td>
                    {isInstructor ? (
                      <select
                        value={a.category}
                        onChange={(e) => updateOne(a.id, 'category', e.target.value)}
                        className={`course-detail__select course-detail__select--${a.category || 'assignment'}`}
                      >
                        {ASSIGNMENT_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`course-detail__badge course-detail__badge--${a.category}`}>
                        {a.category}
                      </span>
                    )}
                  </td>
                  <td>
                    {isInstructor ? (
                      <span className="course-detail__input-wrap">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={a.grade ?? ''}
                          onChange={(e) =>
                            updateOne(a.id, 'grade', e.target.value === '' ? null : Number(e.target.value))
                          }
                          className="course-detail__input"
                        />
                        %
                      </span>
                    ) : (
                      <span>{a.grade != null ? `${a.grade}%` : '—'}</span>
                    )}
                  </td>
                  <td>
                    {isInstructor ? (
                      <span className="course-detail__input-wrap">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={a.weight ?? ''}
                          onChange={(e) =>
                            updateOne(a.id, 'weight', e.target.value === '' ? null : Number(e.target.value))
                          }
                          className="course-detail__input"
                        />
                        %
                      </span>
                    ) : (
                      <span>{a.weight != null ? `${a.weight}%` : '—'}</span>
                    )}
                  </td>
                  <td>
                    {isStudent ? (
                      <select
                        value={a.status}
                        onChange={(e) => updateOne(a.id, 'status', e.target.value)}
                        className={`course-detail__select course-detail__select--status course-detail__status--${(a.status || '').toLowerCase()}`}
                      >
                        <option value={ASSIGNMENT_STATUS.COMPLETED}>{ASSIGNMENT_STATUS.COMPLETED}</option>
                        <option value={ASSIGNMENT_STATUS.PENDING}>{ASSIGNMENT_STATUS.PENDING}</option>
                      </select>
                    ) : (
                      <span className={`course-detail__badge course-detail__status--${(a.status || '').toLowerCase()}`}>
                        {a.status}
                      </span>
                    )}
                  </td>
                  <td>
                    <button type="button" className="course-detail__menu-btn" aria-label="Actions">
                      ⋮
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
