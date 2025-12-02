import React, { useEffect } from 'react'

export default function PaginaAvisoLegal() {
  useEffect(() => { document.title = 'FiguMarket - Aviso legal' }, [])
  return (
    <section className="container-base py-10">
      <h1 className="text-2xl font-bold">Aviso legal y Términos</h1>
      <p className="mt-4 text-sm text-gray-700">
        Este portal de compraventa de figuras de segunda mano ofrece un espacio
        para publicar, descubrir y contactar entre usuarios. Al utilizar el sitio,
        aceptas nuestras condiciones de uso y te comprometes a cumplir las normas
        de convivencia y publicación.
      </p>
      <ul className="mt-6 space-y-2 text-sm text-gray-700">
        <li>Responsabilidad de contenidos: cada usuario es responsable de lo que publica.</li>
        <li>Propiedad intelectual: respeta marcas, imágenes y derechos de terceros.</li>
        <li>Prohibiciones: no se permite contenido ilegal, engañoso o ofensivo.</li>
        <li>Moderación: podemos retirar anuncios que incumplan las normas.</li>
      </ul>
    </section>
  )
}