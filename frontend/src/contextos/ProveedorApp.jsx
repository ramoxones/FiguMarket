import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AppContext = createContext(null)

export function ProveedorApp({ children }) {
  const [loading, setLoading] = useState(false)
  const [categorias, setCategorias] = useState(['Anime', 'Videojuegos', 'Películas'])
  useEffect(() => { try { localStorage.removeItem('figumarket_carrito') } catch {} }, [])

  const value = useMemo(() => ({ loading, setLoading, categorias, setCategorias }), [loading, categorias])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de ProveedorApp')
  return ctx
}