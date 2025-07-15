import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
    server: {
        hmr: false,
        watch: {
            usePolling: true,
        },
    },
    plugins: [react(), tailwindcss()],
})