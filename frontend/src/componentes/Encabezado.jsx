import React, { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contextos/ProveedorAuth.jsx'
import { MensajesPanel } from './MensajesPanel.jsx'
import { getFiguras } from '../servicios/figuras.js'
import { getMensajes } from '../servicios/mensajes.js'
import { createPortal } from 'react-dom'
import { useFavoritos } from '../contextos/ProveedorFavoritos.jsx'
import { resolveMediaUrl } from '../utils/media.js'

export function Encabezado() {
  const { isAuthenticated, usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [mostrarMensajes, setMostrarMensajes] = useState(false)
  const { favoritos } = useFavoritos()
  const itemsCount = (favoritos || []).length
  // Estado del buscador
  const [q, setQ] = useState('')
  const [figuras, setFiguras] = useState([])
  const [resultados, setResultados] = useState([])
  const [abierto, setAbierto] = useState(false)
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false) // móvil: panel desplegable
  const searchRef = useRef(null) // referencia común para detectar clic fuera
  const toggleSearchRef = useRef(null)
  // Indicador de mensajes no leídos
  const [unreadCount, setUnreadCount] = useState(0)
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)

  // Cargar/actualizar figuras cuando se abre el buscador
  useEffect(() => {
    let mounted = true
    if (abierto) {
      getFiguras().then((res) => {
        if (mounted && res.ok) setFiguras(res.data || [])
      })
    }
    return () => { mounted = false }
  }, [abierto])

  // Filtrar conforme se escribe
  useEffect(() => {
    const term = q.trim().toLowerCase()
    if (!term) { setResultados([]); return }
    const isVisible = (f) => {
      const v = f?.disponible
      if (typeof v === 'boolean') return v
      if (typeof v === 'number') return v !== 0
      const s = String(v ?? '').trim().toLowerCase()
      if (!s) return true
      return !(['false', '0', 'no', 'off'].includes(s))
    }
    const filtrados = (figuras || []).filter((f) => {
      const nombre = (f?.nombre || '').toLowerCase()
      const descripcion = (f?.descripcion || '').toLowerCase()
      return (nombre.includes(term) || descripcion.includes(term)) && isVisible(f)
    }).slice(0, 10)
    setResultados(filtrados)
  }, [q, figuras])

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    const onClick = (e) => {
      const clickedInSearch = searchRef.current && searchRef.current.contains(e.target)
      const clickedInToggle = toggleSearchRef.current && toggleSearchRef.current.contains(e.target)
      if (!clickedInSearch && !clickedInToggle) {
        setAbierto(false)
        setMostrarBusqueda(false)
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // Contar mensajes no leídos para el usuario autenticado
  const refreshUnread = async () => {
    const authOk = isAuthenticated && !!usuario?.id
    if (!authOk) { setUnreadCount(0); return }
    const res = await getMensajes()
    if (res.ok) {
      const noLeidos = (res.data || []).filter(
        (m) => m.receptor_id === usuario.id && !m.leido
      )
      setUnreadCount(noLeidos.length)
    } else {
      setUnreadCount(0)
    }
  }

  useEffect(() => {
    let mounted = true
    const run = async () => { if (mounted) await refreshUnread() }
    run()
    return () => { mounted = false }
  }, [isAuthenticated, usuario?.id])

  useEffect(() => {
    const handler = () => setMostrarMensajes(true)
    window.addEventListener('figumarket:openMessages', handler)
    return () => window.removeEventListener('figumarket:openMessages', handler)
  }, [])

  const seleccionarProducto = (id) => {
    setAbierto(false)
    setQ('')
    setResultados([])
    navigate(`/producto/${id}`)
  }
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Fila superior */}
        <div className="relative h-[72px] w-full flex items-center justify-between">
          {/* Logo izquierda */}
          <Link to="/" className="flex items-center h-full">
            <img src="/logo.png" alt="FiguMarket logo" className="h-full w-[9rem] sm:w-[11rem] object-contain" />
          </Link>

          {/* Navegación (desktop) centrada sin posición absoluta para evitar solapes */}
          <nav className="hidden md:flex flex-1 justify-center items-center gap-3 text-sm min-w-0">
            <NavLink to="/catalogo" aria-label="Catálogo" className={({isActive}) => `inline-flex items-center gap-2 h-10 rounded-md px-3 border shadow-sm transition ${isActive ? 'border-brand text-brand font-semibold' : ''} hover:border-brand hover:text-brand hover:shadow-md`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M3 3h8v8H3z" />
                <path d="M13 3h8v8h-8z" />
                <path d="M3 13h8v8H3z" />
                <path d="M13 13h8v8h-8z" />
              </svg>
              <span className="hidden xl:inline">Catálogo</span>
            </NavLink>
            <NavLink to="/noticias" aria-label="Noticias" className={({isActive}) => `inline-flex items-center gap-2 h-10 rounded-md px-3 border shadow-sm transition ${isActive ? 'border-brand text-brand font-semibold' : ''} hover:border-brand hover:text-brand hover:shadow-md`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M6 2h8l4 4v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" />
                <path d="M14 2v4h4" />
              </svg>
              <span className="hidden xl:inline">Noticias</span>
            </NavLink>
            <NavLink
              to="/vender"
              onClick={(e) => { if (!isAuthenticated) { e.preventDefault(); navigate('/login') } }}
              className={({isActive}) => `inline-flex items-center gap-2 h-10 rounded-md px-4 text-sm font-semibold bg-[#FECE00] text-black shadow-md hover:shadow-lg whitespace-nowrap`}
              aria-label="Publicar Figura"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="white" />
                <path d="M12 8v8M8 12h8" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Publicar Figura</span>
            </NavLink>
            {isAuthenticated && !!usuario?.id && (
              <NavLink to="/seguimiento" aria-label="Seguimiento" className={({isActive}) => `inline-flex items-center gap-2 h-10 rounded-md px-3 border shadow-sm transition ${isActive ? 'border-brand text-brand font-semibold' : ''} hover:border-brand hover:text-brand hover:shadow-md whitespace-nowrap`}>
                <span className="inline-flex items-center justify-center rounded-full bg-brand text-white text-xs h-5 min-w-[20px] px-1">{itemsCount}</span>
                <span className="hidden xl:inline">Seguimiento</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M6 2a2 2 0 00-2 2v18l8-4 8 4V4a2 2 0 00-2-2H6z"/></svg>
              </NavLink>
            )}
            {isAuthenticated && !!usuario?.id && (
              <button onClick={() => setMostrarMensajes(true)} className="relative inline-flex items-center gap-2 h-10 rounded-md px-3 border shadow-sm transition hover:border-brand hover:text-brand hover:shadow-md whitespace-nowrap" aria-label="Mensajes">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm-1.4 3l-6.6 4.15L5.4 7H18.6zM4 18V8.08l8 5.02 8-5.02V18H4z"/></svg>
                <span className="hidden xl:inline">Mensajes</span>
                {unreadCount > 0 && (
                  <span
                    title={`${unreadCount} mensaje(s) sin leer`}
                    className="absolute -top-1 -right-1 min-w-[18px] h-5 px-1 rounded-full bg-red-500 ring-2 ring-white text-white text-[10px] font-semibold flex items-center justify-center"
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* Derecha: búsqueda móvil y usuario */}
          <div className="flex items-center gap-3">
          {/* Botón buscador (móvil) */}
          <button
            type="button"
            ref={toggleSearchRef}
            onClick={() => setMostrarBusqueda((v) => !v)}
            aria-label="Abrir buscador"
            className="inline-flex md:hidden items-center justify-center h-10 w-10 rounded-md border shadow-sm hover:bg-gray-100 hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z"/></svg>
          </button>
          {/* Avatar móvil: navega a perfil/login */}
          <button
            type="button"
            className="inline-flex md:hidden items-center justify-center h-10 w-10 rounded-full border shadow-sm overflow-hidden"
            aria-label="Ir a mi perfil"
            onClick={() => { if (isAuthenticated) navigate('/perfil'); else navigate('/login') }}
          >
            {isAuthenticated ? (
              <img src={resolveMediaUrl(usuario?.foto_perfil) || '/default-avatar.svg'} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = '/default-avatar.svg' }} />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 6v2h16v-2c0-3.33-2.67-6-8-6z"/></svg>
            )}
          </button>
            {/* Avatar/menu (móvil) oculto: se usa barra inferior */}
            {/* Perfil/Logout (desktop) */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/perfil" className="flex items-center gap-2 hover:text-brand">
                    <img
                      src={resolveMediaUrl(usuario?.foto_perfil) || '/default-avatar.svg'}
                      alt="Foto de perfil"
                      className="h-9 w-9 rounded-full object-cover border"
                      onError={(e) => { e.currentTarget.src = '/default-avatar.svg' }}
                    />
                    <span className="hidden xl:inline">{usuario?.nombre || 'Perfil'}</span>
                  </Link>
                  <button aria-label="Cerrar sesión" onClick={() => { logout(); navigate('/') }} className="inline-flex items-center gap-2 h-10 rounded-md px-3 border text-gray-700 shadow-sm hover:shadow-md hover:bg-red-600 hover:text-white hover:border-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M16 17v2H4V5h12v2h2V5a2 2 0 00-2-2H4a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2v-2h-2zm-1-6l-4-4v3H20v2H11v3l4-4z"/></svg>
                    <span className="hidden xl:inline">Cerrar sesión</span>
                  </button>
                </>
              ) : (
                <Link to="/login" className="inline-flex items-center gap-2 h-10 rounded-md px-3 border shadow-sm hover:shadow-md hover:bg-brand hover:text-white" aria-label="Ir a Login">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 6v2h16v-2c0-3.33-2.67-6-8-6z"/></svg>
                  <span className="hidden xl:inline">Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Fila inferior: Buscador centrado (desktop) */}
        <div className="hidden md:flex items-center justify-center pb-3">
          <div ref={searchRef} className="relative w-full max-w-[32rem]">
            <input
              type="text"
              value={q}
              onChange={(e) => { setQ(e.target.value); setAbierto(true) }}
              onFocus={() => setAbierto(true)}
              onKeyDown={(e) => { if (e.key === 'Enter' && q.trim()) { setAbierto(false); navigate(`/buscar?q=${encodeURIComponent(q.trim())}`) } }}
              placeholder="Buscar figuras..."
              aria-label="Buscar"
              className="w-full h-11 rounded-full border-2 border-brand/50 bg-white px-4 pr-12 shadow-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand hover:border-brand transition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand/70 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z"/></svg>
            </span>
            {abierto && resultados.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 rounded-lg border bg-white shadow-xl max-h-[60vh] overflow-auto z-50">
                <ul>
                  {resultados.map((f) => (
                    <li key={f.id}>
                      <button
                        className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-gray-100"
                        onClick={() => seleccionarProducto(f.id)}
                      >
                        <img src={resolveMediaUrl(f.imagenes?.[0]?.url) || 'https://via.placeholder.com/40?text=🧩'} alt="" className="h-10 w-10 rounded border object-cover" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/40?text=🧩' }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{f.nombre}</p>
                          <p className="text-xs text-gray-500 truncate">{f.descripcion}</p>
                        </div>
                        <span className="text-sm font-semibold text-brand">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(f.precio || 0))}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra inferior móvil gestionada desde el layout principal */}

      {/* Panel desplegable (móvil) debajo del navbar */}
      {mostrarBusqueda && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-3">
            <div ref={searchRef} className="relative mx-auto w-full">
              <input
                type="text"
                value={q}
                onChange={(e) => { setQ(e.target.value); setAbierto(true) }}
                onFocus={() => setAbierto(true)}
                onKeyDown={(e) => { if (e.key === 'Enter' && q.trim()) { setAbierto(false); setMostrarBusqueda(false); navigate(`/buscar?q=${encodeURIComponent(q.trim())}`) } }}
                placeholder="Buscar figuras..."
                aria-label="Buscar"
                className="w-full h-11 rounded-full border-2 border-brand/50 bg-white px-4 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand hover:border-brand transition"
              />
              {abierto && resultados.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 rounded-lg border bg-white shadow-xl max-h-[60vh] overflow-auto z-50">
                  <ul>
                    {resultados.map((f) => (
                      <li key={f.id}>
                        <button
                          className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-gray-100"
                          onClick={() => seleccionarProducto(f.id)}
                        >
                          <img src={resolveMediaUrl(f.imagenes?.[0]?.url) || 'https://via.placeholder.com/40?text=🧩'} alt="" className="h-10 w-10 rounded border object-cover" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/40?text=🧩' }} />
                          <div className="flex-1">
                            <p className="font-medium truncate">{f.nombre}</p>
                            <p className="text-xs text-gray-500 truncate">{f.descripcion}</p>
                          </div>
                          <span className="text-sm font-semibold text-brand">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(f.precio || 0))}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAuthenticated && !!usuario?.id && mostrarMensajes && createPortal(
        <MensajesPanel onClose={() => { setMostrarMensajes(false); refreshUnread() }} />,
        document.body
      )}
    </header>
  )
}
