import React, { useEffect } from 'react'

export default function PaginaPrivacidad() {
  useEffect(() => { document.title = 'FiguMarket - Privacidad' }, [])
  return (
    <section className="container-base py-10">
      <h1 className="text-2xl font-bold">Política de privacidad</h1>
      <p className="mt-4 text-sm text-gray-700">
        En FiguMarket cuidamos tus datos. Recogemos la información necesaria para
        gestionar tu cuenta y tus publicaciones, y la usamos para mejorar tu experiencia.
      </p>
      <ul className="mt-6 space-y-2 text-sm text-gray-700">
        <li>Datos recogidos: nombre, email, teléfono (opcional), anuncios publicados.</li>
        <li>Finalidad: gestión de usuarios, comunicación y seguridad.</li>
        <li>Conservación: el tiempo necesario para prestar el servicio.</li>
        <li>Derechos: acceso, rectificación, cancelación y oposición.</li>
      </ul>
    </section>
  )
}