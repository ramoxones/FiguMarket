import React, { useEffect } from 'react'

export default function PaginaQuienesSomos() {
  useEffect(() => { document.title = 'FiguMarket - Quiénes somos' }, [])
  return (
    <section className="container-base py-10">
      <h1 className="text-2xl font-bold">Quiénes somos</h1>
      <p className="mt-4 text-sm text-gray-700">
        Somos un equipo de coleccionistas que creó FiguMarket para facilitar
        el intercambio de figuras de segunda mano. Nuestro objetivo es que
        encontrar, publicar y vender sea simple, seguro y divertido.
      </p>
      <p className="mt-3 text-sm text-gray-700">
        Creemos en la comunidad y en dar una segunda vida a las piezas. Si quieres
        colaborar o tienes sugerencias, ¡nos encantará escucharte!
      </p>
    </section>
  )
}