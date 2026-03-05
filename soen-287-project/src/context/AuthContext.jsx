import { createContext, useContext, useState, useCallback } from 'react'
import { ROLES } from '../constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = useCallback((userData) => {
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const value = { user, login, logout, isLoggedIn: !!user }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

/** Helper: true if current user is a student (can add/edit/remove courses). */
export function useIsStudent() {
  const { user } = useAuth()
  return user?.role === ROLES.ADMINISTRATOR
}
