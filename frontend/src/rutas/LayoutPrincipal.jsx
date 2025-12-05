import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, NavLink, useNavigate } from 'react-router-dom'
import { Encabezado } from '../componentes/Encabezado.jsx'
import { PieDePagina } from '../componentes/PieDePagina.jsx'
import { useAuth } from '../contextos/ProveedorAuth.jsx'
import { useFavoritos } from '../contextos/ProveedorFavoritos.jsx'
import { getMensajes } from '../servicios/mensajes.js'

export function LayoutPrincipal() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, usuario } = useAuth()
  const { favoritos } = useFavoritos()
  const itemsCount = (favoritos || []).length
  const [unreadCount, setUnreadCount] = useState(0)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])
  useEffect(() => {
    const refresh = async () => {
      const authOk = isAuthenticated && !!usuario?.id
      if (!authOk) { setUnreadCount(0); return }
      const res = await getMensajes()
      if (res?.ok) {
        const noLeidos = (res.data || []).filter((m) => m.receptor_id === usuario.id && !m.leido)
        setUnreadCount(noLeidos.length)
      } else {
        setUnreadCount(0)
      }
    }
    refresh()
  }, [isAuthenticated, usuario?.id])
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Encabezado />
      <main className="flex-1 container-base py-6 md:pb-6 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
      {/* Barra inferior móvil sticky */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-[70] bg-white border-t shadow h-16" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <nav className="grid grid-cols-5 text-xs">
          <NavLink to="/catalogo" className={({isActive}) => `flex items-center justify-center gap-1 py-3 ${isActive ? 'text-brand' : 'text-gray-700'}`} aria-label="Catálogo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8"><path d="M3 3h8v8H3z" /><path d="M13 3h8v8h-8z" /><path d="M3 13h8v8H3z" /><path d="M13 13h8v8h-8z" /></svg>
          </NavLink>
          <NavLink to="/noticias" className={({isActive}) => `flex items-center justify-center gap-1 py-3 ${isActive ? 'text-brand' : 'text-gray-700'}`} aria-label="Noticias">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8"><path d="M6 2h8l4 4v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" /><path d="M14 2v4h4" /></svg>
          </NavLink>
          <NavLink to="/vender" onClick={(e) => { if (!isAuthenticated) { e.preventDefault(); navigate('/login') } }} className={({isActive}) => `flex items-center justify-center gap-1 py-3 ${isActive ? 'text-brand' : 'text-gray-700'}`} aria-label="Publicar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-8 w-8"><circle cx="12" cy="12" r="9" fill="#FECE00" /><path d="M12 8v8M8 12h8" stroke="#000" strokeWidth="2" strokeLinecap="round" /></svg>
          </NavLink>
          <NavLink
            to="/seguimiento"
            onClick={(e) => { if (!isAuthenticated || !usuario?.id) { e.preventDefault(); navigate('/login') } }}
            className={({isActive}) => `relative flex items-center justify-center py-3 ${isActive ? 'text-brand' : 'text-gray-700'}`}
            aria-label="Seguimiento"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8"><path d="M6 2a2 2 0 00-2 2v18l8-4 8 4V4a2 2 0 00-2-2H6z" /></svg>
          </NavLink>
          <button type="button" onClick={() => { if (!isAuthenticated || !usuario?.id) { navigate('/login') } else { window.dispatchEvent(new Event('figumarket:openMessages')) } }} className="flex items-center justify-center py-3 text-gray-700" aria-label="Mensajes">
            <span className="relative inline-block h-8 w-8">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm-1.4 3l-6.6 4.15L5.4 7H18.6zM4 18V8.08l8 5.02 8-5.02V18H4z"/></svg>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 min-w-[18px] h-5 px-1 rounded-full bg-red-500 ring-2 ring-white text-white text-[10px] font-semibold flex items-center justify-center">{unreadCount}</span>
              )}
            </span>
          </button>
        </nav>
      </div>
      <PieDePagina />
    </div>
  )
}
