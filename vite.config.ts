import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const appUrl = env.VITE_APP_URL || env.APP_URL || 'localhost';

  // Extract hostname from URL if present
  const allowedHost = appUrl.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      allowedHosts: [allowedHost, 'sage.local', 'arigami.space'],
      host: '0.0.0.0',
      port: 5173,
      hmr: {
        host: env.VITE_HMR_HOST || allowedHost
      }
    }
  }
})
