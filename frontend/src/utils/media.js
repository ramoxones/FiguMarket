import { API_BASE_URL } from '../servicios/config.js'

export function resolveMediaUrl(url) {
  if (!url) return url
  // If already absolute (http/https/data), return as is
  if (/^(https?:\/\/|data:)/i.test(url)) return url
  // Ensure leading slash
  const path = url.startsWith('/') ? url : `/${url}`
  return `${API_BASE_URL}${path}`
}