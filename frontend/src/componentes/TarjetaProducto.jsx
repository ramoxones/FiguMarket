import React from 'react'
import { Boton } from './Boton.jsx'

export function TarjetaProducto({ producto }) {
  const { nombre, precio, imagenes } = producto
  const imgSrc = imagenes?.[0]?.url || 'https://via.placeholder.com/800x600?text=Figura'
  const precioNumber = Number(precio)

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <img src={imgSrc} alt={nombre} className="h-48 w-full object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{nombre}</h3>
        <p className="mt-1 text-brand font-bold">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(precioNumber)}</p>
      </div>
    </div>
  )
}