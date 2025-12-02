import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { crearUsuario } from '../servicios/usuarios.js'
import { Boton } from '../componentes/Boton.jsx'

export function PaginaRegistro() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { document.title = 'FiguMarket - Crear cuenta' }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const emailValido = /.+@.+\..+/.test(email)
    if (!nombre || !email || !password) {
      setError('Todos los campos son obligatorios')
      return
    }
    if (!emailValido) {
      setError('Por favor, introduce un email válido')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (!aceptaTerminos) {
      setError('Debes aceptar los términos y condiciones para registrarte')
      return
    }
    setLoading(true)
    // Backend espera { nombre, email, contrasena, rol }
    const res = await crearUsuario({ nombre, email, contrasena: password, rol: 'usuario' })
    setLoading(false)
    if (res.ok) navigate('/login')
    else setError(res.error || 'No se pudo registrar el usuario')
  }

  return (
    <section className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        {error && <p className="text-red-600">{error}</p>}
        <div>
          <label className="block text-sm text-gray-600">Nombre</label>
          <input type="text" className="mt-1 w-full rounded-md border px-3 py-2"
                 value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" />
        </div>
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
        <div className="mt-2 flex items-start gap-2">
          <input id="terminos" type="checkbox" className="mt-1 h-4 w-4" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} />
          <label htmlFor="terminos" className="text-sm text-gray-700">
            He leído y acepto los{' '}
            <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-brand hover:text-brand-dark underline">términos y condiciones</a>.
          </label>
        </div>
        <Boton type="submit" disabled={loading}>{loading ? 'Creando...' : 'Registrarme'}</Boton>
      </form>
      <p className="mt-4 text-sm">¿Ya tienes cuenta? <Link to="/login" className="text-brand hover:text-brand-dark">Inicia sesión</Link></p>
    </section>
  )
}