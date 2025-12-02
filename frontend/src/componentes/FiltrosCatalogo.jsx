import React, { useState } from 'react'

export function FiltrosCatalogo({ opciones, filtros, onToggle, onReset, precioMinBase, precioMaxBase, onChangePrecio, onChangeFecha }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const Section = ({ title, field, values }) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {values.map((val) => {
          const active = Array.isArray(filtros[field]) ? filtros[field].includes(val.value) : (filtros[field] === val.value)
          return (
            <button
              key={val.value}
              onClick={() => onToggle(field, val.value)}
              className={`px-3 py-1 rounded-md border text-sm ${active ? 'bg-black text-white border-black' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              title={val.label}
            >
              {val.label}
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <aside className="md:sticky md:top-[72px] self-start w-full md:w-[260px]">
      {/* Toggle móvil */}
      <div className="md:hidden mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold">Filtros</h2>
        <button onClick={() => setMobileOpen((v) => !v)} className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm">
          <span>{mobileOpen ? 'Ocultar' : 'Mostrar'}</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      <div className={`rounded-lg border bg-white p-4 md:max-h-[calc(100vh-72px)] md:overflow-y-auto ${mobileOpen ? '' : 'hidden md:block'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">Filtros</h2>
          <button onClick={onReset} className="text-sm text-brand hover:text-brand-dark">Limpiar</button>
        </div>
        <Section title="Escala" field="escala" values={opciones.escalas} />
        <Section title="Categoría" field="categoria" values={opciones.categorias} />
        <Section title="Estado" field="estado" values={opciones.estados} />
        <Section title="Estado de figura" field="estado_figura" values={opciones.estadosFigura} />

        {/* Precio: rangos por botón + slider min/max */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Precio</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {(opciones.precios || []).map((val) => {
              const active = filtros.precioRango === val.value
              return (
                <button
                  key={val.value}
                  onClick={() => onToggle('precioRango', active ? null : val.value)}
                  className={`px-3 py-1 rounded-md border text-sm ${active ? 'bg-black text-white border-black' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  {val.label}
                </button>
              )
            })}
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Mín: {Math.max(1, Math.floor(filtros.precioMin ?? precioMinBase))}€</span>
              <span>
                Máx: {(() => {
                  const v = Math.ceil(filtros.precioMax ?? precioMaxBase)
                  return v >= 500 ? '500+ €' : `${v}€`
                })()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={500}
                step={1}
                value={Math.min(500, Math.max(1, Math.floor(filtros.precioMin ?? precioMinBase)))}
                onChange={(e) => {
                  const newMin = Math.max(1, Math.floor(Number(e.target.value)))
                  const currentMax = Math.min(500, Math.ceil(filtros.precioMax ?? precioMaxBase))
                  const safeMin = Math.min(newMin, currentMax)
                  onChangePrecio(safeMin, currentMax)
                }}
                className="w-full"
              />
              <input
                type="range"
                min={1}
                max={500}
                step={1}
                value={Math.min(500, Math.ceil(filtros.precioMax ?? precioMaxBase))}
                onChange={(e) => {
                  const newMax = Math.min(500, Math.ceil(Number(e.target.value)))
                  const currentMin = Math.max(1, Math.floor(filtros.precioMin ?? precioMinBase))
                  const safeMax = Math.max(newMax, currentMin)
                  onChangePrecio(currentMin, safeMax)
                }}
                className="w-full"
              />
            </div>
            <p className="mt-2 text-xs text-gray-600">Selecciona un rango personalizado o usa los botones.</p>
          </div>
        </div>

        {/* Fecha: selector de día (calendario) */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Fecha de publicación</h3>
          <input
            type="date"
            value={filtros.fechaDia ?? ''}
            onChange={(e) => onChangeFecha(e.target.value || null)}
            className="w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>
    </aside>
  )
}