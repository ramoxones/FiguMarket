import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contextos/ProveedorAuth.jsx'
import { getUsuario, actualizarUsuario, subirFotoPerfil } from '../servicios/usuarios.js'
import { resolveMediaUrl } from '../utils/media.js'

export function PaginaEditarPerfil() {
  const navigate = useNavigate()
  const { usuario, isAuthenticated, refrescarUsuario } = useAuth()
  const [detalles, setDetalles] = useState(null)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [fotoPerfil, setFotoPerfil] = useState('')
  const [archivoFoto, setArchivoFoto] = useState(null)
  const inputFileRef = useRef(null)
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { document.title = 'FiguMarket - Editar perfil' }, [])

  useEffect(() => {
    let mounted = true
    if (isAuthenticated && usuario?.id) {
      getUsuario(usuario.id).then((res) => {
        if (mounted && res.ok) {
          setDetalles(res.data)
          setNombre(res.data?.nombre || '')
          setEmail(res.data?.email || '')
          setFotoPerfil(res.data?.foto_perfil || '')
        }
      })
    }
    return () => { mounted = false }
  }, [isAuthenticated, usuario])

  if (!isAuthenticated) return <p>Debes iniciar sesión para editar tu perfil.</p>

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // Subir archivo de foto si se seleccionó
    if (archivoFoto) {
      const up = await subirFotoPerfil(usuario.id, archivoFoto)
      if (up.ok) {
        setFotoPerfil(up.data?.foto_perfil || fotoPerfil)
      } else {
        setLoading(false)
        setError(up.error || 'No se pudo subir la foto')
        return
      }
    }
    const payload = { nombre, email }
    if (contrasena) payload.contrasena = contrasena
    const res = await actualizarUsuario(usuario.id, payload)
    setLoading(false)
    if (res.ok) {
      await refrescarUsuario?.()
      navigate('/perfil')
    } else {
      setError(res.error || 'No se pudo actualizar el perfil')
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-bold">Editar perfil</h1>
      <p className="mt-2 text-gray-600">Actualiza tu información personal.</p>
      <div className="mt-4 rounded-lg border bg-white p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <img src={archivoFoto ? URL.createObjectURL(archivoFoto) : (resolveMediaUrl(fotoPerfil) || '/default-avatar.svg')} alt="Foto de perfil" className="h-16 w-16 rounded-full object-cover border" onError={(e) => { e.currentTarget.src = '/default-avatar.svg' }} />
            <div className="flex-1">
              <label className="block text-sm font-medium">Foto de perfil</label>
              <div className="mt-1 flex items-center gap-2">
                <input ref={inputFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setArchivoFoto(e.target.files?.[0] || null)} />
                <button type="button" onClick={() => inputFileRef.current?.click()} className="inline-flex items-center gap-2 h-10 rounded-lg bg-brand text-white px-4 font-semibold shadow-md hover:shadow-lg hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-brand">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M4 7a2 2 0 012-2h2l1-1h6l1 1h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7zm8 2a4 4 0 100 8 4 4 0 000-8z"/></svg>
                  Subir foto
                </button>
                {archivoFoto && <span className="text-xs text-gray-600">{archivoFoto.name}</span>}
              </div>
              <p className="text-xs text-gray-500 mt-1">Formatos soportados: JPG, PNG, WEBP.</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Contraseña (opcional)</label>
            <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" placeholder="Dejar vacío para no cambiar" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="rounded-md border px-3 py-2 hover:bg-brand hover:text-white disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <Link to="/perfil" className="rounded-md border px-3 py-2 hover:bg-gray-100">Cancelar</Link>
          </div>
        </form>
      </div>
    </section>
  )
}