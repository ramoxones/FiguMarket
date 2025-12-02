import { apiFetch } from './apiClient.js'

export async function getMisSeguimientos() {
  return apiFetch('/api/seguimientos')
}

export async function addSeguimiento(figura_id) {
  return apiFetch('/api/seguimientos', { method: 'POST', body: { figura_id } })
}

export async function removeSeguimiento(figura_id) {
  return apiFetch('/api/seguimientos', { method: 'DELETE', body: { figura_id } })
}

export async function getSeguimientoCount(figura_id) {
  return apiFetch(`/api/seguimientos/count?figura_id=${figura_id}`)
}

export async function getSeguimientoCounts(ids = []) {
  const qs = Array.isArray(ids) && ids.length ? ids.join(',') : ''
  return apiFetch(`/api/seguimientos/counts?ids=${qs}`)
}