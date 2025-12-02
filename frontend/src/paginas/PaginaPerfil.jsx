import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contextos/ProveedorAuth.jsx'
import { getUsuario } from '../servicios/usuarios.js'
import { getFiguras, actualizarFigura, borrarFigura } from '../servicios/figuras.js'
import { TarjetaFigura } from '../componentes/TarjetaFigura.jsx'
import { resolveMediaUrl } from '../utils/media.js'
 

export function PaginaPerfil() {
  const { usuario, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [detalles, setDetalles] = useState(null)
  const [misFiguras, setMisFiguras] = useState([])
  const [cargandoPerfil, setCargandoPerfil] = useState(true)
  const [cargandoMisFiguras, setCargandoMisFiguras] = useState(true)
  useEffect(() => { document.title = 'FiguMarket - Mi perfil' }, [])
  

  const misFigurasOrdenadas = useMemo(() => {
    const arr = Array.isArray(misFiguras) ? [...misFiguras] : []
    const isFeatured = (f) => !!f?.destacado
    arr.sort((a, b) => {
      const fa = isFeatured(a) ? 1 : 0
      const fb = isFeatured(b) ? 1 : 0
      if (fa !== fb) return fb - fa
      const da = new Date(a?.fecha_publicacion || 0).getTime()
      const db = new Date(b?.fecha_publicacion || 0).getTime()
      return db - da
    })
    return arr
  }, [misFiguras])

  useEffect(() => {
    let mounted = true
    if (isAuthenticated && usuario?.id) {
      getUsuario(usuario.id).then((res) => {
        if (mounted) {
          if (res.ok) setDetalles(res.data)
          setCargandoPerfil(false)
        }
      })
      getFiguras().then((res) => {
        if (mounted) {
          if (res.ok) {
            const propias = (res.data || []).filter((f) => f?.usuario_id === usuario.id)
            setMisFiguras(propias)
          }
          setCargandoMisFiguras(false)
        }
      })
    }
    return () => { mounted = false }
  }, [isAuthenticated, usuario])

  if (!isAuthenticated) return <p>Debes iniciar sesión para ver tu perfil.</p>

  return (
    <section>
      <h1 className="text-2xl font-bold">Mi perfil</h1>
      {cargandoPerfil ? (
        <div className="mt-4 rounded-xl border bg-white/70 p-5 animate-pulse">
          <div className="grid grid-cols-[112px_1fr] sm:grid-cols-[128px_1fr] gap-6 w-full">
            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-gray-200" />
            <div className="space-y-4">
              <div className="h-7 w-full bg-gray-200 rounded" />
              <div className="h-5 w-3/4 bg-gray-200 rounded" />
              <div className="h-5 w-2/3 bg-gray-100 rounded" />
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <div className="h-11 w-56 bg-gray-200 rounded" />
            <div className="h-10 w-40 bg-gray-200 rounded" />
          </div>
        </div>
      ) : detalles ? (
        <div className="mt-4 rounded-lg border bg-white p-4">
          <div className="flex items-center gap-4">
            <img src={resolveMediaUrl(detalles.foto_perfil) || '/default-avatar.svg'} alt="Foto de perfil" className="h-16 w-16 rounded-full object-cover border" onError={(e) => { e.currentTarget.src = '/default-avatar.svg' }} />
            <div>
              <p className="text-lg font-semibold">{detalles.nombre}</p>
              <p className="text-gray-600">{detalles.email}</p>
              {detalles.fecha_registro && (
                <p className="text-xs text-gray-500">Registro: {new Date(detalles.fecha_registro).toLocaleDateString()}</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <a
              href="/perfil/editar"
              className="inline-flex items-center gap-2 rounded-md border-2 border-brand text-brand px-3 py-1.5 font-semibold hover:bg-brand hover:text-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
              </svg>
              Editar perfil
            </a>
            <div className="mt-3 md:hidden">
              <button
                type="button"
                onClick={() => { logout(); navigate('/') }}
                className="inline-flex items-center gap-2 h-10 rounded-md border px-3 bg-red-600 text-white hover:bg-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M16 17v2H4V5h12v2h2V5a2 2 0 00-2-2H4a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2v-2h-2zm-1-6l-4-4v3H20v2H11v3l4-4z"/></svg>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-gray-600">No se pudo cargar el perfil.</p>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Mis figuras publicadas</h2>
        {cargandoMisFiguras ? (
          <div className="mt-4 bg-white/70 rounded-xl p-3 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-white p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 sm:h-28 sm:w-28 bg-gray-200 rounded" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-3/4 bg-gray-200 rounded" />
                    <div className="h-4 w-1/2 bg-gray-100 rounded" />
                    <div className="h-10 w-40 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : misFiguras.length === 0 ? (
          <p className="mt-2 text-gray-600">No tienes figuras publicadas.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
            {misFigurasOrdenadas.map((f) => (
              <div key={f.id} className="space-y-2">
                <TarjetaFigura
                  figura={f}
                  showVisibilityControl
                  onToggleDisponible={async (fig) => {
                    const nuevo = !fig.disponible
                    const res = await actualizarFigura(fig.id, { disponible: nuevo })
                    if (res?.ok) {
                      setMisFiguras((prev) => prev.map((x) => x.id === fig.id ? { ...x, disponible: nuevo } : x))
                    }
                  }}
                  showOwnerActions
                  onEdit={(fig) => { window.location.href = `/producto/${fig.id}?edit=1` }}
                  onDelete={async (fig) => {
                    const ok = confirm('¿Seguro que deseas eliminar esta figura? Esta acción no se puede deshacer.')
                    if (!ok) return
                    const res = await borrarFigura(fig.id)
                    if (res?.ok || res?.status === 204) {
                      setMisFiguras((prev) => prev.filter((x) => x.id !== fig.id))
                    } else {
                      alert('No se pudo eliminar la figura.')
                    }
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      
    </section>
  )
}