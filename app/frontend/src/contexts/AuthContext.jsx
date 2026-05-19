import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import authService from '../services/auth.service'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user profile on mount if token exists
  useEffect(() => {
    const token = window.localStorage.getItem('authToken')
    if (!token) {
      setLoading(false)
      return
    }

    authService
      .getProfile()
      .then((data) => {
        const profile = data.user || data
        setUser(profile)
        if (profile?.id) {
          window.localStorage.setItem('userId', profile.id)
        }
      })
      .catch(() => {
        // Token invalid, clear it
        window.localStorage.removeItem('authToken')
        window.localStorage.removeItem('userId')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password)
    if (data.token) {
      window.localStorage.setItem('authToken', data.token)
    }
    if (data.user?.id) {
      window.localStorage.setItem('userId', data.user.id)
    }
    setUser(data.user)
    return data
  }, [])

  const signup = useCallback(async (name, email, password) => {
    const data = await authService.signup(name, email, password)
    if (data.token) {
      window.localStorage.setItem('authToken', data.token)
    }
    if (data.user?.id) {
      window.localStorage.setItem('userId', data.user.id)
    }
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(() => {
    window.localStorage.removeItem('authToken')
    window.localStorage.removeItem('userId')
    setUser(null)
    window.location.href = '/login'
  }, [])

  const value = { user, loading, login, signup, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
