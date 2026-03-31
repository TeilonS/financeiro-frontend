import { createContext, useContext, useState } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })

  function login(userData) {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  async function logout() {
    try { await api.post('/auth/logout') } catch { /* ignora falha de rede */ }
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
