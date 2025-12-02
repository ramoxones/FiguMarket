import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contextos/ProveedorAuth.jsx'
import { Boton } from '../componentes/Boton.jsx'

export function PaginaLogin() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { document.title = 'FiguMarket - Iniciar sesión' }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Email y contraseña son obligatorios')
      return
    }
    setLoading(true)
    const res = await login({ email, password })
    setLoading(false)
    if (res.ok) navigate('/perfil')
    else setError(res.error || 'Credenciales inválidas')
  }

  if (isAuthenticated) return <p>Ya has iniciado sesión.</p>

  return (
    <section className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        {error && <p className="text-red-600">{error}</p>}
        <div>
          <label className="block text-sm text-gray-600">Email</label>
          <input type="email" className="mt-1 w-full rounded-md border px-3 py-2"
                 value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Contraseña</label>
          <input type="password" className="mt-1 w-full rounded-md border px-3 py-2"
                 value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <Boton type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Boton>
      </form>
      <p className="mt-4 text-sm">¿No tienes cuenta? <Link to="/registro" className="text-brand hover:text-brand-dark">Regístrate</Link></p>
    </section>
  )
}