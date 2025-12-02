import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getFiguras } from '../servicios/figuras.js'
import { getSeguimientoCounts } from '../servicios/seguimientos.js'
import { TarjetaFigura } from '../componentes/TarjetaFigura.jsx'

export function PaginaBusqueda() {
  const [params] = useSearchParams()
  const q = (params.get('q') || '').trim()
  const [figuras, setFiguras] = useState([])
  const [cargando, setCargando] = useState(true)
  const [seguimientosMap, setSeguimientosMap] = useState({})

  useEffect(() => { document.title = q ? `FiguMarket - Búsqueda: ${q}` : 'FiguMarket - Búsqueda' }, [q])

  useEffect(() => {
    let mounted = true
    getFiguras().then((res) => {
      if (mounted && res.ok) setFiguras(res.data || [])
      if (mounted) setCargando(false)
    })
    return () => { mounted = false }
  }, [])

  const resultados = useMemo(() => {
    const term = q.toLowerCase()
    if (!term) return []
    const isVisible = (f) => {
      const v = f?.disponible
      if (typeof v === 'boolean') return v
      if (typeof v === 'number') return v !== 0
      const s = String(v ?? '').trim().toLowerCase()
      if (!s) return true
      return !(['false', '0', 'no', 'off'].includes(s))
    }
    return (figuras || []).filter((f) => {
      const nombre = (f?.nombre || '').toLowerCase()
      const descripcion = (f?.descripcion || '').toLowerCase()
      return (nombre.includes(term) || descripcion.includes(term)) && isVisible(f)
    })
  }, [figuras, q])

  useEffect(() => {
    if (cargando) return
    const ids = resultados.map((f) => f.id)
    if (!ids.length) { setSeguimientosMap({}); return }
    let active = true
    ;(async () => {
      try {
        const res = await getSeguimientoCounts(ids)
        if (active && res?.ok && typeof res.data === 'object') setSeguimientosMap(res.data)
      } catch { if (active) setSeguimientosMap({}) }
    })()
    return () => { active = false }
  }, [resultados, cargando])

  return (
    <section>
      <h1 className="text-2xl font-bold">Resultados de búsqueda</h1>
      <p className="mt-2 text-gray-600">Término: "{q}"</p>
      {cargando && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 bg-white/70 rounded-xl p-2" aria-busy="true" aria-live="polite">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-white p-3 animate-pulse">
              <div className="h-40 w-full bg-gray-200 rounded" />
              <div className="mt-3 h-4 w-3/4 bg-gray-200 rounded" />
              <div className="mt-2 h-3 w-1/2 bg-gray-200 rounded" />
              <div className="mt-4 h-6 w-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      )}
      {!cargando && q && resultados.length === 0 && (
        <p className="mt-6 text-gray-600">No hay resultados para tu búsqueda.</p>
      )}
      {!cargando && resultados.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {resultados.map((f) => (
            <TarjetaFigura key={f.id} figura={f} seguimientoCount={Number(seguimientosMap?.[f.id] || 0)} />
          ))}
        </div>
      )}
    </section>
  )
}