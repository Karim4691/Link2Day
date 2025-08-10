import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  server: {
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'https://link2day-6cb7c.uw.r.appspot.com',
        changeOrigin: true,
        secure: true,
        ws: true,
      }
    }
  },
  plugins: [react(), tailwindcss()],
  build : {
    outDir: 'dist'
  }
})