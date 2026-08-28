import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Esto abre el puerto hacia Docker
    port: 5173,
    watch: {
      usePolling: true // Vital para que el hot-reload funcione en Windows
    }
  }
})