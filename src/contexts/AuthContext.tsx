import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { api } from '@/services/api'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'))
  const [isLoading, setIsLoading] = useState(true)
  const skipNextAuthChange = useRef(false)
  const hasFirebaseSession = useRef(false)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUsr) => {
      setFirebaseUser(firebaseUsr)

      if (skipNextAuthChange.current) {
        skipNextAuthChange.current = false
        setIsLoading(false)
        return
      }

      if (firebaseUsr) {
        hasFirebaseSession.current = true
        try {
          const idToken = await firebaseUsr.getIdToken()
          const response = await api.post('/auth/login', { id_token: idToken })
          const { token: apiToken, user: userData } = response.data
          localStorage.setItem('admin_token', apiToken)
          setToken(apiToken)
          setUser(userData)
          api.defaults.headers.common['Authorization'] = `Bearer ${apiToken}`
        } catch (err: any) {
          console.error('Backend login failed:', err.response?.data || err.message)
        }
      } else {
        hasFirebaseSession.current = false
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // On mount: validate existing token from localStorage (if Firebase session is gone)
  useEffect(() => {
    const existingToken = localStorage.getItem('admin_token')
    if (existingToken && !hasFirebaseSession.current) {
      api.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`
      api
        .get('/auth/user')
        .then((response) => {
          const userData = response.data.user || response.data.data
          setUser(userData)
          setToken(existingToken)
        })
        .catch(() => {
          localStorage.removeItem('admin_token')
          setToken(null)
          setUser(null)
          delete api.defaults.headers.common['Authorization']
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else if (!existingToken) {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email: string, password: string) => {
    skipNextAuthChange.current = true
    setIsLoading(true)

    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const idToken = await userCredential.user.getIdToken()

    const response = await api.post('/auth/login', { id_token: idToken })
    const { token: apiToken, user: userData } = response.data

    localStorage.setItem('admin_token', apiToken)
    setToken(apiToken)
    setUser(userData)
    setFirebaseUser(userCredential.user)
    api.defaults.headers.common['Authorization'] = `Bearer ${apiToken}`
    setIsLoading(false)
  }

  const logout = async () => {
    await signOut(auth)
    localStorage.removeItem('admin_token')
    setToken(null)
    setUser(null)
    setFirebaseUser(null)
    delete api.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        token,
        login,
        logout,
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
