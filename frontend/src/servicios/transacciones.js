import { apiFetch } from './apiClient.js'

export const getTransacciones = () => apiFetch('/api/transacciones')
export const getTransaccion = (id) => apiFetch(`/api/transacciones/${id}`)
export const borrarTransaccion = (id) => apiFetch(`/api/transacciones/${id}`, { method: 'DELETE' })