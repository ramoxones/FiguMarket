import React from 'react'

export function Modal({ open, title, children, onClose }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-auto mt-24 max-w-lg rounded-lg bg-white shadow-lg">
        <div className="border-b px-4 py-3">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="px-4 py-4">
          {children}
        </div>
        <div className="border-t px-4 py-3 text-right">
          <button className="text-brand hover:text-brand-dark" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}