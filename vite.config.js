import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy Gamma API to avoid CORS
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/gamma': {
        target: 'https://gamma.api.polymarket.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gamma/, '/markets')
      }
    }
  },
  define: {
    global: 'globalThis'
  }
})
