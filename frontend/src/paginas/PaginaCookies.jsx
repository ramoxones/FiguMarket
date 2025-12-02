import React, { useEffect } from 'react'

export default function PaginaCookies() {
  useEffect(() => { document.title = 'FiguMarket - Cookies' }, [])
  return (
    <section className="container-base py-10">
      <h1 className="text-2xl font-bold">Política de cookies</h1>
      <p className="mt-4 text-sm text-gray-700">
        Usamos cookies para recordar tus preferencias, mantener tu sesión activa
        y analizar el uso del sitio. Puedes configurar las cookies desde tu navegador.
      </p>
      <ul className="mt-6 space-y-2 text-sm text-gray-700">
        <li>Cookies esenciales: necesarias para el funcionamiento básico.</li>
        <li>Cookies de rendimiento: ayudan a mejorar la experiencia.</li>
        <li>Cookies de terceros: integraciones como analítica o redes sociales.</li>
      </ul>
    </section>
  )
}