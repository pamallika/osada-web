import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: ['arigami.space', 'api.arigami.space', 'sage.local'],
    host: '0.0.0.0',
    port: 5173,
    hmr: {
        host: process.env.VITE_HMR_HOST || 'arigami.space'
    }
  }
})
