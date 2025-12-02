import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { actualizarFigura } from '../servicios/figuras.js'
import { formatCurrencyEUR } from '../utils/index.js'

const PLAN_INFO = {
  '3d': { label: '3 días', days: 3, price: 4.99 },
  '15d': { label: '15 días', days: 15, price: 14.99 },
  '90d': { label: '3 meses', days: 90, price: 29.99 },
}

export function PaginaCheckoutDestacar() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const planKey = params.get('plan') || '3d'
  const info = PLAN_INFO[planKey] || PLAN_INFO['3d']
  const [metodo, setMetodo] = useState('tarjeta')
  const [form, setForm] = useState({ nombre: '', numero: '', caducidad: '', cvv: '', paypalEmail: '' })
  const navigate = useNavigate()
  useEffect(() => { document.title = 'FiguMarket - Checkout destacar' }, [])

  const resumen = useMemo(() => ({ id, planKey, precio: info.price, duracion: info.label }), [id, planKey, info])

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      const now = new Date()
      const until = new Date(now.getTime() + (info.days * 24 * 60 * 60 * 1000))
      const payload = { destacado: true, destacado_inicio: now.toISOString(), destacado_fin: until.toISOString() }
      const res = await actualizarFigura(Number(id), payload)
      if (!res.ok) {
        alert(typeof res.error === 'string' ? res.error : 'No se pudo actualizar la figura como destacada')
        return
      }
      alert(`Pago completado. La figura ${id} ahora es destacada (${info.label}).`)
      navigate(`/producto/${id}`)
    } catch (err) {
      alert('Error de red al marcar la figura como destacada')
    }
  }

  return (
    <section className="max-w-xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-center sm:text-left">Checkout de destacado</h1>
      <p className="mt-2 text-gray-600 text-center sm:text-left">Completa los datos de pago (simulado) para destacar tu figura.</p>

      <div className="mt-4 rounded-lg border bg-white p-4 sm:p-6 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-md bg-black text-white px-3 py-1 text-xs font-semibold">
          <span>{resumen.duracion}</span>
          <span className="opacity-80">・</span>
          <span>{formatCurrencyEUR(resumen.precio)}</span>
        </div>
        <p className="mt-3 text-sm">Figura ID: <span className="font-semibold">{id}</span></p>
      </div>

      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-semibold mb-2">Método de pago</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMetodo('tarjeta')}
              className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm ${metodo === 'tarjeta' ? 'bg-brand text-white border-brand' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <span className="inline-flex items-center gap-1">
                <img src="https://cdn.simpleicons.org/visa" alt="Visa" className="h-4 w-4" />
                <img src="https://cdn.simpleicons.org/mastercard" alt="Mastercard" className="h-4 w-4" />
              </span>
              <span>Tarjeta</span>
            </button>
            <button
              type="button"
              onClick={() => setMetodo('paypal')}
              className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm ${metodo === 'paypal' ? 'bg-brand text-white border-brand' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <img src="https://cdn.simpleicons.org/paypal" alt="PayPal" className="h-4 w-4" />
              <span>PayPal</span>
            </button>
          </div>
        </div>

        {metodo === 'tarjeta' ? (
          <div className="rounded-lg border bg-white p-4 sm:p-6 grid gap-3">
            <div>
              <label className="block text-sm">Nombre del titular</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre Apellidos" />
            </div>
            <div>
              <label className="block text-sm">Número de tarjeta</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} placeholder="1234 5678 9012 3456" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm">Caducidad</label>
                <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.caducidad} onChange={(e) => setForm({ ...form, caducidad: e.target.value })} placeholder="MM/AA" />
              </div>
              <div>
                <label className="block text-sm">CVV</label>
                <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.cvv} onChange={(e) => setForm({ ...form, cvv: e.target.value })} placeholder="123" />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border bg-white p-4 sm:p-6 grid gap-3">
            <label className="block text-sm">Email de PayPal</label>
            <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.paypalEmail} onChange={(e) => setForm({ ...form, paypalEmail: e.target.value })} placeholder="usuario@correo.com" />
          </div>
        )}

        <div className="mt-2 flex">
          <button type="submit" className="w-full inline-flex items-center justify-center h-12 rounded-lg px-4 bg-[#FECE00] text-black font-bold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#FECE00]">Pagar y destacar</button>
        </div>
      </form>
    </section>
  )
}