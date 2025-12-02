import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    open: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      // Servir archivos estáticos del backend durante desarrollo
      '/uploads': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    }
  }
})