import { createContext, useContext, useState, useCallback } from 'react'


const CoursesContext = createContext(null)

export function CoursesProvider({ children }) {
  const [courses, setCourses] = useState([])

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
