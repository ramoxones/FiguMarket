import React from 'react'

export function PieDePagina() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-[#FECE00] text-black mt-8 relative">
      {/* Imagen lateral: visible solo en pantallas grandes (lg+) */}
      <img
        src="/Figumarket.png"
        alt="Figumarket"
        className="hidden xl:block pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 xl:w-64 h-auto"
      />
      <div className="container-base pt-6 pb-24 sm:py-10 xl:pl-60" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 96px)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-start">
          {/* Bloque de marca dentro del contenedor centrado */}
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <div className="inline-flex items-center gap-3">
              <span className="text-2xl lg:text-3xl font-black">FiguMarket</span>
            </div>
            <p className="mt-2 sm:mt-3 text-sm max-w-sm">
              Somos un portal de figuras de segunda mano para que cualquier persona pueda encontrar y vender sus figuras fácilmente. Conecta con coleccionistas y dale una segunda vida a tus piezas.
            </p>
          </div>

          {/* Contacto */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-sm font-semibold text-black tracking-wide text-center">Contacto</h3>
            <ul className="mt-2 sm:mt-3 space-y-2 text-sm">
              <li>
                <a href="mailto:contacto@figumarket.com" className="inline-flex items-center gap-2 rounded-md px-3 py-2 bg-black text-white hover:bg-black/90 sm:bg-transparent sm:text-black sm:hover:bg-transparent">contacto@figumarket.com</a>
              </li>
              <li>
                <a href="tel:+34612345678" className="inline-flex items-center gap-2 rounded-md px-3 py-2 bg-black text-white hover:bg-black/90 sm:bg-transparent sm:text-black sm:hover:bg-transparent">+34 612 345 678</a>
              </li>
              <li>
                <span className="text-black">Madrid, España</span>
              </li>
              <li>
                <span className="text-black">Lun–Vie: 9:00–18:00 CET</span>
              </li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <h3 className="text-sm font-semibold tracking-wide text-center sm:text-left">Síguenos</h3>
            <div className="mt-2 sm:mt-3 flex items-center justify-center sm:justify-start gap-3">
              <a aria-label="Twitter/X" href="https://twitter.com/figumarket" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-black text-white hover:bg-black/90 ring-1 ring-black/10 sm:bg-transparent sm:text-black sm:hover:bg-transparent">
                <img src="https://cdn.simpleicons.org/x/ffffff" alt="" className="h-5 w-5 sm:hidden" />
                <img src="https://cdn.simpleicons.org/x/000000" alt="" className="h-5 w-5 hidden sm:block" />
              </a>
              <a aria-label="Instagram" href="https://instagram.com/figumarket" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-black text-white hover:bg-black/90 ring-1 ring-black/10 sm:bg-transparent sm:text-black sm:hover:bg-transparent">
                <img src="https://cdn.simpleicons.org/instagram/ffffff" alt="" className="h-5 w-5 sm:hidden" />
                <img src="https://cdn.simpleicons.org/instagram/000000" alt="" className="h-5 w-5 hidden sm:block" />
              </a>
              <a aria-label="WhatsApp" href="https://wa.me/34612345678" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-black text-white hover:bg-black/90 ring-1 ring-black/10 sm:bg-transparent sm:text-black sm:hover:bg-transparent">
                <img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="" className="h-5 w-5 sm:hidden" />
                <img src="https://cdn.simpleicons.org/whatsapp/000000" alt="" className="h-5 w-5 hidden sm:block" />
              </a>
            </div>
            <p className="mt-2 sm:mt-3 text-xs text-black text-center sm:text-left">Comparte tus hallazgos y etiqueta a @figumarket.</p>
          </div>

          {/* Legal / Enlaces */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide">Información legal</h3>
            <ul className="mt-2 sm:mt-3 grid grid-cols-2 gap-2 sm:block sm:space-y-2 text-sm">
              <li><a href="/aviso-legal" className="inline-flex items-center gap-2 rounded-md px-3 py-2 bg-black text-white hover:bg-black/90 w-full sm:bg-transparent sm:text-black sm:hover:bg-transparent">Aviso legal y Términos</a></li>
              <li><a href="/privacidad" className="inline-flex items-center gap-2 rounded-md px-3 py-2 bg-black text-white hover:bg-black/90 w-full sm:bg-transparent sm:text-black sm:hover:bg-transparent">Política de privacidad</a></li>
              <li><a href="/cookies" className="inline-flex items-center gap-2 rounded-md px-3 py-2 bg-black text-white hover:bg-black/90 w-full sm:bg-transparent sm:text-black sm:hover:bg-transparent">Cookies</a></li>
              <li><a href="/quienes-somos" className="inline-flex items-center gap-2 rounded-md px-3 py-2 bg-black text-white hover:bg-black/90 w-full sm:bg-transparent sm:text-black sm:hover:bg-transparent">Quiénes somos</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 border-t border-black/20 pt-4 sm:pt-5 flex items-center justify-center text-center gap-4 text-xs text-black">
          <p>© {year} FiguMarket · Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  )
}