import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// === VITE CONFIG | inicio ===
// Projeto: Arquiteto Web (React + TS + Tailwind)
// Alias: @ -> /src (compatível com ESM, sem __dirname)
// === VITE CONFIG | fim ===
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5193,
    strictPort: false,
  },
})
