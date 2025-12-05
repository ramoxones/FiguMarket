import { useEffect, useMemo, useRef, useState } from "react";
import { TarjetaFigura } from "./TarjetaFigura.jsx";
import { getSeguimientoCounts } from "../servicios/seguimientos.js";

export default function FeaturedSlider({ items = [], perPage, autoAdvanceMs = 5000 }) {
  const [cols, setCols] = useState(1)
  const [seguimientosMap, setSeguimientosMap] = useState({})
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 640) setCols(1)
      else if (w < 768) setCols(2)
      else if (w < 1024) setCols(3)
      else setCols(4)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const ids = Array.isArray(items) ? items.map((f) => f?.id).filter(Boolean) : []
    if (!ids.length) { setSeguimientosMap({}); return }
    let active = true
    ;(async () => {
      try {
        const res = await getSeguimientoCounts(ids)
        if (active && res?.ok && typeof res.data === 'object') setSeguimientosMap(res.data)
      } catch {
        if (active) setSeguimientosMap({})
      }
    })()
    return () => { active = false }
  }, [items])
  const pageSize = perPage ?? cols
  const grupos = useMemo(() => {
    const chunks = []
    for (let i = 0; i < items.length; i += pageSize) {
      chunks.push(items.slice(i, i + pageSize))
    }
    return chunks
  }, [items, pageSize])

  const [index, setIndex] = useState(0);
  const pauseRef = useRef(false);

  useEffect(() => {
    if (grupos.length <= 1) return;
    const id = setInterval(() => {
      if (!pauseRef.current) {
        setIndex((prev) => (prev + 1) % grupos.length);
      }
    }, autoAdvanceMs);
    return () => clearInterval(id);
  }, [grupos.length, autoAdvanceMs]);

  const goPrev = () => setIndex((prev) => (prev - 1 + grupos.length) % grupos.length);
  const goNext = () => setIndex((prev) => (prev + 1) % grupos.length);

  if (!items || items.length === 0) return null;

  return (
    <div
      className="rounded-lg bg-[#FECE00]/80 p-2 sm:p-4"
      onMouseEnter={() => (pauseRef.current = true)}
      onMouseLeave={() => (pauseRef.current = false)}
    >
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {grupos.map((grupo, gi) => (
            <div key={gi} className="min-w-full">
              <div className="grid gap-2 sm:gap-6 items-stretch px-0" style={{ gridTemplateColumns: `repeat(${pageSize}, minmax(0, 1fr))` }}>
                {grupo.map((f) => (
                  <TarjetaFigura key={f.id} figura={f} featured seguimientoCount={Number(seguimientosMap?.[f.id] || 0)} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {grupos.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Siguiente"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
            >
              ›
            </button>
          </>
        )}
      </div>

      {grupos.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {grupos.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir a página ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full ${i === index ? "bg-black" : "bg-black/30"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
