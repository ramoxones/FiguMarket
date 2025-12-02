import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getFigura } from '../servicios/figuras.js'
import { getSeguimientoCount } from '../servicios/seguimientos.js'
import { actualizarFigura } from '../servicios/figuras.js'
import { borrarFigura } from '../servicios/figuras.js'
import { Boton } from '../componentes/Boton.jsx'
import { formatCurrencyEUR } from '../utils/index.js'
import { VisorImagen } from '../componentes/VisorImagen.jsx'
import { useFavoritos } from '../contextos/ProveedorFavoritos.jsx'
import { useAuth } from '../contextos/ProveedorAuth.jsx'
import { crearMensaje } from '../servicios/mensajes.js'
import { MensajesPanel } from '../componentes/MensajesPanel.jsx'
import { createPortal } from 'react-dom'
import { resolveMediaUrl } from '../utils/media.js'
import { crearImagen, borrarImagen } from '../servicios/imagenes.js'
import { getUsuario } from '../servicios/usuarios.js'

export function PaginaProducto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [producto, setProducto] = useState(null)
  const [viewerSrc, setViewerSrc] = useState(null)
  const [imgIndex, setImgIndex] = useState(0)
  const { isFavorito, toggle } = useFavoritos()
  const { usuario, isAuthenticated } = useAuth()
  const [mostrarMensajes, setMostrarMensajes] = useState(false)
  const [mensajePrefill, setMensajePrefill] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [draft, setDraft] = useState(null)
  const [newImages, setNewImages] = useState([])
  const newImagesInputRef = useRef(null)
  const MAX_FOTOS = 5
  const [error, setError] = useState('')
  const [vendedor, setVendedor] = useState(null)
  const [seguimientoCount, setSeguimientoCount] = useState(0)
  const [destacadoUntil, setDestacadoUntil] = useState(null)
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    document.title = producto?.nombre ? `FiguMarket - ${producto.nombre}` : 'FiguMarket - Producto'
  }, [producto?.nombre])

  useEffect(() => {
    let mounted = true
    getFigura(id).then((res) => {
      if (!mounted) return
      if (res.ok) {
        setProducto(res.data)
        setError('')
      } else {
        setProducto(null)
        const errMsg = (typeof res.error === 'string') ? res.error : (res.error?.message || 'No se pudo cargar la figura.')
        setError(errMsg)
      }
    }).catch((e) => {
      if (!mounted) return
      setProducto(null)
      setError('Error de red al cargar la figura.')
      console.error(e)
    })
    return () => { mounted = false }
  }, [id])

  useEffect(() => {
    if (producto) {
      setDraft({
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        categoria: producto.categoria || '',
        escala: producto.escala || '',
        estado: producto.estado || '',
        estado_figura: producto.estado_figura || 'en buen estado',
        precio: producto.precio || '',
        disponible: !!producto.disponible,
      })
      const shouldEdit = (typeof window !== 'undefined') && (new URLSearchParams(window.location.search).get('edit') === '1')
      if (shouldEdit && isAuthenticated && usuario?.id === producto.usuario_id) {
        setEditMode(true)
      }
    }
  }, [producto, isAuthenticated, usuario])

  // Cargar datos del vendedor para mostrar su nombre
  useEffect(() => {
    const cargarVendedor = async () => {
      try {
        if (producto?.usuario_id) {
          const r = await getUsuario(producto.usuario_id)
          if (r?.ok) setVendedor(r.data)
        }
      } catch (e) {
        console.error('No se pudo cargar el vendedor', e)
      }
    }
    cargarVendedor()
  }, [producto?.usuario_id])

  useEffect(() => {
    const finStr = producto?.destacado_fin
    if (finStr) {
      const t = new Date(finStr).getTime()
      setDestacadoUntil(isNaN(t) ? null : t)
    } else {
      setDestacadoUntil(null)
    }
  }, [producto?.destacado_fin])

  useEffect(() => {
    const until = Number(destacadoUntil || 0)
    if (!until || until <= Date.now()) { setCountdown(''); return }
    const format = (ms) => {
      const total = Math.max(0, Math.floor(ms / 1000))
      const d = Math.floor(total / 86400)
      const h = Math.floor((total % 86400) / 3600)
      const m = Math.floor((total % 3600) / 60)
      const s = total % 60
      const dd = d > 0 ? `${d}d ` : ''
      const hh = String(h).padStart(2, '0')
      const mm = String(m).padStart(2, '0')
      const ss = String(s).padStart(2, '0')
      return `${dd}${hh}:${mm}:${ss}`
    }
    setCountdown(format(until - Date.now()))
    const t = setInterval(() => {
      const now = Date.now()
      if (until <= now) {
        clearInterval(t)
        setCountdown('')
        ;(async () => {
          try {
            const r = await actualizarFigura(Number(id), { destacado: false, destacado_fin: null, destacado_inicio: null })
            if (r?.ok) {
              setProducto((p) => (p ? { ...p, destacado: false, destacado_fin: null, destacado_inicio: null } : p))
            }
          } catch {}
          setDestacadoUntil(null)
        })()
      } else {
        setCountdown(format(until - now))
      }
    }, 1000)
    return () => clearInterval(t)
  }, [destacadoUntil, id])

  useEffect(() => {
    let active = true
    const cargarCount = async () => {
      try {
        if (!producto?.id) { setSeguimientoCount(0); return }
        const res = await getSeguimientoCount(producto.id)
        if (active && res?.ok) setSeguimientoCount(Number(res.data?.count || 0))
      } catch {
        if (active) setSeguimientoCount(0)
      }
    }
    cargarCount()
    return () => { active = false }
  }, [producto?.id])

  const refreshSeguimientoCount = async () => {
    try {
      if (!producto?.id) { setSeguimientoCount(0); return }
      const res = await getSeguimientoCount(producto.id)
      if (res?.ok) setSeguimientoCount(Number(res.data?.count || 0))
    } catch {
      setSeguimientoCount((c) => Math.max(0, Number(c || 0)))
    }
  }

  // Asegurar que todos los hooks se llamen antes de cualquier return condicional
  const imagenes = useMemo(() => (producto?.imagenes || []), [producto])
  const imagenUrls = useMemo(() => imagenes.map((i) => i?.url).filter(Boolean), [imagenes])
  useEffect(() => { setImgIndex(0) }, [producto?.id])
  const currentImg = imagenUrls.length ? resolveMediaUrl(imagenUrls[imgIndex]) : 'https://via.placeholder.com/800x600?text=Figura'
  const imagenesCount = (imagenes.length || 0) + (newImages.length || 0)
  const canAddMore = imagenesCount < MAX_FOTOS

  if (error) return <section className="p-4"><p className="text-red-600">{typeof error === 'string' ? error : (error?.message || 'No se pudo cargar la figura.')}</p></section>
  if (!producto) return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 animate-pulse">
      <div className="relative">
        <div className="w-full h-64 md:h-96 rounded-lg border bg-gray-200" />
      </div>
      <div>
        <div className="h-8 w-2/3 bg-gray-200 rounded" />
        <div className="mt-2 flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gray-200" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
          <div className="h-4 w-4/6 bg-gray-200 rounded" />
        </div>
        <div className="mt-4 h-7 w-32 bg-gray-200 rounded" />
        <div className="mt-3 h-6 w-48 bg-gray-200 rounded" />
        <div className="mt-4 flex gap-2">
          <div className="h-10 w-32 bg-gray-200 rounded" />
          <div className="h-10 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    </section>
  )
  const fav = isAuthenticated && !(isAuthenticated && usuario?.id === producto.usuario_id) && isFavorito(producto.id)
  const vendedorId = producto.usuario_id
  const esMiProducto = isAuthenticated && usuario?.id === vendedorId
  const isAdmin = isAuthenticated && (usuario?.rol === 'admin' || usuario?.role === 'admin')
  const isFeaturedActive = !!producto?.destacado

  // Estados posibles y estilos de badge por estado
  const ESTADOS = ['disponible', 'en negociación', 'vendido']
  const norm = (s) => (s || '').toString().trim().toLowerCase()
  const estadoClase = (e) => {
    const v = norm(e)
    if (v === 'vendido') return 'bg-red-100 text-red-800 border border-red-200'
    if (v === 'en negociación') return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
    return 'bg-green-100 text-green-800 border border-green-200'
  }

  const estadoLabel = (s) => {
    const v = norm(s)
    if (v === 'vendido') return 'Vendida'
    if (v === 'en negociación') return 'En Negociación'
    if (v === 'disponible') return 'Disponible'
    return s || '—'
  }

  const cambiarEstado = async (nuevo) => {
    if (!esMiProducto) return
    try {
      const payload = { estado: nuevo }
      if (nuevo === 'vendido') payload.disponible = false
      if (nuevo === 'disponible') payload.disponible = true
      const r = await actualizarFigura(producto.id, payload)
      if (r?.ok) {
        setProducto((p) => ({ ...p, estado: nuevo, ...(nuevo === 'vendido' ? { disponible: false } : (nuevo === 'disponible' ? { disponible: true } : {})) }))
        setDraft((d) => (d ? { ...d, estado: nuevo, ...(nuevo === 'vendido' ? { disponible: false } : (nuevo === 'disponible' ? { disponible: true } : {})) } : d))
      }
    } catch (e) {
      console.error('No se pudo cambiar el estado', e)
    }
  }

  const toggleDisponible = async () => {
    if (!esMiProducto) return
    try {
      if (norm(producto.estado) === 'vendido') return
      const nuevo = !producto?.disponible
      const r = await actualizarFigura(producto.id, { disponible: nuevo })
      if (r?.ok) {
        setProducto((p) => ({ ...p, disponible: nuevo }))
        setDraft((d) => (d ? { ...d, disponible: nuevo } : d))
      }
    } catch (e) {
      console.error('No se pudo cambiar la visibilidad', e)
    }
  }

  const onSelectNewImages = async (e) => {
    const files = Array.from(e.target.files || [])
    const slots = Math.max(0, MAX_FOTOS - (imagenes.length || 0) - newImages.length)
    const take = files.slice(0, slots)
    const readers = take.map((file) => new Promise((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve(r.result)
      r.onerror = reject
      r.readAsDataURL(file)
    }))
    try {
      const datas = await Promise.all(readers)
      setNewImages((prev) => [...prev, ...datas])
    } catch (err) {
      console.error('No se pudieron leer nuevas imágenes', err)
    }
  }

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = async (img) => {
    if (!img?.id) return
    const res = await borrarImagen(img.id)
    if (res?.ok || res?.status === 204) {
      setProducto((p) => ({ ...p, imagenes: (p.imagenes || []).filter((x) => x.id !== img.id) }))
    }
  }

  const guardarCambios = async () => {
    const fields = ['nombre','descripcion','categoria','escala','estado','estado_figura','precio','disponible']
    const payload = {}
    fields.forEach((f) => {
      if (draft && producto && draft[f] !== producto[f]) payload[f] = draft[f]
    })
    if (Object.keys(payload).length > 0) {
      const r = await actualizarFigura(producto.id, payload)
      if (!r?.ok) console.error('No se pudo actualizar la figura', r?.error)
    }
    for (const dataUrl of newImages) {
      const r = await crearImagen({ figura_id: producto.id, url: dataUrl })
      if (!r?.ok) console.error('No se pudo crear imagen', r?.error)
    }
    const res = await getFigura(id)
    if (res?.ok) {
      setProducto(res.data)
      setEditMode(false)
      setNewImages([])
    }
  }

  const enviarMensaje = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    const texto = `Hola, me interesa tu figura "${producto.nombre}". ¿Está disponible?`
    // Solo pre-llenamos y abrimos el panel; NO enviamos automáticamente
    setMensajePrefill(texto)
    setMostrarMensajes(true)
  }

  const eliminarPublicacion = async () => {
    if (!(esMiProducto || isAdmin)) return
    const ok = window.confirm('¿Deseas eliminar esta figura? Esta acción no se puede deshacer.')
    if (!ok) return
    try {
      const r = await borrarFigura(producto.id)
      if (r?.ok || r?.status === 204) {
        // Redirigir al catálogo tras eliminar
        window.location.href = '/catalogo'
      } else {
        alert(r?.error || 'No se pudo eliminar la figura.')
      }
    } catch (e) {
      console.error('Error al eliminar la figura', e)
      alert('Error al eliminar la figura.')
    }
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="relative w-full h-[75vh] sm:h-96 md:h-[32rem] rounded-lg border overflow-hidden">
        <img
          src={currentImg}
          alt={producto.nombre}
          className="absolute inset-0 w-full h-full object-contain md:object-cover bg-black/5 cursor-zoom-in"
          onClick={() => setViewerSrc(currentImg)}
        />
        {isFeaturedActive && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-[#FECE00] text-black text-xs font-semibold px-2 py-1 shadow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7l3-7z"/></svg>
            Destacado
          </span>
        )}
        {imagenUrls.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => setImgIndex((i) => (i - 1 + imagenUrls.length) % imagenUrls.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white border px-2 py-1 text-gray-700"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Siguiente"
              onClick={() => setImgIndex((i) => (i + 1) % imagenUrls.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white border px-2 py-1 text-gray-700"
            >
              ›
            </button>
            <div className="hidden md:flex absolute bottom-2 left-0 right-0 justify-center gap-1">
              {imagenUrls.map((_, i) => (
                <span key={i} className={`h-2 w-2 rounded-full ${i === imgIndex ? 'bg-brand' : 'bg-white/70 border'}`}></span>
              ))}
            </div>
          </>
        )}
        {isAuthenticated && usuario?.id === producto?.usuario_id && !isFeaturedActive && (
          <div className="md:hidden absolute bottom-2 left-2 right-2 z-10">
            <button
              type="button"
              onClick={() => navigate(`/destacar/${producto.id}`)}
              className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-lg bg-[#FECE00] text-black font-bold shadow-md hover:shadow-lg hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#FECE00] text-base px-4"
              aria-label="Destacar figura"
              title="Destacar figura"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7l3-7z"/></svg>
              <span>Destacar</span>
            </button>
          </div>
        )}
        {isAuthenticated && usuario?.id === producto?.usuario_id && isFeaturedActive && countdown && (
          <div className="md:hidden absolute bottom-2 left-2 right-2 z-10">
            <span className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-lg bg-black text-white font-bold shadow-md text-base px-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span>Queda {countdown}</span>
            </span>
          </div>
        )}
        <div className="absolute right-2 top-2 flex items-center gap-1.5">
          {esMiProducto && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 text-white text-xs font-medium px-3 py-1 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M6 2a2 2 0 00-2 2v18l8-4 8 4V4a2 2 0 00-2-2H6z" />
              </svg>
              <span>Publicada</span>
            </span>
          )}
          {!esMiProducto && (
            <>
              {fav ? (
                <button
                  type="button"
                  aria-label="Quitar de seguimiento"
                  title="Quitar de seguimiento"
                  onClick={async (e) => { e.stopPropagation(); const r = await toggle(producto); if (r === 'removed') await refreshSeguimientoCount() }}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-green-600 text-white text-xs font-medium px-3 py-1 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-green-400"
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
                  onClick={async (e) => { e.stopPropagation(); if (!isAuthenticated) { navigate('/login'); return } const r = await toggle(producto); if (r === 'added') await refreshSeguimientoCount() }}
                  className="hidden sm:inline-flex items-center justify-center h-8 w-8 rounded-full border bg-white/80 text-gray-600 shadow hover:bg-white hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M6 2a2 2 0 00-2 2v18l8-4 8 4V4a2 2 0 00-2-2H6z" />
                  </svg>
                </button>
              )}
            </>
          )}
          <span className="ml-1 inline-flex items-center justify-center h-8 min-w-[2rem] sm:h-12 sm:min-w-[3rem] rounded-full bg-white text-black text-sm sm:text-lg font-extrabold px-3 sm:px-4 border-2 border-[#FECE00]">{seguimientoCount}</span>
        </div>
        {!esMiProducto && (
          <div className="absolute right-2 bottom-2 sm:hidden">
            {fav ? (
              <button
                type="button"
                aria-label="Quitar de seguimiento"
                title="Quitar de seguimiento"
                onClick={async (e) => { e.stopPropagation(); const r = await toggle(producto); if (r === 'removed') await refreshSeguimientoCount() }}
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
                onClick={async (e) => { e.stopPropagation(); if (!isAuthenticated) { navigate('/login'); return } const r = await toggle(producto); if (r === 'added') await refreshSeguimientoCount() }}
                className="inline-flex items-center justify-center h-8 w-8 rounded-full border bg-white/80 text-gray-600 shadow hover:bg-white hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M6 2a2 2 0 00-2 2v18l8-4 8 4V4a2 2 0 00-2-2H6z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
      <div>
        <h1 className="text-3xl font-bold">{producto.nombre}</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
          <img
            src={resolveMediaUrl(vendedor?.foto_perfil) || '/default-avatar.svg'}
            alt="Foto de vendedor"
            className="h-6 w-6 rounded-full object-cover border"
            onError={(e) => { e.currentTarget.src = '/default-avatar.svg' }}
          />
          <span>Publicado por {vendedor?.nombre || 'Usuario'}</span>
        </div>
        <p className="mt-2 text-gray-700">{producto.descripcion}</p>
        <div className="mt-2 text-sm text-gray-700 flex flex-wrap gap-4">
          <span><span className="font-semibold">Categoría:</span> {((producto.categoria || '').charAt(0).toUpperCase() + (producto.categoria || '').slice(1))}</span>
          <span><span className="font-semibold">Escala:</span> {producto.escala}</span>
          <span><span className="font-semibold">Estado de figura:</span> {((producto.estado_figura || '').charAt(0).toUpperCase() + (producto.estado_figura || '').slice(1))}</span>
        </div>
        <p className="mt-4 text-2xl font-bold text-brand">{formatCurrencyEUR(Number(producto.precio))}</p>
        {/* Estado actual y acciones del propietario */}
        <div className="mt-3">
          <h3 className="text-sm font-semibold">Estado de la publicación</h3>
          <div className="mt-2">
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${estadoClase(producto.estado)}`}>
              {estadoLabel(producto.estado)}
            </span>
          </div>
          {esMiProducto && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {ESTADOS.map((e) => {
                const activo = norm(producto.estado) === norm(e)
                const base = `inline-flex items-center rounded-md px-2 py-1 text-xs border ${estadoClase(e)}`
                return (
                  <li key={e}>
                    <button
                      type="button"
                      className={`${base} ${activo ? 'ring-1 ring-offset-1 ring-black/10' : 'opacity-90 hover:opacity-100'}`}
                      onClick={() => cambiarEstado(e)}
                      title={`Marcar como ${estadoLabel(e)}`}
                    >
                      {estadoLabel(e)}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          {esMiProducto && (
            <p className="mt-1 text-xs text-gray-600">Solo tú puedes cambiar el estado.</p>
          )}
          {esMiProducto && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-gray-700">Visible en catálogo</span>
              {norm(producto.estado) === 'vendido' ? (
                <span className="text-xs text-gray-500">Vendida — no visible</span>
              ) : (
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!producto?.disponible}
                  onClick={(e) => { e.stopPropagation(); toggleDisponible() }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${producto?.disponible ? 'bg-brand' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${producto?.disponible ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              )}
            </div>
          )}
        </div>
        {(esMiProducto || isAdmin) && (
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {esMiProducto && !isFeaturedActive && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); navigate(`/destacar/${producto.id}`) }}
                  className="inline-flex items-center gap-2 h-12 w-full sm:w-auto justify-center rounded-md border px-4 bg-[#FECE00] text-black font-semibold hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#FECE00]"
                  aria-label="Destacar figura"
                  title="Destacar figura"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7l3-7z"/></svg>
                  <span>Destacar</span>
                </button>
                <Boton className="gap-2 w-full sm:w-auto h-12 justify-center" onClick={(e) => { e.stopPropagation(); setEditMode((v) => !v) }}>{editMode ? 'Cancelar edición' : 'Editar figura'}</Boton>
              </>
            )}
            {esMiProducto && isFeaturedActive && (
              <>
                <span className="hidden sm:inline-flex items-center gap-2 h-12 sm:w-auto justify-center rounded-md border px-4 bg-black text-white font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  <span>Queda {countdown}</span>
                </span>
                <Boton className="gap-2 w-full sm:w-auto h-12 justify-center" onClick={(e) => { e.stopPropagation(); setEditMode((v) => !v) }}>{editMode ? 'Cancelar edición' : 'Editar figura'}</Boton>
              </>
            )}
            <button
              type="button"
              className="inline-flex items-center gap-2 h-12 w-full sm:w-auto justify-center rounded-md border px-4 bg-red-600 text-white hover:bg-red-700"
              onClick={(e) => { e.stopPropagation(); eliminarPublicacion() }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14" />
              </svg>
              <span>Eliminar figura</span>
            </button>
          </div>
        )}
        <div className="mt-6">
          {!esMiProducto && (
            <button
              className="inline-flex items-center gap-2 h-10 rounded-md border px-3 hover:bg-brand hover:text-white"
              onClick={() => enviarMensaje()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M21 15a2 2 0 01-2 2h-4l-3 3-3-3H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v9z" />
              </svg>
              <span>Enviar mensaje</span>
            </button>
          )}
        </div>
        {esMiProducto && editMode && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Editar detalles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600">Nombre</label>
                  <input type="text" className="mt-1 w-full rounded-md border px-3 py-2" value={draft?.nombre || ''} onChange={(e) => setDraft((d) => ({ ...d, nombre: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Precio (€)</label>
                  <input type="number" step="0.01" className="mt-1 w-full rounded-md border px-3 py-2" value={draft?.precio || ''} onChange={(e) => setDraft((d) => ({ ...d, precio: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Categoría</label>
                  <select className="mt-1 w-full rounded-md border px-3 py-2" value={draft?.categoria || ''} onChange={(e) => setDraft((d) => ({ ...d, categoria: e.target.value }))}>
                    <option value="anime">Anime</option>
                    <option value="peliculas">Películas</option>
                    <option value="marvel">Marvel</option>
                    <option value="dc">DC</option>
                    <option value="videojuegos">Videojuegos</option>
                    <option value="comics">Cómics</option>
                    <option value="star wars">Star Wars</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Escala</label>
                  <select className="mt-1 w-full rounded-md border px-3 py-2" value={draft?.escala || ''} onChange={(e) => setDraft((d) => ({ ...d, escala: e.target.value }))}>
                    <option value="1:10">1:10</option>
                    <option value="1:4">1:4</option>
                    <option value="1:12">1:12</option>
                    <option value="1:6">1:6</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Estado de figura</label>
                  <select className="mt-1 w-full rounded-md border px-3 py-2" value={draft?.estado_figura || ''} onChange={(e) => setDraft((d) => ({ ...d, estado_figura: e.target.value }))}>
                    <option value="sin abrir">Sin abrir</option>
                    <option value="como nueva">Como nueva</option>
                    <option value="en buen estado">En buen estado</option>
                    <option value="en mal estado">En mal estado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Estado</label>
                  <select className="mt-1 w-full rounded-md border px-3 py-2" value={draft?.estado || ''} onChange={(e) => setDraft((d) => ({ ...d, estado: e.target.value }))}>
                    <option value="disponible">Disponible</option>
                    <option value="en negociación">En negociación</option>
                    <option value="vendido">Vendido</option>
                  </select>
                </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">Visible en catálogo</span>
                {norm(producto.estado) === 'vendido' ? (
                  <span className="text-xs text-gray-500">Vendida — no visible</span>
                ) : (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!draft?.disponible}
                    onClick={() => setDraft((d) => ({ ...d, disponible: !d.disponible }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${draft?.disponible ? 'bg-brand' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${draft?.disponible ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Descripción</label>
              <textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={4} value={draft?.descripcion || ''} onChange={(e) => setDraft((d) => ({ ...d, descripcion: e.target.value }))} />
            </div>
            <h3 className="text-lg font-semibold">Fotos ({imagenesCount}/{MAX_FOTOS})</h3>
            <p className="text-sm text-gray-600">Máximo 5 fotos por publicación.</p>
            {producto.imagenes?.length > 0 && (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {producto.imagenes.map((img) => (
                  <div key={img.id} className="relative">
                    <img src={resolveMediaUrl(img.url)} alt="foto" className="h-28 w-full object-cover rounded border" />
                    <button type="button" onClick={() => removeExistingImage(img)} className="absolute top-1 right-1 rounded bg-red-600 text-white text-xs px-2 py-1">Eliminar</button>
                  </div>
                ))}
              </div>
            )}
            {newImages.length > 0 && (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {newImages.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt={`nueva ${i}`} className="h-28 w-full object-cover rounded border" />
                    <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 rounded bg-gray-800 text-white text-xs px-2 py-1">Quitar</button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2">
              <input ref={newImagesInputRef} type="file" multiple accept="image/*,.webp" onChange={onSelectNewImages} disabled={!canAddMore} className="hidden" />
              <button
                type="button"
                disabled={!canAddMore}
                onClick={() => newImagesInputRef.current?.click()}
                className={`inline-flex items-center gap-2 h-10 rounded-lg px-4 font-semibold shadow-md focus:outline-none focus:ring-2 ${canAddMore ? 'bg-brand text-white hover:shadow-lg hover:opacity-95 focus:ring-brand' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M4 7a2 2 0 012-2h2l1-1h6l1 1h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7zm8 2a4 4 0 100 8 4 4 0 000-8z"/></svg>
                Añadir fotos
              </button>
              {!canAddMore && <p className="text-xs text-red-600 mt-1">Has alcanzado el máximo de 5 fotos.</p>}
            </div>
            <div className="mt-4">
              <Boton type="button" onClick={(e) => { e.stopPropagation(); guardarCambios() }}>Guardar cambios</Boton>
            </div>
          </div>
        )}
      </div>
      {viewerSrc && <VisorImagen src={viewerSrc} onClose={() => setViewerSrc(null)} />}
      {mostrarMensajes && createPortal(
        <MensajesPanel onClose={() => setMostrarMensajes(false)} iniciarConUsuario={vendedorId} iniciarConFigura={producto?.id} prefillTexto={mensajePrefill} />,
        document.body
      )}
      
    </section>
  )
}