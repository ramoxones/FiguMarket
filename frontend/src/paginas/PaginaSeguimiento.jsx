import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFavoritos } from '../contextos/ProveedorFavoritos.jsx'
import { resolveMediaUrl } from '../utils/media.js'
import { Boton } from '../componentes/Boton.jsx'
import { formatCurrencyEUR } from '../utils/index.js'
import { getFigura } from '../servicios/figuras.js'

export function PaginaSeguimiento() {
  const { favoritos, toggle } = useFavoritos()
  const navigate = useNavigate()
  const [detalles, setDetalles] = useState([])
  const [cargando, setCargando] = useState(false)
  useEffect(() => { document.title = 'FiguMarket - Seguimientos' }, [])

  const irADetalle = (id) => navigate(`/producto/${id}`)

  // Clase por estado (badge de color)
  const norm = (s) => (s || '').toString().trim().toLowerCase()
  const estadoClase = (e) => {
    const v = norm(e)
    if (!v) return 'bg-gray-100 text-gray-700 border border-gray-200'
    // Tolerancia a variantes: sin acento y abreviaciones
    if (v.includes('vendid')) return 'bg-red-100 text-red-800 border border-red-200'
    if (v.includes('negoci')) return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
    if (v.includes('dispon')) return 'bg-green-100 text-green-800 border border-green-200'
    return 'bg-green-100 text-green-800 border border-green-200'
  }

  // Cargar detalles actuales de cada favorito para mostrar estado real
  useEffect(() => {
    let mounted = true
    const cargar = async () => {
      if (!favoritos || favoritos.length === 0) {
        if (mounted) setDetalles([])
        return
      }
      setCargando(true)
      try {
        const resps = await Promise.all(
          favoritos.map((f) => getFigura(f.id).catch(() => ({ ok: false })))
        )
        const list = resps.map((r, idx) => (r?.ok && r.data) ? r.data : favoritos[idx])
        if (mounted) setDetalles(list)
      } finally {
        if (mounted) setCargando(false)
      }
    }
    cargar()
    return () => { mounted = false }
  }, [favoritos])

  const lista = useMemo(() => (detalles && detalles.length > 0 ? detalles : favoritos), [detalles, favoritos])

  return (
    <section>
      <h1 className="text-2xl font-bold">En seguimiento</h1>
      {cargando ? (
        <div className="mt-6 w-full bg-white">
          {Array.from({ length: Math.max(3, Math.min(8, (favoritos || []).length || 5)) }).map((_, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[160px_1fr] md:grid-cols-[200px_2fr_260px] gap-4 md:gap-6 p-4 items-start border-b last:border-b-0 animate-pulse">
              <div className="h-24 w-[160px] md:h-28 md:w-[200px] rounded border bg-gray-200" />
              <div className="min-w-0 space-y-2">
                <div className="h-5 w-2/3 bg-gray-200 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 rounded" />
                <div className="h-4 w-4/6 bg-gray-200 rounded" />
                <div className="h-6 w-24 bg-gray-300 rounded mt-2" />
                <div className="flex gap-2 mt-3">
                  <div className="h-8 w-28 bg-gray-200 rounded" />
                  <div className="h-8 w-36 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="h-7 w-28 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (!lista || lista.length === 0) ? (
        <p className="mt-4 text-gray-600">No tienes figuras en seguimiento.</p>
      ) : (
        <div className="mt-6 w-full bg-white">
          {lista.map((f) => {
            const img = resolveMediaUrl(f?.imagenes?.[0]?.url) || 'https://via.placeholder.com/160x120?text=Figura'
            const precioNumber = Number(f?.precio || 0)
            const estado = (typeof f?.estado === 'string' && f.estado.trim()) ? f.estado : null
            return (
              <div key={f.id} className="grid grid-cols-1 sm:grid-cols-[160px_1fr] md:grid-cols-[200px_2fr_260px] gap-4 md:gap-6 p-4 items-start border-b last:border-b-0">
                <button className="relative" onClick={() => irADetalle(f.id)}>
                  <img
                    src={img}
                    alt={f.nombre}
                    loading="lazy"
                    className="h-32 w-full sm:h-28 sm:w-[200px] object-contain rounded border bg-white p-1"
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/200x150?text=Figura' }}
                  />
                </button>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold">{f.nombre}</h3>
                  {f.descripcion && <p className="hidden md:block text-sm text-gray-600">{f.descripcion}</p>}
                  <p className="mt-2 text-base text-brand font-semibold">{formatCurrencyEUR(precioNumber)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Boton variant="outline" onClick={() => irADetalle(f.id)}>Ver detalle</Boton>
                    <Boton variant="secondary" onClick={() => toggle(f)}>Quitar seguimiento</Boton>
                  </div>
                </div>
                <div className="mt-2 md:mt-0 flex items-end justify-end md:flex-col gap-2">
                  <span className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-semibold ${estadoClase(estado)}`}>
                    {estado || 'Actualizando…'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}