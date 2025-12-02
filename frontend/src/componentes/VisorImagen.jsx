import React, { useEffect } from 'react'

export function VisorImagen({ src, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!src) return null

  return (
    <div className="fixed inset-0 z-50" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
      <div className="absolute inset-0 bg-black/80" onClick={(e) => { e.stopPropagation(); onClose?.() }} />
      <div
        className="absolute inset-0 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
      >
        <img src={src} alt="Imagen" className="max-w-full max-h-full rounded shadow-2xl" />
        <button aria-label="Cerrar" onClick={(e) => { e.stopPropagation(); onClose?.() }}
                className="absolute top-4 right-4 rounded-full bg-white/90 hover:bg-white border px-3 py-1">✕</button>
      </div>
    </div>
  )
}