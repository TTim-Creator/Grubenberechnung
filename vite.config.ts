import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  clearScreen: false,
  server: { port: 1420, strictPort: true },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'terser' : false,
    terserOptions: {
      compress: {
        passes: 1,
        drop_console: true,
        drop_debugger: true,
      },
      // toplevel-Mangling kann bei zirkulären ES-Modul-Imports die
      // Initialisierungsreihenfolge verändern und React-Refs als
      // `undefined` auflösen ("Cannot read properties of undefined
      // (reading 'current')") — deshalb bewusst deaktiviert.
      mangle: { toplevel: false },
      format: { comments: false },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
