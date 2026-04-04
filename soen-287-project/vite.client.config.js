/**
 * Vite config for local frontend-only dev (no Cloudflare Workers).
 * Use: npm run dev
 * For full Cloudflare dev: npm run dev:cloudflare
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': 'http://localhost:8787',
      '/login': 'http://localhost:8787',
      '/signup': 'http://localhost:8787'
    }
  },
})
