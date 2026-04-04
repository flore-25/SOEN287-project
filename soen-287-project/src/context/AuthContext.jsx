import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { ROLES } from '../constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/login/me', {
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    .then(res => {
      if (res.ok || res.status === 304) {
        console.log("all good");
        return res.json();
      }
      return null;
    })
    .then(data => {
      if (data?.user) setUser(data.user);
    })
    .catch(() => setUser(null))
    .finally(() => setLoading(false));
  }, []);

  const login = useCallback((userData) => {
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    return fetch('/logout', {
      method: 'POST',
      credentials: 'include'
    })
    .then(() => {
      setUser(null);
    });
  }, []); 

  const value = { user, login, logout, isLoggedIn: !!user, loading }
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
  return user?.role === ROLES.STUDENT
}
