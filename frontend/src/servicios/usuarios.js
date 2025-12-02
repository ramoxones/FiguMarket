import { apiFetch } from './apiClient.js'

export const getUsuarios = () => apiFetch('/api/usuarios')
export const getUsuario = (id) => apiFetch(`/api/usuarios/${id}`)
export const crearUsuario = (payload) => apiFetch('/api/usuarios', { method: 'POST', body: payload })
export const borrarUsuario = (id) => apiFetch(`/api/usuarios/${id}`, { method: 'DELETE' })
export const actualizarUsuario = (id, payload) => apiFetch(`/api/usuarios/${id}`, { method: 'PUT', body: payload })
export const subirFotoPerfil = async (id, file) => {
  const form = new FormData()
  form.append('file', file)
  return apiFetch(`/api/usuarios/${id}/foto`, { method: 'POST', body: form })
}