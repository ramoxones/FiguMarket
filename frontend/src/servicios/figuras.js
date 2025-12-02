import { apiFetch } from './apiClient.js'

export const getFiguras = (params = {}) => {
  const qs = []
  for (const [key, val] of Object.entries(params || {})) {
    if (val === undefined || val === null) continue
    if (Array.isArray(val)) {
      for (const v of val) qs.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`)
    } else {
      qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
    }
  }
  const suffix = qs.length ? `?${qs.join('&')}` : ''
  return apiFetch(`/api/figuras${suffix}`)
}
export const getFigura = (id) => apiFetch(`/api/figuras/${id}`)
export const crearFigura = (payload) => apiFetch('/api/figuras', { method: 'POST', body: payload })
export const borrarFigura = (id) => apiFetch(`/api/figuras/${id}`, { method: 'DELETE' })
export const actualizarFigura = (id, payload) => apiFetch(`/api/figuras/${id}`, { method: 'PUT', body: payload })
export const getFigurasMetadata = () => apiFetch('/api/figuras/metadata')
