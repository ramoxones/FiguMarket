import React, { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { formatCurrencyEUR } from '../utils/index.js'

const PLANES = [
  { key: '3d', titulo: 'Destacado 3 días', precio: 4.99, descripcion: 'Tu figura aparece en “Figuras destacadas” durante 3 días.' },
  { key: '15d', titulo: 'Destacado 15 días', precio: 14.99, descripcion: 'Mayor visibilidad por 15 días en la sección destacada.' },
  { key: '90d', titulo: 'Destacado 3 meses', precio: 29.99, descripcion: 'Máxima exposición durante 90 días, ideal para ventas prolongadas.' },
]

export function PaginaDestacar() {
  const { id } = useParams()
  const navigate = useNavigate()
  useEffect(() => { document.title = 'FiguMarket - Destacar figura' }, [])
  return (
    <section>
      <h1 className="text-2xl font-bold">Destacar figura</h1>
      <p className="mt-2 text-gray-600">Elige el plan de visibilidad para tu figura (ID {id}). Este flujo es ficticio para demostrar el proceso completo.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {PLANES.map((p) => (
          <div key={p.key} className="rounded-lg border bg-white shadow-sm p-4 flex flex-col">
            <h2 className="text-lg font-semibold">{p.titulo}</h2>
            <p className="mt-1 text-sm text-gray-600">{p.descripcion}</p>
            <p className="mt-3 text-2xl font-bold text-brand">{formatCurrencyEUR(p.precio)}</p>
            <ul className="mt-3 text-sm text-gray-700 list-disc list-inside space-y-1">
              <li>Aparece al inicio en “Figuras destacadas”.</li>
              <li>Distintivo visual de “Destacado” en la tarjeta.</li>
              <li>Sin cargos reales: demostración TFG.</li>
            </ul>
            <button
              className="mt-4 inline-flex items-center justify-center rounded-md border px-3 py-2 hover:bg-brand hover:text-white"
              onClick={() => navigate(`/destacar/${id}/checkout?plan=${p.key}`)}
            >
              Continuar
            </button>
          </div>
        ))}
      </div>

    </section>
  )
}