import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contextos/ProveedorAuth.jsx'
import { crearNoticia, getNoticias, actualizarNoticia, borrarNoticia } from '../servicios/noticias.js'
import { useNavigate, useLocation } from 'react-router-dom'

export function AdminNoticias() {
  const { isAuthenticated, usuario } = useAuth()
  const navigate = useNavigate()
  const { search } = useLocation()
  const editId = new URLSearchParams(search).get('edit')
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ titulo: '', resumen: '', descripcion: '', imagen: '', url: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)
  const [resaltarId, setResaltarId] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [savingId, setSavingId] = useState(null)

  useEffect(() => { document.title = 'FiguMarket - Admin noticias' }, [])

  useEffect(() => {
    if (!isAuthenticated || usuario?.rol !== 'admin') {
      navigate('/')
      return
    }
    (async () => {
      const res = await getNoticias()
      if (res.ok) {
        const d = res.data
        const list = Array.isArray(d) ? d
          : Array.isArray(d?.items) ? d.items
          : Array.isArray(d?.data) ? d.data
          : []
        setItems(list)
        const init = {}
        for (const n of list) {
          init[n.id] = { titulo: n.titulo || '', resumen: n.resumen || '', imagen: n.imagen || '', url: n.url || '' }
        }
        setDrafts(init)
      }
      setCargando(false)
      if (editId) {
        setResaltarId(Number(editId))
        // Scroll y foco al título del elemento
        setTimeout(() => {
          const el = document.getElementById(`news-${editId}`)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            const input = el.querySelector('input')
            if (input) input.focus()
          }
        }, 100)
        // quitar resaltado después de unos segundos
        setTimeout(() => setResaltarId(null), 4000)
      }
    })()
  }, [isAuthenticated, usuario, navigate])

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const crear = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const payload = { ...form }
    const res = await crearNoticia(payload)
    setLoading(false)
    if (!res.ok) { setError(typeof res.error === 'string' ? res.error : 'Error al crear'); return }
    setItems((arr) => [res.data, ...arr])
    setForm({ titulo: '', resumen: '', descripcion: '', imagen: '', url: '' })
  }

  const guardar = async (id, cambios) => {
    setSavingId(id)
    try {
      const res = await actualizarNoticia(id, cambios)
      if (!res.ok) {
        alert(typeof res.error === 'string' ? res.error : 'No se pudo actualizar')
        return
      }
      setItems((arr) => arr.map((n) => (n.id === id ? res.data : n)))
      setDrafts((d) => ({
        ...d,
        [id]: {
          titulo: res.data?.titulo || d[id]?.titulo || '',
          resumen: res.data?.resumen || d[id]?.resumen || '',
          imagen: res.data?.imagen || d[id]?.imagen || '',
          url: res.data?.url || d[id]?.url || '',
        }
      }))
    } finally {
      setSavingId(null)
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta noticia?')) return
    const res = await borrarNoticia(id)
    if (!res.ok) { alert('No se pudo eliminar'); return }
    setItems((arr) => arr.filter((n) => n.id !== id))
  }

  return (
    <section>
      <h1 className="text-2xl font-bold">Administración de noticias</h1>
      <p className="mt-2 text-gray-600">Publica, edita y elimina noticias para el slider.</p>

      <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={crear}>
        <input name="titulo" value={form.titulo} onChange={onChange} placeholder="Título" className="border rounded px-3 py-2" required />
        <input name="resumen" value={form.resumen} onChange={onChange} placeholder="Resumen" className="border rounded px-3 py-2" />
        <input name="imagen" value={form.imagen} onChange={onChange} placeholder="URL de imagen" className="border rounded px-3 py-2" />
        <input name="url" value={form.url} onChange={onChange} placeholder="Enlace externo (opcional)" className="border rounded px-3 py-2" />
        <textarea name="descripcion" value={form.descripcion} onChange={onChange} placeholder="Descripción" className="border rounded px-3 py-2 md:col-span-2" rows={3} />
        <div className="md:col-span-2 flex items-center gap-3">
          <button type="submit" disabled={loading} className="inline-flex items-center h-10 rounded-md px-4 bg-brand text-white disabled:opacity-50">{loading ? 'Publicando...' : 'Publicar noticia'}</button>
          {error && <span className="text-red-600 text-sm">{error}</span>}
        </div>
      </form>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cargando ? (
          Array.from({ length: 6 }).map((_, i) => (
            <article key={i} className="rounded-lg border overflow-hidden animate-pulse">
              <div className="h-36 bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-2/3 bg-gray-100 rounded" />
                <div className="h-3 w-1/2 bg-gray-100 rounded" />
                <div className="h-8 w-full bg-gray-200 rounded" />
              </div>
            </article>
          ))
        ) : items.length === 0 ? (
          <p className="text-gray-600">No hay noticias publicadas.</p>
        ) : (
          items.map((n) => (
            <article key={n.id} id={`news-${n.id}`} className={`rounded-lg border overflow-hidden ${resaltarId === n.id ? 'ring-2 ring-brand' : ''}`}>
              <div className="h-36 bg-center bg-cover" style={{ backgroundImage: n.imagen ? `url(${n.imagen})` : 'none' }} />
              <div className="p-3">
                <input
                  className="w-full border rounded px-2 py-1 font-semibold"
                  value={drafts[n.id]?.titulo ?? ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [n.id]: { ...(d[n.id] || {}), titulo: e.target.value } }))}
                  onBlur={(e) => guardar(n.id, { titulo: e.target.value })}
                />
                <textarea
                  className="mt-2 w-full border rounded px-2 py-1 text-sm"
                  value={drafts[n.id]?.resumen ?? ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [n.id]: { ...(d[n.id] || {}), resumen: e.target.value } }))}
                  onBlur={(e) => guardar(n.id, { resumen: e.target.value })}
                />
                <input
                  className="mt-2 w-full border rounded px-2 py-1 text-sm"
                  value={drafts[n.id]?.imagen ?? ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [n.id]: { ...(d[n.id] || {}), imagen: e.target.value } }))}
                  onBlur={(e) => guardar(n.id, { imagen: e.target.value })}
                  placeholder="URL imagen"
                />
                <input
                  className="mt-2 w-full border rounded px-2 py-1 text-sm"
                  value={drafts[n.id]?.url ?? ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [n.id]: { ...(d[n.id] || {}), url: e.target.value } }))}
                  onBlur={(e) => guardar(n.id, { url: e.target.value })}
                  placeholder="URL externa"
                />
                <div className="mt-3 flex items-center justify-between">
                  <a href={n.url || '#'} target="_blank" rel="noreferrer" className="text-blue-600 text-sm hover:underline">{n.url ? 'Ver' : 'Sin enlace'}</a>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => guardar(n.id, drafts[n.id] || { titulo: n.titulo, resumen: n.resumen, imagen: n.imagen, url: n.url })}
                      disabled={savingId === n.id}
                      className="inline-flex items-center h-8 rounded-md px-3 border bg-brand text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {savingId === n.id ? 'Guardando…' : 'Guardar'}
                    </button>
                    <button onClick={() => eliminar(n.id)} className="inline-flex items-center h-8 rounded-md px-3 border hover:bg-red-600 hover:text-white">Eliminar</button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}