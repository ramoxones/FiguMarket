import React from 'react'
import { AppRouter } from './rutas/Router.jsx'
import { ProveedorApp } from './contextos/ProveedorApp.jsx'
import { ProveedorAuth } from './contextos/ProveedorAuth.jsx'
import { ProveedorFavoritos } from './contextos/ProveedorFavoritos.jsx'

function App() {
  return (
    <ProveedorApp>
      <ProveedorAuth>
        <ProveedorFavoritos>
          <AppRouter />
        </ProveedorFavoritos>
      </ProveedorAuth>
    </ProveedorApp>
  )
}

export default App