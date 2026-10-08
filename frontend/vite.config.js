import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Esto abre el puerto hacia Docker
    port: 5173,
    allowedHosts: true, // Permite cualquier host o dominio de proxy inverso (Dokploy, Traefik, dominios personalizados)
    watch: {
      usePolling: true // Vital para que el hot-reload funcione en Windows
    }
  }
})