import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as auth from '../servicios/auth.js'

const AuthContext = createContext(null)
const TOKEN_KEY = 'figumarket_token'

export function ProveedorAuth({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  }, [token])

  useEffect(() => {
    let cancelled = false
    const cargarUsuario = async () => {
      if (!token) { setUsuario(null); return }
      const res = await auth.me()
      if (!cancelled) {
        if (res?.id) setUsuario(res)
        else { setUsuario(null); setToken('') }
      }
    }
    cargarUsuario()
    return () => { cancelled = true }
  }, [token])

  const login = async (credenciales) => {
    const res = await auth.login(credenciales)
    if (res?.token) {
      setToken(res.token)
      setUsuario(res.usuario || null)
      return { ok: true }
    }
    return { ok: false, error: res?.error || 'Login fallido' }
  }

  const logout = () => {
    setToken('')
    setUsuario(null)
  }

  const refrescarUsuario = async () => {
    if (!token) { setUsuario(null); return }
    const res = await auth.me()
    if (res?.id) setUsuario(res)
  }

  const value = useMemo(() => ({ token, usuario, isAuthenticated: !!token, login, logout, refrescarUsuario }), [token, usuario])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de ProveedorAuth')
  return ctx
}