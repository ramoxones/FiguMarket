import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './ProveedorAuth.jsx'
import { addSeguimiento, getMisSeguimientos, removeSeguimiento } from '../servicios/seguimientos.js'

const FavoritosContext = createContext(null)

export function ProveedorFavoritos({ children }) {
  const { usuario, isAuthenticated } = useAuth()
  const [favoritos, setFavoritos] = useState([])

  useEffect(() => {
    if (!isAuthenticated) { setFavoritos([]); return }
    ;(async () => {
      try {
        const key = usuario?.id ? `favoritos_${usuario.id}` : null
        const cached = (() => {
          try { return key ? JSON.parse(localStorage.getItem(key) || '[]') : [] } catch { return [] }
        })()
        const res = await getMisSeguimientos()
        const serverArr = res?.ok && Array.isArray(res.data)
          ? res.data.map((x) => ({ id: Number(x.figura_id) }))
          : []
        const map = new Map()
        ;[...cached, ...serverArr].forEach((x) => { if (x && typeof x.id === 'number') map.set(x.id, { id: x.id }) })
        const merged = Array.from(map.values())
        setFavoritos(merged)
        if (key) { try { localStorage.setItem(key, JSON.stringify(merged)) } catch {} }
      } catch {
        setFavoritos((prev) => {
          const key = usuario?.id ? `favoritos_${usuario.id}` : null
          if (key) { try { localStorage.setItem(key, JSON.stringify(prev)) } catch {} }
          return prev
        })
      }
    })()
  }, [isAuthenticated, usuario?.id])

  useEffect(() => {
    if (!isAuthenticated) { setFavoritos([]); return }
  }, [isAuthenticated])

  const isFavorito = (id) => favoritos.some((f) => f.id === id)
  const toggle = async (figura) => {
    if (!figura?.id) return
    if (!isAuthenticated) return
    const exists = isFavorito(figura.id)
    try {
      if (exists) {
        const res = await removeSeguimiento(figura.id)
        if (res?.ok) {
          setFavoritos((prev) => {
            const next = prev.filter((f) => f.id !== figura.id)
            const key = usuario?.id ? `favoritos_${usuario.id}` : null
            if (key) { try { localStorage.setItem(key, JSON.stringify(next)) } catch {} }
            return next
          })
          return 'removed'
        }
      } else {
        const res = await addSeguimiento(figura.id)
        if (res?.ok) {
          setFavoritos((prev) => {
            const map = new Map()
            ;[{ id: figura.id }, ...prev].forEach((x) => { if (x && typeof x.id === 'number') map.set(x.id, { id: x.id }) })
            const next = Array.from(map.values())
            const key = usuario?.id ? `favoritos_${usuario.id}` : null
            if (key) { try { localStorage.setItem(key, JSON.stringify(next)) } catch {} }
            return next
          })
          return 'added'
        }
      }
    } catch {}
    return 'error'
  }

  const value = useMemo(() => ({ favoritos, isFavorito, toggle }), [favoritos])
  return <FavoritosContext.Provider value={value}>{children}</FavoritosContext.Provider>
}

export function useFavoritos() {
  const ctx = useContext(FavoritosContext)
  if (!ctx) throw new Error('useFavoritos debe usarse dentro de ProveedorFavoritos')
  return ctx
}