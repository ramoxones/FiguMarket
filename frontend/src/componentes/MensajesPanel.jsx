import React, { useEffect, useMemo, useState } from 'react'
import { getMensajes, crearMensaje, marcarLeidos, borrarConversacion, obtenerArchivadas, archivarConversacion, desarchivarConversacion } from '../servicios/mensajes.js'
import { getFigura } from '../servicios/figuras.js'
import { getUsuario } from '../servicios/usuarios.js'
import { useAuth } from '../contextos/ProveedorAuth.jsx'
import { resolveMediaUrl } from '../utils/media.js'

export function MensajesPanel({ onClose, iniciarConUsuario, iniciarConFigura, prefillTexto }) {
  const { usuario } = useAuth()
  // Si no hay usuario autenticado, no renderizar el panel
  if (!usuario?.id) return null
  const [mensajes, setMensajes] = useState([])
  const [usuariosMapa, setUsuariosMapa] = useState({})
  const [seleccionado, setSeleccionado] = useState(null) // key: `${otroId}|${figuraId||'general'}`
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [cargandoUI, setCargandoUI] = useState(true)
  const [figurasMapa, setFigurasMapa] = useState({})
  const [archivadas, setArchivadas] = useState(new Set())
  const [confirmar, setConfirmar] = useState(null) // { key, usuarioId, figuraId }
  const [mostrarArchivadas, setMostrarArchivadas] = useState(false)
  const [ocultarComposer, setOcultarComposer] = useState(false)
  const [mobileListOpen, setMobileListOpen] = useState(false)
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    if (isMobile) setMobileListOpen(true)
  }, [])

  useEffect(() => {
    let mounted = true
    const params = usuario?.id ? { participante_id: usuario.id, order: 'asc', limit: 300 } : undefined
    const uid = usuario?.id
    if (uid) {
      const raw = localStorage.getItem(`mensajes_${uid}`)
      if (raw) {
        try {
          const cached = JSON.parse(raw)
          if (mounted && Array.isArray(cached)) {
            setMensajes(cached)
            setCargando(false)
          }
        } catch {}
      }
    }
    getMensajes(params).then(async (res) => {
      if (!mounted) return
      if (res.ok) {
        const propios = (res.data || [])
        setMensajes(propios)
        if (uid) { try { localStorage.setItem(`mensajes_${uid}`, JSON.stringify(propios)) } catch {} }
        const idsSet = new Set(propios.map((m) => (m.emisor_id === usuario?.id ? m.receptor_id : m.emisor_id)))
        if (iniciarConUsuario) idsSet.add(Number(iniciarConUsuario))
        const ids = Array.from(idsSet)
        const detalles = await Promise.all(ids.map((id) => getUsuario(id)))
        const mapa = {}
        detalles.forEach((r, i) => { if (r.ok) mapa[ids[i]] = r.data })
        setUsuariosMapa(mapa)
        const figSet = new Set(propios.map((m) => m.figura_id).filter(Boolean))
        if (iniciarConFigura) figSet.add(Number(iniciarConFigura))
        const figIds = Array.from(figSet)
        if (figIds.length > 0) {
          const figs = await Promise.all(figIds.map((fid) => getFigura(fid)))
          const fMap = {}
          figs.forEach((r, i) => { if (r.ok) fMap[figIds[i]] = r.data })
          setFigurasMapa(fMap)
        }
        const initialKey = (iniciarConUsuario && iniciarConFigura) ? `${Number(iniciarConUsuario)}|${Number(iniciarConFigura)}` : null
        if (initialKey) {
          setSeleccionado(initialKey)
        }
      }
      if (mounted) setCargandoUI(false)
      if (mounted) setCargando(false)
    })
    return () => { mounted = false }
  }, [usuario?.id, iniciarConUsuario, iniciarConFigura])

  // Prefetch de figura al iniciar desde una ficha si no hay mensajes previos
  useEffect(() => {
    const fid = iniciarConFigura ? Number(iniciarConFigura) : null
    if (!fid) return
    if (!figurasMapa[fid]) {
      let mounted = true
      getFigura(fid).then((r) => {
        if (!mounted) return
        if (r.ok) setFigurasMapa((prev) => ({ ...prev, [fid]: r.data }))
      })
      return () => { mounted = false }
    }
  }, [iniciarConFigura, figurasMapa])

  // Cargar archivadas desde servidor (fallback a localStorage)
  useEffect(() => {
    const uid = usuario?.id
    if (!uid) return
    obtenerArchivadas(uid).then((res) => {
      if (res.ok) {
        const keys = (res.data || []).map((c) => `${c.otro_usuario_id}|${c.figura_id ?? 'general'}`)
        setArchivadas(new Set(keys))
        localStorage.setItem(`mensajes_archivadas_${uid}`, JSON.stringify(keys))
      } else {
        const raw = localStorage.getItem(`mensajes_archivadas_${uid}`)
        try {
          const arr = raw ? JSON.parse(raw) : []
          setArchivadas(new Set(Array.isArray(arr) ? arr : []))
        } catch {
          setArchivadas(new Set())
        }
      }
    })
  }, [usuario?.id])

  useEffect(() => {
    const uid = usuario?.id
    if (!uid) return
    const arr = Array.from(archivadas)
    localStorage.setItem(`mensajes_archivadas_${uid}`, JSON.stringify(arr))
  }, [archivadas, usuario?.id])

  // Cerrar con tecla Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const conversaciones = useMemo(() => {
    const conv = {}
    mensajes.forEach((m) => {
      const otroId = m.emisor_id === usuario?.id ? m.receptor_id : m.emisor_id
      const figuraId = m.figura_id ? Number(m.figura_id) : null
      if (!figuraId) return
      const key = `${otroId}|${figuraId}`
      if (!conv[key]) conv[key] = { usuarioId: otroId, figuraId, mensajes: [] }
      conv[key].mensajes.push(m)
    })
    // Asegurar que la conversación seleccionada aparezca aunque no tenga mensajes (iniciada desde ficha)
    if (seleccionado && !conv[seleccionado]) {
      const [otroIdStr, figuraStr] = String(seleccionado).split('|')
      const otroId = Number(otroIdStr)
      const figuraId = figuraStr ? Number(figuraStr) : null
      if (figuraId) conv[seleccionado] = { usuarioId: otroId, figuraId, mensajes: [] }
    }
    // Ordenar por fecha
    Object.values(conv).forEach((c) => c.mensajes.sort((a,b) => new Date(a.fecha_envio) - new Date(b.fecha_envio)))
    return conv
  }, [mensajes, usuario?.id, seleccionado])

  // Marcar como leídos los mensajes de la conversación seleccionada
  useEffect(() => {
    let mounted = true
    const marcar = async () => {
      if (!usuario?.id || !seleccionado) return
      const [otroIdStr, figuraStr] = String(seleccionado).split('|')
      if (!figuraStr) return
      const payload = { receptor_id: usuario.id, emisor_id: Number(otroIdStr), figura_id: Number(figuraStr) }
      const res = await marcarLeidos(payload)
      if (!mounted) return
      if (res.ok) {
        setMensajes((prev) => {
          const next = prev.map((m) => {
            const otroId = m.emisor_id === usuario.id ? m.receptor_id : m.emisor_id
            const figuraId = m.figura_id || 'general'
            const key = `${otroId}|${figuraId}`
            return (key === seleccionado && m.receptor_id === usuario.id) ? { ...m, leido: true } : m
          })
          const uid2 = usuario?.id
          if (uid2) { try { localStorage.setItem(`mensajes_${uid2}`, JSON.stringify(next)) } catch {} }
          return next
        })
      }
    }
    marcar()
    return () => { mounted = false }
  }, [usuario?.id, seleccionado])

  // Prefill texto si se solicita
  useEffect(() => {
    if (prefillTexto && !texto) {
      setTexto(prefillTexto)
    }
  }, [prefillTexto, texto])

  const enviar = async () => {
    if (!texto.trim() || !seleccionado) return
    setEnviando(true)
    const [otroIdStr, figuraStr] = String(seleccionado).split('|')
    const payload = { emisor_id: usuario.id, receptor_id: Number(otroIdStr), contenido: texto.trim() }
    if (figuraStr && figuraStr !== 'general') payload.figura_id = Number(figuraStr)
    const res = await crearMensaje(payload)
    setEnviando(false)
    if (res.ok) {
      setMensajes((prev) => {
        const next = [...prev, res.data]
        const uid2 = usuario?.id
        if (uid2) { try { localStorage.setItem(`mensajes_${uid2}`, JSON.stringify(next)) } catch {} }
        return next
      })
      setTexto('')
      if (prefillTexto) setOcultarComposer(true)
    }
  }

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
      <div className="absolute inset-0 flex items-start justify-center p-4 sm:p-6" onClick={onClose}>
        <div
          className="mt-2 w-full max-w-6xl bg-white rounded-xl shadow-2xl flex flex-col h-[92vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Mensajes</h2>
            <button onClick={onClose} className="rounded-md border px-3 py-1">Cerrar</button>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 min-h-0">
            {/* Lista de conversaciones */}
            <div className={`border-r p-2 overflow-y-auto min-h-0 ${mobileListOpen ? '' : 'hidden md:block'}`}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Conversaciones</h3>
                {(
                  <button
                    type="button"
                    className="text-xs rounded px-2 py-1 border hover:bg-gray-100"
                    onClick={() => setMostrarArchivadas((v) => !v)}
                    title="Mostrar/Ocultar archivadas"
                  >
                    Archivadas ({archivadas.size}) {mostrarArchivadas ? '▲' : '▼'}
                  </button>
                )}
              </div>
              {(cargando || cargandoUI) ? (
                <div aria-busy="true" aria-live="polite">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-2 rounded animate-pulse">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200" />
                        <div className="flex-1">
                          <div className="h-4 w-2/3 bg-gray-200 rounded" />
                          <div className="mt-1 h-3 w-1/2 bg-gray-200 rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : Object.keys(conversaciones).length === 0 ? (
                <p className="text-gray-600">No tienes conversaciones.</p>
              ) : (
                Object.entries(conversaciones)
                  .filter(([key]) => !archivadas.has(key))
                  .map(([key, c]) => {
                  const { usuarioId, figuraId } = c
                  const u = usuariosMapa[usuarioId]
                  const fig = figurasMapa[figuraId]
                  const esPorFigura = true
                  const abrirConfirm = () => setConfirmar({ key, usuarioId, figuraId })
                  const unreadCountConv = (c.mensajes || []).filter((m) => m.receptor_id === usuario.id && !m.leido).length
                  const tieneNoLeidos = unreadCountConv > 0
                  return (
                    <div key={key} onClick={() => { setSeleccionado(key); if (typeof window !== 'undefined' && window.innerWidth < 768) setMobileListOpen(false) }} className={`w-full text-left p-2 rounded hover:bg-gray-100 cursor-pointer ${key === seleccionado ? 'bg-gray-100' : ''} ${tieneNoLeidos ? 'ring-2 ring-red-300' : ''}`}>
                      <div className="flex items-center gap-2 justify-between">
                        <img src={resolveMediaUrl(u?.foto_perfil) || 'https://via.placeholder.com/32?text=👤'} alt="" className="h-8 w-8 rounded-full object-cover border" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/32?text=👤' }} />
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${tieneNoLeidos ? 'text-brand' : ''}`}>{esPorFigura ? (fig?.nombre || 'Cargando…') : (u?.nombre || `Usuario ${usuarioId}`)}</p>
                          <p className="text-xs text-gray-500">{u?.nombre || `Usuario ${usuarioId}`}</p>
                        </div>
                        {tieneNoLeidos && (
                          <span
                            title={`${unreadCountConv} sin leer`}
                            className="shrink-0 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] h-5 min-w-[20px] px-1"
                          >
                            {unreadCountConv}
                          </span>
                        )}
                        <button
                          type="button"
                          className="shrink-0 rounded p-1 text-gray-500 hover:text-red-600"
                          title="Borrar conversación"
                          onClick={(e) => { e.stopPropagation(); abrirConfirm() }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })
              )}

              {archivadas.size > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-gray-600">Archivadas ({archivadas.size})</h4>
                    <button
                      type="button"
                      className="text-xs rounded px-2 py-1 border hover:bg-gray-100"
                      onClick={() => setMostrarArchivadas((v) => !v)}
                    >
                      {mostrarArchivadas ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  {mostrarArchivadas && (
                    <div className="mt-2">
                      {Object.entries(conversaciones)
                        .filter(([key]) => archivadas.has(key))
                        .map(([key, c]) => {
                          const { usuarioId, figuraId } = c
                          const u = usuariosMapa[usuarioId]
                          const fig = figurasMapa[figuraId]
                          const esPorFigura = true
                          const unreadCountConv = (c.mensajes || []).filter((m) => m.receptor_id === usuario.id && !m.leido).length
                          const tieneNoLeidos = unreadCountConv > 0
                          return (
                            <div key={key} onClick={() => { setSeleccionado(key); if (typeof window !== 'undefined' && window.innerWidth < 768) setMobileListOpen(false) }} className={`w-full text-left p-2 rounded hover:bg-gray-100 cursor-pointer ${key === seleccionado ? 'bg-gray-100' : ''} ${tieneNoLeidos ? 'ring-2 ring-red-300' : ''}`}>
                              <div className="flex items-center gap-2 justify-between">
                                <img src={resolveMediaUrl(u?.foto_perfil) || 'https://via.placeholder.com/32?text=👤'} alt="" className="h-8 w-8 rounded-full object-cover border" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/32?text=👤' }} />
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium ${tieneNoLeidos ? 'text-brand' : ''}`}>{esPorFigura ? (fig?.nombre || 'Cargando…') : (u?.nombre || `Usuario ${usuarioId}`)}</p>
                                  <p className="text-xs text-gray-500">{u?.nombre || `Usuario ${usuarioId}`}</p>
                                </div>
                                {tieneNoLeidos && (
                                  <span
                                    title={`${unreadCountConv} sin leer`}
                                    className="shrink-0 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] h-5 min-w-[20px] px-1"
                                  >
                                    {unreadCountConv}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  className="shrink-0 rounded p-1 text-gray-500 hover:text-brand"
                                  title="Desarchivar"
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    const [otroId, figuraIdRaw] = key.split('|')
                                    const payload = { owner_id: usuario.id, otro_usuario_id: Number(otroId), figura_id: figuraIdRaw !== 'general' ? Number(figuraIdRaw) : undefined }
                                    // UI optimista: quitar de archivadas inmediatamente
                                    setArchivadas((prev) => { const n = new Set(prev); n.delete(key); return n })
                                    // Persistir en servidor (si falla, mantenemos estado local)
                                    try {
                                      const res = await desarchivarConversacion(payload)
                                      if (!res || res.ok === false) {
                                        console.warn('Desarchivar servidor falló:', res?.status, res?.error)
                                      }
                                    } catch (e) {
                                      console.warn('Error de red desarchivando:', e)
                                    }
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                    <path d="M20 6H4l2-2h12l2 2z" />
                                    <path d="M4 6l2 14h12l2-14" />
                                    <path d="M12 10v6M9 13l3-3 3 3" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Chat */}
              <div className={`md:col-span-2 ${mobileListOpen ? 'hidden md:flex' : 'flex'} flex-col min-h-0`}>
                <div className="md:hidden p-2 border-b flex items-center justify-between">
                  <button type="button" onClick={() => setMobileListOpen(true)} className="inline-flex items-center gap-2 rounded-md border px-3 py-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M15 19l-7-7 7-7" /></svg>
                    <span>Conversaciones</span>
                  </button>
                  <span className="text-xs text-gray-600">Chat</span>
                </div>
              <div className="flex-1 p-4 overflow-y-auto min-h-0">
                <div className="hidden md:flex sticky top-1/2 -translate-y-1/2 justify-center pointer-events-none z-0">
                  <img src="/fondo.png" alt="" className="opacity-30 w-60 h-60 object-contain" />
                </div>
                <div className={`relative z-10 ${confirmar ? 'pointer-events-none' : ''}`}>
                {(cargando || cargandoUI) ? (
                  <div aria-busy="true" aria-live="polite">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="mb-2 flex">
                        <div className="max-w-[70%] rounded-2xl px-3 py-2">
                          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                          <div className="mt-1 h-3 w-24 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : seleccionado ? (
                  ((conversaciones[seleccionado]?.mensajes) || []).map((m) => (
                    <div key={m.id} className={`mb-2 flex ${m.emisor_id === usuario.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${m.emisor_id === usuario.id ? 'bg-brand text-white' : 'bg-[#FECE00] text-black'}`}>
                        <p>{m.contenido}</p>
                        <div className="mt-1 flex items-center gap-1 justify-end text-[10px] opacity-70">
                          <span>{new Date(m.fecha_envio).toLocaleString()}</span>
                          {m.emisor_id === usuario.id && (
                            <span title={m.leido ? 'Leído' : 'Enviado'} className="inline-flex items-center">
                              {m.leido ? (
                                // doble check (leído)
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                                  <path d="M3 12l4 4 8-8" />
                                  <path d="M9 12l4 4 8-8" />
                                </svg>
                              ) : (
                                // check simple (enviado)
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                                  <path d="M3 12l4 4 8-8" />
                                </svg>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">Selecciona una conversación.</p>
                )}
                </div>
              </div>
              {!ocultarComposer && (
                <div className="border-t p-3 flex gap-2">
                  <input
                    value={texto}
                    onChange={(e) => {
                      const v = e.target.value || ''
                      const capitalized = v.length ? v[0].toUpperCase() + v.slice(1) : v
                      setTexto(capitalized)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        enviar()
                      }
                    }}
                    className="flex-1 rounded border px-3 py-2"
                    placeholder="Escribe un mensaje"
                  />
                  <button onClick={enviar} disabled={enviando} className="rounded-md border px-3 py-2 hover:bg-brand hover:text-white disabled:opacity-50">Enviar</button>
                </div>
              )}
            </div>
          </div>
          {confirmar && (
            <div className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-xl p-4 w-full max-w-sm" role="dialog" aria-modal="true">
                <h3 className="text-base font-semibold">Gestionar conversación</h3>
                <p className="mt-1 text-sm text-gray-600">¿Qué quieres hacer con esta conversación?</p>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    className="rounded-md border px-3 py-2 hover:bg-red-600 hover:text-white"
                    onClick={async () => {
                      const { usuarioId, figuraId, key } = confirmar
                      const payload = { emisor_id: usuario.id, receptor_id: usuarioId, figura_id: Number(figuraId) }
                      const res = await borrarConversacion(payload)
                      if (res.ok) {
                        setMensajes((prev) => {
                          const next = prev.filter((m) => {
                            const otroId = m.emisor_id === usuario.id ? m.receptor_id : m.emisor_id
                            const fId = m.figura_id || 'general'
                            return !(otroId === usuarioId && String(fId) === String(figuraId))
                          })
                          const uid2 = usuario?.id
                          if (uid2) { try { localStorage.setItem(`mensajes_${uid2}`, JSON.stringify(next)) } catch {} }
                          return next
                        })
                        if (key === seleccionado) setSeleccionado(null)
                      }
                      setConfirmar(null)
                    }}
                  >
                    Borrar conversación definitivamente
                  </button>
                  <button
                    className="rounded-md border px-3 py-2 hover:bg-gray-100"
                    onClick={async () => {
                      const { key, usuarioId, figuraId } = confirmar
                      const payload = { owner_id: usuario.id, otro_usuario_id: Number(usuarioId), figura_id: Number(figuraId) }
                      // UI optimista: añadir a archivadas inmediatamente
                      setArchivadas((prev) => new Set([...Array.from(prev), key]))
                      if (key === seleccionado) setSeleccionado(null)
                      setConfirmar(null)
                      // Persistir en servidor (si falla, mantenemos estado local)
                      try {
                        const res = await archivarConversacion(payload)
                        if (!res.ok) {
                          console.warn('Archivado servidor falló:', res.status, res.error)
                          // opcional: revertir si se requiere coherencia estricta
                          // setArchivadas((prev) => { const n = new Set(prev); n.delete(key); return n })
                        }
                      } catch (e) {
                        console.warn('Error de red archivando:', e)
                      }
                    }}
                  >
                    Archivar solo
                  </button>
                  <button className="rounded-md border px-3 py-2" onClick={() => setConfirmar(null)}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}