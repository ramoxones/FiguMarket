import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

export function PaginaNoEncontrada() {
  useEffect(() => { document.title = 'FiguMarket - 404' }, [])
  return (
    <section className="text-center">
      <h1 className="text-3xl font-bold">404 - Página no encontrada</h1>
      <p className="mt-2 text-gray-600">La ruta solicitada no existe.</p>
      <Link to="/" className="mt-6 inline-block text-brand hover:text-brand-dark">Volver al inicio</Link>
    </section>
  )
}