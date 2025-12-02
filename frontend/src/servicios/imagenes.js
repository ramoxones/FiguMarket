import { apiFetch } from './apiClient.js'

export const getImagenes = () => apiFetch('/api/imagenes')
export const getImagen = (id) => apiFetch(`/api/imagenes/${id}`)
export const crearImagen = (payload) => apiFetch('/api/imagenes', { method: 'POST', body: payload })
export const borrarImagen = (id) => apiFetch(`/api/imagenes/${id}`, { method: 'DELETE' })