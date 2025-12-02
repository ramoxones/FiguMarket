import { API_BASE_URL } from './config.js'

function buildUrl(path) {
  return `${API_BASE_URL}${path}`
}

export async function apiFetch(path, { method = 'GET', headers = {}, body, token } = {}) {
  try {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
    const finalHeaders = {
      ...(headers || {}),
    }
    if (!isFormData && !finalHeaders['Content-Type'] && body) {
      finalHeaders['Content-Type'] = 'application/json'
    }
    const storedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('figumarket_token') : ''
    const useToken = token || storedToken
    if (useToken) {
      finalHeaders['Authorization'] = `Bearer ${useToken}`
    }

    const res = await fetch(buildUrl(path), {
      method,
      headers: finalHeaders,
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    })

    const contentType = res.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    const data = isJson ? await res.json() : await res.text()

    if (!res.ok) {
      return { ok: false, status: res.status, error: data }
    }
    return { ok: true, data }
  } catch (err) {
    return { ok: false, status: 0, error: err?.message || 'Network error' }
  }
}