// Servicio de noticias para el slider de inicio
import { apiFetch } from './apiClient.js'

// Obtiene noticias públicas para el slider.
// La API esperada: GET /api/noticias -> { ok: boolean, data: Array<Noticia> }
// Donde Noticia puede tener: titulo, resumen, descripcion, imagen, imagen_url, url, link
export async function getNoticias() {
  try {
    const res = await apiFetch('/api/noticias')
    return res
  } catch (e) {
    return { ok: false, data: [], error: e?.message || 'Error de red' }
  }
}

// Crea una noticia (requiere admin)
export async function crearNoticia(payload) {
  try {
    const res = await apiFetch('/api/noticias', { method: 'POST', body: payload })
    return res
  } catch (e) {
    return { ok: false, error: e?.message || 'Error de red' }
  }
}

// Actualiza una noticia (requiere admin)
export async function actualizarNoticia(id, payload) {
  try {
    const res = await apiFetch(`/api/noticias/${id}`, { method: 'PUT', body: payload })
    return res
  } catch (e) {
    return { ok: false, error: e?.message || 'Error de red' }
  }
}

// Borra una noticia (requiere admin)
export async function borrarNoticia(id) {
  try {
    const res = await apiFetch(`/api/noticias/${id}`, { method: 'DELETE' })
    return res
  } catch (e) {
    return { ok: false, error: e?.message || 'Error de red' }
  }
}