import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Boton } from './Boton.jsx'
import { formatCurrencyEUR } from '../utils/index.js'
import { VisorImagen } from './VisorImagen.jsx'
import { useFavoritos } from '../contextos/ProveedorFavoritos.jsx'

import { useAuth } from '../contextos/ProveedorAuth.jsx'
import { getSeguimientoCount } from '../servicios/seguimientos.js'
import { resolveMediaUrl } from '../utils/media.js'

export function TarjetaFigura({ figura, compact = false, featured = false, homeTall = false, showVisibilityControl = false, onToggleDisponible, showOwnerActions = false, onEdit, onDelete, seguimientoCount = 0 }) {
  const {
    id,
    nombre,
    descripcion,
    categoria,
    escala,
    estado,
    precio,
    disponible,
    fecha_publicacion,
    imagenes = [],
    destacado,
  } = figura || {}

  const imagenUrls = useMemo(() => (imagenes || []).map((i) => i?.url).filter(Boolean), [imagenes])
  const [index, setIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState(0)
  const [overlaySrc, setOverlaySrc] = useState(null)
  const [overlayOpacity, setOverlayOpacity] = useState(0)
  const fadeTimer = useRef(null)
  const [viewerSrc, setViewerSrc] = useState(null)
  const navigate = useNavigate()

  const hasImages = imagenUrls.length > 0
  const currentImg = hasImages ? resolveMediaUrl(imagenUrls[index]) : 'https://via.placeholder.com/800x600?text=Figura'
  const { isFavorito, toggle } = useFavoritos()
  const { isAuthenticated, usuario } = useAuth()
  const esMia = isAuthenticated && usuario?.id && figura?.usuario_id && Number(usuario.id) === Number(figura.usuario_id)
  const favorito = isAuthenticated && !esMia && isFavorito(id)
  const [localSeguimientoCount, setLocalSeguimientoCount] = useState(Number(seguimientoCount || 0))
  useEffect(() => { setLocalSeguimientoCount(Number(seguimientoCount || 0)) }, [seguimientoCount])
  const refreshSeguimientoCount = async () => {
    try {
      if (!id) { setLocalSeguimientoCount(0); return }
      const res = await getSeguimientoCount(id)
      if (res?.ok) setLocalSeguimientoCount(Number(res.data?.count || 0))
    } catch {
      setLocalSeguimientoCount((c) => Math.max(0, Number(c || 0)))
    }
  }


  const startCrossfade = (prevImgUrl) => {
    if (fadeTimer.current) clearTimeout(fadeTimer.current)
    setOverlaySrc(resolveMediaUrl(prevImgUrl))
    setOverlayOpacity(1)
    // Siguiente frame: transicionar a 0 para efecto de desvanecimiento
    requestAnimationFrame(() => setOverlayOpacity(0))
    fadeTimer.current = setTimeout(() => {
      setOverlaySrc(null)
      setOverlayOpacity(0)
      fadeTimer.current = null
    }, 350)
  }
  const prev = (e) => {
    e?.stopPropagation?.()
    const prevUrl = imagenUrls[index]
    setPrevIndex(index)
    setIndex((i) => {
      const nextI = (i - 1 + imagenUrls.length) % Math.max(imagenUrls.length, 1)
      startCrossfade(prevUrl)
      return nextI
    })
  }
  const next = (e) => {
    e?.stopPropagation?.()
    const prevUrl = imagenUrls[index]
    setPrevIndex(index)
    setIndex((i) => {
      const nextI = (i + 1) % Math.max(imagenUrls.length, 1)
      startCrossfade(prevUrl)
      return nextI
    })
  }

  const precioNumber = Number(precio)
  const publicado = fecha_publicacion ? new Date(fecha_publicacion).toLocaleDateString('es-ES') : ''

  const imgHeights = featured
    ? 'h-[26rem] sm:h-[28rem] lg:h-[30rem]'
    : homeTall
      ? 'h-52 sm:h-64 lg:h-72'
      : compact
        ? 'h-48 sm:h-56 lg:h-64'
        : 'h-64 sm:h-80 lg:h-96'
  const bodyPadding = compact ? 'p-2.5' : 'p-3'
  const titleSize = compact ? 'text-base' : 'text-lg'
  const descClamp = compact ? 'line-clamp-1' : 'line-clamp-2'
  const priceSize = compact ? 'text-lg' : 'text-xl'

  const estadoLabel = (s) => {
    const v = (s || '').toString().trim().toLowerCase()
    if (v === 'vendido') return 'Vendida'
    if (v === 'en negociación') return 'En Negociación'
    if (v === 'disponible') return 'Disponible'
    return s || '—'
  }


  return (
    <div
      className="relative h-full flex flex-col rounded-lg border bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
      onClick={() => navigate(`/producto/${id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/producto/${id}`) }}
    >
      <div className="relative">
        {destacado && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-[#FECE00] text-black text-xs font-semibold px-2 py-1 shadow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7l3-7z" /></svg>
            Destacado
          </span>
        )}
        {/* Imagen actual (base) */}
        <img
          src={currentImg}
          alt={nombre}
          className={`${imgHeights} w-full object-cover transition ${featured ? '' : 'sm:cursor-zoom-in sm:hover:opacity-95'}`}
          onClick={featured ? undefined : (e) => { e.stopPropagation(); if (window.innerWidth >= 640) { setViewerSrc(currentImg) } else { navigate(`/producto/${id}`) } }}
        />
        {/* Overlay para crossfade (imagen anterior que se desvanece) */}
        {hasImages && imagenUrls.length > 1 && overlaySrc && (
          <img
            src={overlaySrc}
            alt={nombre}
            className={`absolute inset-0 ${imgHeights} w-full object-cover pointer-events-none transition-opacity duration-300 ease-in-out`}
            style={{ opacity: overlayOpacity }}
          />
        )}
        {hasImages && imagenUrls.length > 1 && (
          <>
            <button aria-label="Anterior" onClick={prev}
              className="hidden md:inline-flex absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white border px-2 py-1 text-gray-700">‹</button>
            <button aria-label="Siguiente" onClick={next}
              className="hidden md:inline-flex absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white border px-2 py-1 text-gray-700">›</button>
            <div className="hidden md:flex absolute bottom-2 left-0 right-0 justify-center gap-1">
              {imagenUrls.map((_, i) => (
                <span key={i} className={`h-2 w-2 rounded-full ${i === index ? 'bg-brand' : 'bg-white/70 border'}`}></span>
              ))}
            </div>
          </>
        )}
        <div className="sm:hidden">
          <span className="absolute left-2 bottom-2 h-9 min-w-[2.25rem] inline-flex items-center justify-center rounded-full bg-brand text-white text-xs font-bold px-3 shadow">
            {formatCurrencyEUR(precioNumber)}
          </span>
        </div>
      </div>
      <div className={`hidden sm:grid ${bodyPadding} gap-2 flex-1`}>
        <h3 className={`${titleSize} font-semibold line-clamp-2`}>{nombre}</h3>
        <p className={`text-sm text-gray-600 ${descClamp}`}>{descripcion}</p>
        <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-700">
          <span><span className="font-semibold">Categoría:</span> {categoria}</span>
          <span><span className="font-semibold">Estado:</span> {estadoLabel(estado)}</span>
          <span><span className="font-semibold">Escala:</span> {escala}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className={`${priceSize} font-bold text-brand`}>{formatCurrencyEUR(precioNumber)}</p>
          <div className="flex items-center gap-2">
            {String(estado).toLowerCase() === 'vendido' ? (
              <span className="text-xs text-gray-500">Vendida — no visible</span>
            ) : (
              showVisibilityControl && (
                <>
                  <span className="text-xs text-gray-700">Visible</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!disponible}
                    onClick={(e) => { e.stopPropagation(); onToggleDisponible?.(figura) }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${disponible ? 'bg-brand' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${disponible ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </>
              )
            )}
            {showOwnerActions && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Destacar"
                  title="Destacar"
                  onClick={(e) => { e.stopPropagation(); navigate(`/destacar/${id}`) }}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-full border text-[#FECE00] hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7l3-7z" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Editar"
                  title="Editar"
                  onClick={(e) => { e.stopPropagation(); onEdit?.(figura) }}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-full border text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Eliminar"
                  title="Eliminar"
                  onClick={(e) => { e.stopPropagation(); onDelete?.(figura) }}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-full border text-red-600 hover:text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M9 3h6l1 2h5v2H3V5h5l1-2zm-1 6h8l-1 10H9L8 9z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Contador arriba derecha en móvil, abajo derecha en escritorio; botón abajo derecha */}
      {!showOwnerActions && (
        <>
          <div className="absolute top-2 right-2 sm:hidden">
            <span className="inline-flex items-center justify-center h-8 min-w-[2rem] rounded-full bg-white text-black text-sm font-extrabold px-3 border-2 border-[#FECE00]">{localSeguimientoCount}</span>
          </div>
          <div className="absolute bottom-2 right-2 sm:hidden">
            {esMia ? (
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-xs font-semibold pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M6 2a2 2 0 00-2 2v18l8-4 8 4V4a2 2 0 00-2-2H6z" /></svg>
              </span>
            ) : favorito ? (
              <button
                type="button"
                aria-label="Quitar de seguimiento"
                title="Quitar de seguimiento"
                onClick={async (e) => { e.stopPropagation(); const r = await toggle(figura); if (r === 'removed') await refreshSeguimientoCount() }}
                className="inline-flex items-center gap-1.5 rounded-md bg-green-600 text-white text-xs font-medium px-3 py-1 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M6 2a2 2 0 00-2 2v18l8-4 8 4V4a2 2 0 00-2-2H6z" />
                </svg>
                <span>Añadido</span>
              </button>
            ) : (
              <button
                type="button"
                aria-label="Añadir a seguimiento"
                title="Añadir a seguimiento"
                onClick={async (e) => { e.stopPropagation(); if (!isAuthenticated) { navigate('/login'); return } const r = await toggle(figura); if (r === 'added') await refreshSeguimientoCount() }}
                className="inline-flex items-center justify-center h-8 w-8 rounded-full border bg-white text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M6 2a2 2 0 00-2 2v18l8-4 8 4V4a2 2 0 00-2-2H6z" />
                </svg>
              </button>
            )}
          </div>
          <div className="hidden sm:flex absolute top-2 right-2 items-center gap-1.5">
            {esMia ? (
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-xs font-semibold pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M6 2a2 2 0 00-2 2v18l8-4 8 4V4a2 2 0 00-2-2H6z" /></svg>
              </span>
            ) : favorito ? (
              <button
                type="button"
                aria-label="Quitar de seguimiento"
                title="Quitar de seguimiento"
                onClick={async (e) => { e.stopPropagation(); const r = await toggle(figura); if (r === 'removed') await refreshSeguimientoCount() }}
                className="inline-flex items-center gap-1.5 rounded-md bg-green-600 text-white text-xs font-medium px-3 py-1 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M6 2a2 2 0 00-2 2v18l8-4 8 4V4a2 2 0 00-2-2H6z" />
                </svg>
                <span>Añadido</span>
              </button>
            ) : (
              <button
                type="button"
                aria-label="Añadir a seguimiento"
                title="Añadir a seguimiento"
                onClick={async (e) => { e.stopPropagation(); if (!isAuthenticated) { navigate('/login'); return } const r = await toggle(figura); if (r === 'added') await refreshSeguimientoCount() }}
                className="inline-flex items-center justify-center h-8 w-8 rounded-full border bg-white text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M6 2a2 2 0 00-2 2v18l8-4 8 4V4a2 2 0 00-2-2H6z" />
                </svg>
              </button>
            )}
            <span className="inline-flex items-center justify-center h-12 min-w-[3rem] rounded-full bg-white text-black text-lg font-extrabold px-4 border-2 border-[#FECE00]">{localSeguimientoCount}</span>
          </div>
        </>
      )}
      {viewerSrc && <VisorImagen src={resolveMediaUrl(viewerSrc)} onClose={() => setViewerSrc(null)} />}
    </div>
  )
}
