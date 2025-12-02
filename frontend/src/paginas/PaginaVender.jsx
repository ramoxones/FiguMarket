import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contextos/ProveedorAuth.jsx'
import { crearFigura } from '../servicios/figuras.js'
import { Boton } from '../componentes/Boton.jsx'

export function PaginaVender() {
  const { usuario, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState('')
  const [escala, setEscala] = useState('1:12')
  const [precio, setPrecio] = useState('')
  const [disponible, setDisponible] = useState(true)
  const [estadoFigura, setEstadoFigura] = useState('en buen estado')
  const [archivos, setArchivos] = useState([])
  const [imagenesData, setImagenesData] = useState([])
  const inputFilesRef = useRef(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const previews = useMemo(() => imagenesData, [imagenesData])

  useEffect(() => { document.title = 'FiguMarket - Vender' }, [])

  const onSelectFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    setArchivos(files)
    const readers = files.map((file) => new Promise((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve(r.result)
      r.onerror = reject
      r.readAsDataURL(file)
    }))
    try {
      const datas = await Promise.all(readers)
      setImagenesData(datas)
    } catch (err) {
      console.error(err)
      setError('No se pudieron leer las imágenes seleccionadas')
    }
  }

  const publicar = async (e) => {
    e.preventDefault()
    setError('')
    if (!isAuthenticated || !usuario?.id) {
      setError('Debes iniciar sesión para publicar una figura.')
      return
    }
    if (!nombre.trim() || !precio) {
      setError('Por favor, completa al menos nombre y precio.')
      return
    }
    const payload = {
      usuario_id: usuario.id,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      categoria: (categoria || '').trim() || 'otros',
      escala: (escala || '').trim() || '1:12',
      estado: 'disponible',
      estado_figura: (estadoFigura || 'en buen estado'),
      precio: String(Number(precio)).replace(',', '.'),
      disponible: Boolean(disponible),
      fecha_publicacion: new Date().toISOString(),
      imagenes: previews, // data URLs
    }
    setEnviando(true)
    const res = await crearFigura(payload)
    setEnviando(false)
    if (res.ok) {
      navigate(`/producto/${res.data?.id}`)
    } else {
      setError(res.error || 'No se pudo publicar la figura')
    }
  }

  return (
    <section className="max-w-3xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-center sm:text-left">Publicar nueva figura</h1>
      {!isAuthenticated && (
        <p className="mt-3 text-sm">Debes iniciar sesión para publicar. <Link to="/login" className="text-brand hover:text-brand-dark">Ir a login</Link></p>
      )}
      <div className="mt-4 rounded-lg border bg-white p-4 sm:p-6 shadow-sm">
      <form onSubmit={publicar} className="grid gap-4">
        {error && <p className="text-red-600">{error}</p>}
        <div>
          <label className="block text-sm text-gray-600">Nombre</label>
          <input type="text" className="mt-1 w-full rounded-md border px-3 py-2" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Batman Premium 1:6" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Descripción</label>
          <textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={4} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Detalles del estado, caja, accesorios..." />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Categoría</label>
            <select className="mt-1 w-full rounded-md border px-3 py-2" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
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
            <select className="mt-1 w-full rounded-md border px-3 py-2" value={escala} onChange={(e) => setEscala(e.target.value)}>
              <option value="1:10">1:10</option>
              <option value="1:4">1:4</option>
              <option value="1:12">1:12</option>
              <option value="1:6">1:6</option>
              <option value="otros">Otros</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Estado de figura</label>
            <select className="mt-1 w-full rounded-md border px-3 py-2" value={estadoFigura} onChange={(e) => setEstadoFigura(e.target.value)}>
              <option value="sin abrir">Sin abrir</option>
              <option value="como nueva">Como nueva</option>
              <option value="en buen estado">En buen estado</option>
              <option value="en mal estado">En mal estado</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Precio (€)</label>
            <input type="number" step="0.01" className="mt-1 w-full rounded-md border px-3 py-2" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Ej. 149.99" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">Visible en catálogo</span>
            <button
              type="button"
              role="switch"
              aria-checked={disponible}
              onClick={() => setDisponible((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${disponible ? 'bg-brand' : 'bg-gray-300'}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${disponible ? 'translate-x-5' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Fotos</label>
          <input ref={inputFilesRef} type="file" multiple accept="image/*,.webp" onChange={onSelectFiles} className="hidden" />
          <div className="mt-1 flex items-center justify-center sm:justify-start gap-3">
            <button
              type="button"
              onClick={() => inputFilesRef.current?.click()}
              className="inline-flex items-center gap-2 h-10 rounded-lg bg-brand text-white px-4 font-semibold shadow-md hover:shadow-lg hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M4 7a2 2 0 012-2h2l1-1h6l1 1h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7zm8 2a4 4 0 100 8 4 4 0 000-8z"/></svg>
              <span>Subir fotos</span>
            </button>
            {archivos.length > 0 && (
              <span className="text-xs text-gray-600">{archivos.length} archivo(s) seleccionados</span>
            )}
          </div>
          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {previews.map((src, i) => (
                <img key={i} src={src} alt={`preview ${i}`} className="h-28 w-full object-cover rounded border" />
              ))}
            </div>
          )}
        </div>
        <div className="mt-2 flex justify-center">
          <Boton type="submit" disabled={enviando || !isAuthenticated}>{enviando ? 'Publicando...' : 'Publicar Figura'}</Boton>
        </div>
      </form>
      </div>
    </section>
  )
}