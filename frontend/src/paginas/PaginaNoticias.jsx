import React, { useEffect, useState } from 'react'
import { getNoticias, crearNoticia, borrarNoticia } from '../servicios/noticias.js'
import { resolveMediaUrl } from '../utils/media.js'
import { useAuth } from '../contextos/ProveedorAuth.jsx'
import { useNavigate } from 'react-router-dom'

export function PaginaNoticias() {
  const { isAuthenticated, usuario } = useAuth()
  const isAdmin = !!usuario && usuario?.rol === 'admin'
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [loadingCrear, setLoadingCrear] = useState(false)
  const [form, setForm] = useState({ titulo: '', resumen: '', descripcion: '', imagen: '', url: '' })

  useEffect(() => {
    document.title = 'FiguMarket - Noticias';
    const cargar = async () => {
      const res = await getNoticias()
      if (res.ok) {
        const d = res.data
        const list = Array.isArray(d) ? d
          : Array.isArray(d?.items) ? d.items
          : Array.isArray(d?.data) ? d.data
          : []
        setItems(list)
      } else {
        const msg = typeof res.error === 'string' ? res.error : (res.error?.message || 'No se pudieron cargar las noticias')
        setError(msg)
      }
      setCargando(false)
    }
    cargar()
  }, [])

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  const crear = async (e) => {
    e.preventDefault()
    if (!isAdmin) return
    setLoadingCrear(true)
    try {
      const res = await crearNoticia(form)
      if (!res.ok) {
        const msg = typeof res.error === 'string' ? res.error : (res.error?.message || 'No se pudo publicar la noticia')
        setError(msg)
      } else {
        setItems((arr) => [res.data, ...arr])
        setForm({ titulo: '', resumen: '', descripcion: '', imagen: '', url: '' })
      }
    } finally {
      setLoadingCrear(false)
    }
  }
  const eliminar = async (id) => {
    if (!isAdmin) return
    const ok = window.confirm('¿Eliminar esta noticia?')
    if (!ok) return
    const res = await borrarNoticia(id)
    if (!res.ok) {
      const msg = typeof res.error === 'string' ? res.error : (res.error?.message || 'No se pudo eliminar')
      alert(msg)
      return
    }
    setItems((arr) => arr.filter((n) => n.id !== id))
  }

  return (
    <section className="mx-auto max-w-6xl px-4">
      <header className="text-center">
        <h1 className="text-3xl font-bold">Noticias</h1>
        <p className="mt-2 text-gray-600">Actualizaciones y novedades del mundo de las figuras.</p>
      </header>

      {isAdmin && (
        <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={crear}>
          <input name="titulo" value={form.titulo} onChange={onChange} placeholder="Título" className="border rounded px-3 py-2" required />
          <input name="resumen" value={form.resumen} onChange={onChange} placeholder="Resumen" className="border rounded px-3 py-2" />
          <input name="imagen" value={form.imagen} onChange={onChange} placeholder="URL de imagen" className="border rounded px-3 py-2" />
          <input name="url" value={form.url} onChange={onChange} placeholder="Enlace externo (opcional)" className="border rounded px-3 py-2" />
          <textarea name="descripcion" value={form.descripcion} onChange={onChange} placeholder="Descripción" className="border rounded px-3 py-2 md:col-span-2" rows={3} />
          <div className="md:col-span-2 flex items-center gap-3">
            <button type="submit" disabled={loadingCrear} className="inline-flex items-center h-10 rounded-md px-4 bg-brand text-white disabled:opacity-50">{loadingCrear ? 'Publicando...' : 'Publicar noticia'}</button>
            {error && <span className="text-red-600 text-sm">{error}</span>}
          </div>
        </form>
      )}

      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 text-red-700 p-3">{typeof error === 'string' ? error : String(error)}</div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cargando ? (
          Array.from({ length: 6 }).map((_, i) => (
            <article key={i} className="rounded-xl border overflow-hidden shadow-sm animate-pulse">
              <div className="h-48 sm:h-40 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-2/3 bg-gray-100 rounded" />
                <div className="h-4 w-1/2 bg-gray-100 rounded" />
              </div>
            </article>
          ))
        ) : (!Array.isArray(items) || items.length === 0) ? (
          <p className="text-gray-600">No hay noticias publicadas todavía.</p>
        ) : (
          items.map((n) => (
            <article key={n.id} className="group relative rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition bg-white">
              <div
                className="h-48 sm:h-40 bg-center bg-cover"
                style={{
                  backgroundImage: (() => {
                    const raw = n?.imagen || n?.imagen_url || n?.image || ''
                    const url = typeof raw === 'string' ? (resolveMediaUrl(raw) || raw) : ''
                    return url ? `url(${url})` : 'none'
                  })()
                }}
              >
                {!n.imagen && (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">Sin imagen</div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold line-clamp-2">{n.titulo}</h2>
                {n.resumen && <p className="mt-2 text-sm text-gray-600 line-clamp-3">{n.resumen}</p>}
                <div className="mt-4 flex items-center justify-between">
                  {n.url ? (
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 h-10 rounded-md px-3 border hover:bg-gray-100 w-full justify-center sm:w-auto"
                    >
                      <span>Leer más</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <path d="M14 3h7v7h-2V6.414l-8.293 8.293-1.414-1.414L17.586 5H14V3z" />
                        <path d="M5 5h7v2H7v10h10v-5h2v7H5V5z" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">Sin enlace externo</span>
                  )}
                </div>
                {isAdmin && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Editar"
                      title="Editar"
                      onClick={(e) => { e.stopPropagation(); navigate(`/admin/noticias?edit=${n.id}`) }}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-full border text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-label="Eliminar"
                      title="Eliminar"
                      onClick={(e) => { e.stopPropagation(); eliminar(n.id) }}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-full border text-red-600 hover:text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <path d="M9 3h6l1 2h5v 2H3V5h5l1-2zm-1 6h8l-1 10H9L8 9z"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}