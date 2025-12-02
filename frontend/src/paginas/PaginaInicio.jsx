import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFiguras } from '../servicios/figuras.js'
import { getNoticias } from '../servicios/noticias.js'
import { TarjetaFigura } from '../componentes/TarjetaFigura.jsx'
import { getSeguimientoCounts } from '../servicios/seguimientos.js'
import FeaturedSlider from '../componentes/FeaturedSlider.jsx'
import { resolveMediaUrl } from '../utils/media.js'

export function PaginaInicio() {
  const [figuras, setFiguras] = useState([])
  const [cargandoFiguras, setCargandoFiguras] = useState(true)
  const [noticias, setNoticias] = useState([])
  const [visible] = useState(12)
  const loadMoreRef = useRef(null)
  const [isMd, setIsMd] = useState(false)

  useEffect(() => { document.title = 'FiguMarket - Inicio' }, [])

  useEffect(() => {
    let mounted = true
    getFiguras().then((res) => {
      if (mounted && res.ok) setFiguras(res.data)
      if (mounted) setCargandoFiguras(false)
    })
    getNoticias().then((res) => {
      if (mounted && res.ok) setNoticias(Array.isArray(res.data) ? res.data : [])
    })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const update = () => setIsMd(window.innerWidth >= 768)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const ultimas = useMemo(() => {
    const isVisible = (f) => {
      const v = f?.disponible
      if (typeof v === 'boolean') return v
      if (typeof v === 'number') return v !== 0
      const s = String(v ?? '').trim().toLowerCase()
      if (!s) return true
      return !(['false', '0', 'no', 'off'].includes(s))
    }
    const base = Array.isArray(figuras) ? figuras.filter((f) => String(f?.estado || '').toLowerCase() !== 'vendido' && isVisible(f)) : []
    const arr = [...base]
    arr.sort((a, b) => {
      const da = new Date(a?.fecha_publicacion || 0).getTime()
      const db = new Date(b?.fecha_publicacion || 0).getTime()
      return db - da
    })
    return arr
  }, [figuras])
  const items = useMemo(() => ultimas.slice(0, visible), [ultimas, visible])
  const [seguimientosMap, setSeguimientosMap] = useState({})
  useEffect(() => {
    const ids = items.map((f) => f.id)
    if (!ids.length) { setSeguimientosMap({}); return }
    let active = true
    ;(async () => {
      try {
        const res = await getSeguimientoCounts(ids)
        if (active && res?.ok && typeof res.data === 'object') setSeguimientosMap(res.data)
      } catch { if (active) setSeguimientosMap({}) }
    })()
    return () => { active = false }
  }, [items])
  const destacadas = useMemo(() => {
    const arr = Array.isArray(figuras) ? figuras : []
    const norm = (s) => String(s || '').toLowerCase()
    const isVisible = (f) => {
      const v = f?.disponible
      if (typeof v === 'boolean') return v
      if (typeof v === 'number') return v !== 0
      const s = String(v ?? '').trim().toLowerCase()
      if (!s) return true
      return !(['false', '0', 'no', 'off'].includes(s))
    }
    return arr.filter((f) => !!f.destacado && norm(f.estado) !== 'vendido' && isVisible(f))
  }, [figuras])

  // Slider de destacadas se gestiona dentro de FeaturedSlider

  const noticiasPool = useMemo(() => noticias.slice(0, 12), [noticias])
  const [visibleNewsIdxs, setVisibleNewsIdxs] = useState([0, 1, 2])
  const [fadeSlot, setFadeSlot] = useState(null)
  const pauseRef = useRef(false)
  useEffect(() => {
    const baseLen = noticiasPool.length
    if (baseLen === 0) { setVisibleNewsIdxs([]); return }
    const init = [0, 1, 2].filter((i) => i < baseLen)
    setVisibleNewsIdxs((prev) => (prev.length ? prev.map((i, k) => (i < baseLen ? i : (k < init.length ? init[k] : 0))) : init))
  }, [noticiasPool])
  useEffect(() => {
    if (noticiasPool.length <= 3) return
    const id = setInterval(() => {
      if (pauseRef.current) return
      const slot = Math.floor(Math.random() * Math.min(3, visibleNewsIdxs.length || 3))
      const current = visibleNewsIdxs[slot]
      const indices = Array.from({ length: noticiasPool.length }, (_, i) => i)
      const candidates = indices.filter((i) => !visibleNewsIdxs.includes(i))
      const nextIdx = (candidates.length ? candidates : indices.filter((i) => i !== current))[Math.floor(Math.random() * (candidates.length ? candidates.length : Math.max(indices.length - 1, 1)))]
      setFadeSlot(slot)
      setTimeout(() => {
        setVisibleNewsIdxs((arr) => {
          const copy = [...arr]
          copy[slot] = nextIdx
          return copy
        })
        setFadeSlot(null)
      }, 1000)
    }, 4000)
    return () => clearInterval(id)
  }, [noticiasPool, visibleNewsIdxs])

  // Eliminamos carga infinita: mostramos solo las últimas 'visible' figuras

  return (
    <section>
      {destacadas.length > 0 && (
        <div className="mb-8">
          <div className="mb-1 text-sm font-semibold text-gray-700">Novedades Proximas Figuras</div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <span>Figuras destacadas</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#FECE00]"><path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7l3-7z"/></svg>
          </h2>
          <p className="mt-2 text-gray-600">Explora las últimas figuras destacadas.</p>
          <div className="mt-4">
            <FeaturedSlider items={destacadas} autoAdvanceMs={5000} />
          </div>
        </div>
      )}
      {/* Botones de marcas hacia catálogo con filtro preseleccionado */}
      {!cargandoFiguras && (
      <div className="mt-32 mb-32 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          to="/catalogo?categoria=marvel"
          className="relative overflow-hidden h-24 sm:h-28 rounded-xl border shadow bg-[#ED1D24] hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#ED1D24] transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-lg"
          aria-label="Marvel"
        >
          <img
            src="/marvel.svg"
            alt="Marvel"
            className="absolute inset-0 w-full h-full object-contain"
            loading="lazy"
          />
        </Link>
        <Link
          to="/catalogo?categoria=dc"
          className="relative overflow-hidden h-24 sm:h-28 rounded-xl border shadow bg-white hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-black transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-lg"
          aria-label="DC"
        >
          <img
            src="/dc.svg"
            alt="DC"
            className="absolute inset-0 w-full h-full object-contain p-2"
            loading="lazy"
          />
        </Link>
        <Link
          to="/catalogo?categoria=star%20wars"
          className="relative overflow-hidden h-24 sm:h-28 rounded-xl border shadow bg-black hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-black transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-lg"
          aria-label="Star Wars"
        >
          <img
            src="/star-wars.svg"
            alt="Star Wars"
            className="absolute inset-0 w-full h-full object-contain p-2"
            loading="lazy"
          />
        </Link>
      </div>
      )}

      {/* Slider de noticias (fondo en tarjeta) */}
      {noticiasPool.length > 0 && (
        <>
          <h2 className="text-3xl font-bold">Novedades Proximas Figuras</h2>
          <p className="mt-2 text-gray-600">Proximas figuras</p>
          <div
            className="mt-4 rounded-lg border bg-white p-4"
            onMouseEnter={() => (pauseRef.current = true)}
            onMouseLeave={() => (pauseRef.current = false)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
              {Array.from({ length: Math.min(3, noticiasPool.length) }).map((_, slot) => {
                const n = noticiasPool[visibleNewsIdxs[slot] ?? slot] || {}
                const titulo = n?.titulo || n?.title || n?.nombre || 'Sin título'
                const resumen = n?.resumen || n?.descripcion || n?.description || ''
                const imagen = n?.imagen || n?.imagen_url || n?.image || n?.cover || ''
                const url = n?.url || n?.link || ''
                return (
                  <div key={slot} className={`transition-opacity duration-1000 ease-in-out ${fadeSlot === slot ? 'opacity-0' : 'opacity-100'}`}>
                    <article className="rounded-lg border shadow-sm overflow-hidden h-full min-h-[360px] sm:min-h-[420px] lg:min-h-[480px]">
                      <div
                        className="h-48 sm:h-64 lg:h-72 w-full bg-gray-200 bg-center bg-cover"
                        style={{ backgroundImage: imagen ? `url(${resolveMediaUrl(imagen) || imagen})` : 'none' }}
                      >
                        {!imagen && (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">Sin imagen</div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col">
                        <h3 className="text-base font-semibold line-clamp-2">{titulo}</h3>
                        {resumen && <p className="mt-1 text-sm text-gray-600 line-clamp-3">{resumen}</p>}
                        {url && (
                          <a href={url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 h-10 rounded-md px-3 border hover:bg-gray-100 w-full justify-center sm:w-auto">Leer más</a>
                        )}
                      </div>
                    </article>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}


      {cargandoFiguras ? (
        <div
          className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6 bg-white/50 rounded-xl p-2"
          aria-busy="true" aria-live="polite"
          style={isMd ? {
            backgroundImage: "url('/fondo.png')",
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '240px'
          } : undefined}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-full flex flex-col rounded-lg border bg-white shadow-md overflow-hidden animate-pulse">
              <div className="h-48 sm:h-56 lg:h-64 w-full bg-gray-200" />
              <div className="p-4">
                <div className="h-4 w-11/12 bg-gray-200 rounded" />
                <div className="mt-2 h-3 w-8/12 bg-gray-200 rounded" />
                <div className="mt-4 h-6 w-32 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <h1 className="mt-6 text-3xl font-bold">Últimas figuras</h1>
          <p className="mt-2 text-gray-600">Explora las últimas figuras publicadas.</p>
          {items.length === 0 ? (
            <p className="mt-6 text-gray-600">No hay figuras para mostrar.</p>
          ) : (
            <div
              className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6 bg-white/50 rounded-xl p-2"
              style={isMd ? {
                backgroundImage: "url('/fondo.png')",
                backgroundAttachment: 'fixed',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '240px'
              } : undefined}
            >
              {items.map((f) => (
                <TarjetaFigura key={f.id} figura={f} seguimientoCount={Number(seguimientosMap?.[f.id] || 0)} featured />
              ))}
            </div>
          )}
          <div className="mt-8 flex justify-center">
            <Link
              to="/catalogo"
              className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-white text-black border-2 border-black font-bold shadow-md hover:bg-[#FECE00] hover:text-black hover:border-black hover:shadow-lg transition-colors transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-black"
            >
              Explorar más
            </Link>
          </div>
        </>
      )}
      {/* Ya no hay carga infinita: mostramos solo las más recientes */}
    </section>
  )
}