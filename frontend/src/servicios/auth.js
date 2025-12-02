import { apiFetch } from './apiClient.js'

export const login = async ({ email, password }) => {
  const res = await apiFetch('/api/login', { method: 'POST', body: { email, password } })
  if (!res.ok) return { error: res.error, status: res.status }
  return res.data
}

export const me = async () => {
  const res = await apiFetch('/api/me', { method: 'GET' })
  if (!res.ok) return { error: res.error, status: res.status }
  return res.data
}