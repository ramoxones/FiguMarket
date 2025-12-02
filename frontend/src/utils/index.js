export function formatCurrencyEUR(value) {
  try {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value || 0)
  } catch {
    return `${value}`
  }
}