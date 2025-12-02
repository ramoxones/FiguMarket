import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LayoutPrincipal } from './LayoutPrincipal.jsx'
import { PaginaInicio } from '../paginas/PaginaInicio.jsx'
import { PaginaCatalogo } from '../paginas/PaginaCatalogo.jsx'
import { PaginaProducto } from '../paginas/PaginaProducto.jsx'
import { PaginaPerfil } from '../paginas/PaginaPerfil.jsx'
import { PaginaEditarPerfil } from '../paginas/PaginaEditarPerfil.jsx'
import { PaginaLogin } from '../paginas/PaginaLogin.jsx'
import { PaginaRegistro } from '../paginas/PaginaRegistro.jsx'
import { PaginaNoEncontrada } from '../paginas/PaginaNoEncontrada.jsx'
import { PaginaBusqueda } from '../paginas/PaginaBusqueda.jsx'
import { PaginaVender } from '../paginas/PaginaVender.jsx'
import { PaginaTerminos } from '../paginas/PaginaTerminos.jsx'
import { PaginaSeguimiento } from '../paginas/PaginaSeguimiento.jsx'
import { AdminNoticias } from '../paginas/AdminNoticias.jsx'
import { PaginaNoticias } from '../paginas/PaginaNoticias.jsx'
import { PaginaDestacar } from '../paginas/PaginaDestacar.jsx'
import { PaginaCheckoutDestacar } from '../paginas/PaginaCheckoutDestacar.jsx'
import PaginaAvisoLegal from '../paginas/PaginaAvisoLegal.jsx'
import PaginaPrivacidad from '../paginas/PaginaPrivacidad.jsx'
import PaginaCookies from '../paginas/PaginaCookies.jsx'
import PaginaQuienesSomos from '../paginas/PaginaQuienesSomos.jsx'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LayoutPrincipal />}> 
          <Route index element={<PaginaInicio />} />
          <Route path="catalogo" element={<PaginaCatalogo />} />
          <Route path="buscar" element={<PaginaBusqueda />} />
          <Route path="producto/:id" element={<PaginaProducto />} />
          <Route path="seguimiento" element={<RutaProtegida><PaginaSeguimiento /></RutaProtegida>} />
          <Route path="vender" element={<RutaProtegida><PaginaVender /></RutaProtegida>} />
          <Route path="noticias" element={<PaginaNoticias />} />
          <Route path="admin/noticias" element={<AdminNoticias />} />
          <Route path="terminos" element={<PaginaTerminos />} />
          <Route path="aviso-legal" element={<PaginaAvisoLegal />} />
          <Route path="privacidad" element={<PaginaPrivacidad />} />
          <Route path="cookies" element={<PaginaCookies />} />
          <Route path="quienes-somos" element={<PaginaQuienesSomos />} />
          <Route path="perfil" element={<PaginaPerfil />} />
          <Route path="destacar/:id" element={<PaginaDestacar />} />
          <Route path="destacar/:id/checkout" element={<PaginaCheckoutDestacar />} />
          <Route path="perfil/editar" element={<PaginaEditarPerfil />} />
          <Route path="login" element={<PaginaLogin />} />
          <Route path="registro" element={<PaginaRegistro />} />
          <Route path="*" element={<PaginaNoEncontrada />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
import { useAuth } from '../contextos/ProveedorAuth.jsx'

function RutaProtegida({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}