import { apiFetch } from './apiClient.js'

// Permite pasar filtros opcionales: { emisor_id, receptor_id, figura_id }
export const getMensajes = (params) => {
  const qs = params && Object.keys(params).length
    ? '?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== ''))
    : ''
  return apiFetch(`/api/mensajes${qs}`)
}
export const getMensaje = (id) => apiFetch(`/api/mensajes/${id}`)
export const crearMensaje = (payload) => apiFetch('/api/mensajes', { method: 'POST', body: payload })
export const borrarMensaje = (id) => apiFetch(`/api/mensajes/${id}`, { method: 'DELETE' })
export const marcarLeidos = (payload) => apiFetch('/api/mensajes/marcar-leidos', { method: 'POST', body: payload })
export const borrarConversacion = (payload) => apiFetch('/api/mensajes/borrar-conversacion', { method: 'POST', body: payload })

// Archivado persistente en servidor
export const obtenerArchivadas = (ownerId) => apiFetch(`/api/conversaciones-archivadas?owner_id=${ownerId}`)
export const archivarConversacion = (payload) => apiFetch('/api/conversaciones-archivadas', { method: 'POST', body: payload })
export const desarchivarConversacion = (payload) => apiFetch('/api/conversaciones-archivadas', { method: 'DELETE', body: payload })