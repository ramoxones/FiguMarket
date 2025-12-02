import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getFiguras, getFigurasMetadata } from '../servicios/figuras.js'
import { TarjetaFigura } from '../componentes/TarjetaFigura.jsx'
import { FiltrosCatalogo } from '../componentes/FiltrosCatalogo.jsx'
import { getSeguimientoCounts } from '../servicios/seguimientos.js'

export function PaginaCatalogo() {
  useEffect(() => { document.title = 'FiguMarket - Catálogo' }, [])
  const [figuras, setFiguras] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtros, setFiltros] = useState({ escala: [], categoria: [], estado: [], estado_figura: [], precioRango: null, precioMin: null, precioMax: null, fecha: null, fechaDia: null })
  const { search } = useLocation()
  const [ordenPrecio, setOrdenPrecio] = useState(null) // 'asc' | 'desc' | null
  const [ordenFecha, setOrdenFecha] = useState(null) // 'newest' | 'oldest' | null
  const [bgShift, setBgShift] = useState(0)
  const parsePrecioNum = (val) => {
    const s = String(val ?? '').trim()
    if (!s) return 0
    let t = s.replace(/[^\d.,-]/g, '')
    if (t.includes('.') && t.includes(',')) {
      t = t.replace(/\./g, '').replace(',', '.')
    } else if (t.includes(',')) {
      t = t.replace(',', '.')
    }
    const n = parseFloat(t)
    return isNaN(n) ? 0 : n
  }

  // Scroll infinito (paginación desde backend)
  const PAGE_SIZE = 24
  const [offset, setOffset] = useState(0)
  const [cargandoMas, setCargandoMas] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const loadMoreRef = useRef(null)
  const [meta, setMeta] = useState({ min_precio: null, max_precio: null, meses: [] })
  const [backendReady, setBackendReady] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [seguimientosMap, setSeguimientosMap] = useState({})
  const fetchingRef = useRef(false)
  const buildParams = (nextOffset) => {
    const params = { limit: PAGE_SIZE, offset: nextOffset }
    if (Array.isArray(filtros.escala) && filtros.escala.length) params.escala = filtros.escala
    if (Array.isArray(filtros.categoria) && filtros.categoria.length) params.categoria = filtros.categoria
    if (Array.isArray(filtros.estado) && filtros.estado.length) params.estado = filtros.estado
    if (Array.isArray(filtros.estado_figura) && filtros.estado_figura.length) params.estado_figura = filtros.estado_figura
    if (typeof filtros.precioRango === 'string') {
      const val = filtros.precioRango
      if (val.endsWith('+')) {
        const min = parseFloat(val.replace('+',''))
        if (!isNaN(min)) params.precioMin = min
      } else if (val.includes('-')) {
        const [a,b] = val.split('-')
        const min = parseFloat(a); const max = parseFloat(b)
        if (!isNaN(min)) params.precioMin = min
        if (!isNaN(max)) params.precioMax = max
      }
    } else {
      if (typeof filtros.precioMin === 'number') params.precioMin = filtros.precioMin
      if (typeof filtros.precioMax === 'number') {
        const mx = filtros.precioMax >= 500 ? undefined : filtros.precioMax
        if (typeof mx === 'number') params.precioMax = mx
      }
    }
    if (typeof filtros.fechaDia === 'string' && filtros.fechaDia) params.fechaDia = filtros.fechaDia
    else if (typeof filtros.fecha === 'string' && filtros.fecha) params.fecha = filtros.fecha
    if (ordenPrecio) params.ordenPrecio = ordenPrecio
    if (ordenFecha) params.ordenFecha = ordenFecha
    return params
  }
  const loadPage = async (nextOffset) => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    const res = await getFiguras(buildParams(nextOffset))
    if (res?.ok) {
      const nuevos = Array.isArray(res.data) ? res.data : []
      setFiguras((prev) => {
        const ids = new Set(prev.map((x) => x.id))
        const uniques = nuevos.filter((x) => !ids.has(x.id))
        return [...prev, ...uniques]
      })
      setOffset(nextOffset + nuevos.length)
      setHasMore(nuevos.length === PAGE_SIZE)
      const ids = nuevos.map((f) => f.id)
      if (ids.length) {
        getSeguimientoCounts(ids)
          .then((counts) => {
            if (counts?.ok && typeof counts.data === 'object') {
              setSeguimientosMap((prev) => ({ ...prev, ...counts.data }))
            }
          })
          .catch(() => {})
      }
    } else {
      setHasMore(false)
    }
    fetchingRef.current = false
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
      let ok = false
      for (let i = 0; i < 30; i++) {
        const m = await getFigurasMetadata()
        if (m?.ok) {
          if (mounted) {
            setMeta(m.data || { min_precio: null, max_precio: null, meses: [] })
            setBackendReady(true)
          }
          ok = true
          break
        }
        await sleep(2000)
      }
      if (ok) {
        await loadPage(0)
        if (mounted) setCargando(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (cargando) return
    const fillIfTooShort = async () => {
      const docH = document.documentElement.scrollHeight
      const winH = window.innerHeight
      if (hasMore && !cargandoMas && docH <= winH + 100) {
        setCargandoMas(true)
        await loadPage(offset)
        setCargandoMas(false)
      }
    }
    fillIfTooShort()
  }, [cargando, hasMore, offset])

  useEffect(() => {
    const update = () => {
      setBgShift(window.innerWidth >= 768 ? 142 : 0)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(search)
    const cat = (params.get('categoria') || '').toLowerCase()
    if (cat) {
      setFiltros((prev) => ({ ...prev, categoria: [cat] }))
    }
  }, [search])

  const opciones = useMemo(() => {
    const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)))
    // Escalas: lista fija solicitada
    const escalas = [
      { value: '1:10', label: '1:10' },
      { value: '1:4', label: '1:4' },
      { value: '1:12', label: '1:12' },
      { value: '1:6', label: '1:6' },
      { value: 'otros', label: 'Otros' },
    ]
    // Categorías: lista estándar incluyendo Star Wars
    const categorias = [
      { value: 'anime', label: 'Anime' },
      { value: 'peliculas', label: 'Películas' },
      { value: 'marvel', label: 'Marvel' },
      { value: 'dc', label: 'DC' },
      { value: 'videojuegos', label: 'Videojuegos' },
      { value: 'comics', label: 'Cómics' },
      { value: 'star wars', label: 'Star Wars' },
      { value: 'otros', label: 'Otros' },
    ]
    // Estados de publicación: opciones fijas
    const estados = [
      { value: 'disponible', label: 'Disponible' },
      { value: 'en negociación', label: 'En negociación' },
    ]
    // Estado de figura (condición): lista fija
    const estadosFigura = [
      { value: 'sin abrir', label: 'Sin abrir' },
      { value: 'como nueva', label: 'Como nueva' },
      { value: 'en buen estado', label: 'En buen estado' },
      { value: 'en mal estado', label: 'En mal estado' },
    ]

    let precios = []
    const min = parseFloat(meta.min_precio || '0')
    const max = parseFloat(meta.max_precio || '0')
    if (!isNaN(min) && !isNaN(max) && max > 0) {
      const buckets = 5
      const step = (max - min) / buckets || max
      for (let i = 0; i < buckets; i++) {
        const from = min + i * step
        const to = i === buckets - 1 ? max : (min + (i + 1) * step)
        const f = Math.floor(from)
        const t = Math.ceil(to)
        precios.push({ value: `${f}-${t}`, label: `${f} - ${t}€` })
      }
      precios = uniq(precios.map((p) => p.label)).map((label) => {
        const [f, t] = label.replace('€', '').split(' - ').map((x) => parseFloat(x))
        return { value: `${f}-${t}`, label }
      })
    }
    precios.push({ value: '500+', label: '500+ €' })

    const fechas = (meta.meses || [])
      .map((ym) => {
        const [y, m] = String(ym).split('-')
        const date = new Date(parseInt(y), parseInt(m) - 1, 1)
        const label = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        const labelCap = label.charAt(0).toUpperCase() + label.slice(1)
        return { value: ym, label: labelCap }
      })
      .sort((a, b) => (a.value < b.value ? 1 : -1))

    const precioMinBase = 1
    const precioMaxBase = 500
    return { escalas, categorias, estados, estadosFigura, precios, fechas, precioMinBase, precioMaxBase }
  }, [meta])

  const figurasFiltradas = useMemo(() => figuras, [figuras])

  // Items visibles y estado de "hay más"
  

  useEffect(() => {
    setFiguras([])
    setOffset(0)
    setHasMore(true)
    setCargando(true)
    ;(async () => {
      await loadPage(0)
      setCargando(false)
    })()
  }, [filtros, ordenPrecio, ordenFecha])

  // Observer para cargar más desde backend cuando el sentinel entra en viewport
  useEffect(() => {
    if (cargando) return
    const el = loadMoreRef.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry.isIntersecting) {
        if (hasMore && !cargandoMas && !fetchingRef.current) {
          setCargandoMas(true)
          ;(async () => {
            await loadPage(offset)
            setCargandoMas(false)
          })()
        }
      }
    }, { root: null, rootMargin: '600px 0px', threshold: 0 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, cargandoMas, offset, cargando])

  const handleToggle = (field, value) => {
    const MULTI_FIELDS = ['escala', 'categoria', 'estado', 'estado_figura']
    setFiltros((prev) => {
      if (MULTI_FIELDS.includes(field)) {
        const curr = Array.isArray(prev[field]) ? prev[field] : []
        const exists = curr.includes(value)
        const next = exists ? curr.filter((v) => v !== value) : [...curr, value]
        return { ...prev, [field]: next }
      }
      return { ...prev, [field]: value }
    })
  }
  const handleReset = () => setFiltros({ escala: [], categoria: [], estado: [], estado_figura: [], precioRango: null, precioMin: null, precioMax: null, fecha: null, fechaDia: null })
  const handleChangePrecio = (min, max) => {
    setFiltros((prev) => ({ ...prev, precioMin: min, precioMax: max, precioRango: null }))
  }
  const handleChangeFecha = (dia) => {
    setFiltros((prev) => ({ ...prev, fechaDia: dia, fecha: null }))
  }

  return (
    <section>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <div>
          <FiltrosCatalogo opciones={opciones} filtros={filtros} onToggle={handleToggle} onReset={handleReset} precioMinBase={opciones.precioMinBase} precioMaxBase={opciones.precioMaxBase} onChangePrecio={handleChangePrecio} onChangeFecha={handleChangeFecha} />
        </div>
        <div>
          {/* Ordenación: izquierda precio, derecha fecha */}
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              aria-pressed={!!ordenPrecio}
              onClick={() => { setOrdenPrecio((prev) => (prev === 'desc' ? 'asc' : 'desc')); setOrdenFecha(null) }}
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${ordenPrecio ? 'bg-brand text-white hover:opacity-90 border-brand' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              title="Ordenar por precio"
            >
              {/* Icono euro */}
              <span className="h-4 w-4 inline-flex items-center justify-center text-current font-semibold">€</span>
              {ordenPrecio === 'asc' ? (
                <span className="inline-flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M12 19l-5-5h10l-5 5z" />
                  </svg>
                  <span>Más baratas</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M12 5l5 5H7l5-5z" />
                  </svg>
                  <span>Más caras</span>
                </span>
              )}
            </button>
            <button
              type="button"
              aria-pressed={!!ordenFecha}
              onClick={() => { setOrdenFecha((prev) => (prev === 'oldest' ? 'newest' : 'oldest')); setOrdenPrecio(null) }}
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${ordenFecha ? 'bg-brand text-white hover:opacity-90 border-brand' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              title="Ordenar por fecha"
            >
              {/* Icono calendario + dirección */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {ordenFecha === 'oldest' ? (
                <span className="inline-flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M12 19l-5-5h10l-5 5z" />
                  </svg>
                  <span>Más antiguas</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M12 5l5 5H7l5-5z" />
                  </svg>
                  <span>Más recientes</span>
                </span>
              )}
            </button>
          </div>
          {cargando ? (
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6 bg-white/70 rounded-xl p-2"
              aria-busy="true" aria-live="polite"
              style={{
                backgroundImage: "url('/fondo.png')",
                backgroundAttachment: 'fixed',
                backgroundPosition: `${bgShift ? `calc(50% + ${bgShift}px)` : '50%'} center`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '240px'
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-white p-3 animate-pulse">
                  <div className="h-40 w-full bg-gray-200 rounded" />
                  <div className="mt-3 h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="mt-2 h-3 w-1/2 bg-gray-200 rounded" />
                  <div className="mt-4 h-6 w-24 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : (figurasFiltradas.length === 0 && !hasMore && offset === 0) ? (
            <p className="text-gray-600">No hay figuras para mostrar.</p>
          ) : (
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6 bg-white/70 rounded-xl p-2"
              style={{
                backgroundImage: "url('/fondo.png')",
                backgroundAttachment: 'fixed',
                backgroundPosition: `${bgShift ? `calc(50% + ${bgShift}px)` : '50%'} center`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '240px'
              }}
            >
              {figurasFiltradas.map((f) => (
                <TarjetaFigura key={f.id} figura={f} seguimientoCount={Number(seguimientosMap?.[f.id] || 0)} />
              ))}
              {cargandoMas && hasMore && Array.from({ length: 8 }).map((_, i) => (
                <div key={`sk-${i}`} className="rounded-lg border bg-white p-3 animate-pulse">
                  <div className="h-40 w-full bg-gray-200 rounded" />
                  <div className="mt-3 h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="mt-2 h-3 w-1/2 bg-gray-200 rounded" />
                  <div className="mt-4 h-6 w-24 bg-gray-200 rounded" />
                </div>
              ))}
              <div ref={loadMoreRef} className="col-span-full h-1" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
