import { createContext, useContext, useState, useCallback } from 'react'
import { SAMPLE_COURSES } from '../data/sampleCourses'
import { ASSIGNMENT_CATEGORIES, ASSIGNMENT_STATUS } from '../constants'

/** Default assignments template for demo. In production, load from API. */
function defaultAssignmentsTemplate() {
  return [
    { name: 'Lab report 0', dueDate: '12 Aug 2022 - 12:25am', category: 'lab', grade: null, weight: 10, status: 'Pending' },
    { name: 'Lab report 0', dueDate: '12 Aug 2022 - 12:25am', category: 'quiz', grade: null, weight: 10, status: 'Completed' },
    { name: 'Lab report 0', dueDate: '12 Aug 2022 - 12:25am', category: 'assignment', grade: null, weight: 15, status: 'Pending' },
    { name: 'Lab report 0', dueDate: '12 Aug 2022 - 12:25am', category: 'lab', grade: null, weight: 10, status: 'Completed' },
    { name: 'Lab report 0', dueDate: '12 Aug 2022 - 12:25am', category: 'exam', grade: null, weight: 25, status: 'Pending' },
  ]
}

/** Build initial courses with assignments. Each course gets unique assignment ids. */
function buildInitialCourses() {
  return SAMPLE_COURSES.map((c) => ({
    ...c,
    assignments: defaultAssignmentsTemplate().map((a, i) => ({
      ...a,
      id: `${c.id}-a-${i}-${Math.random().toString(36).slice(2, 7)}`,
    })),
  }))
}

const CoursesContext = createContext(null)

export function CoursesProvider({ children }) {
  const [courses, setCourses] = useState(buildInitialCourses)

  const getCourseById = useCallback(
    (courseId) => courses.find((c) => c.id === courseId) ?? null,
    [courses]
  )

  const updateCourse = useCallback(
    (courseId, updater) => {
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? updater(c) : c))
      )
    },
    []
  )

  const updateAssignments = useCallback((courseId, assignments) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, assignments } : c))
    )
  }, [])

  const addAssignment = useCallback((courseId, assignment) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c
        const newId = `a-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
        return {
          ...c,
          assignments: [...(c.assignments || []), { ...assignment, id: newId }],
        }
      })
    )
  }, [])

  const value = {
    courses,
    setCourses,
    getCourseById,
    updateCourse,
    updateAssignments,
    addAssignment,
  }
  return (
    <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>
  )
}

export function useCourses() {
  const ctx = useContext(CoursesContext)
  if (!ctx) throw new Error('useCourses must be used within CoursesProvider')
  return ctx
}
