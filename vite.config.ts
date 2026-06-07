import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import JavaScriptObfuscator from 'javascript-obfuscator'
import type { Plugin } from 'vite'

// Obfuskiert den fertigen JS-Bundle im Production-Build
function obfuscatorPlugin(): Plugin {
  return {
    name: 'js-obfuscator',
    apply: 'build',
    enforce: 'post',
    generateBundle(_opts, bundle) {
      if (process.env.TAURI_DEBUG) return
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk' && chunk.fileName.endsWith('.js')) {
          chunk.code = JavaScriptObfuscator.obfuscate(chunk.code, {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.4,
            deadCodeInjection: false,
            debugProtection: false,
            disableConsoleOutput: true,
            identifierNamesGenerator: 'hexadecimal',
            renameGlobals: false,
            selfDefending: true,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayThreshold: 0.6,
            splitStrings: true,
            splitStringsChunkLength: 8,
            transformObjectKeys: true,
            unicodeEscapeSequence: false,
          }).getObfuscatedCode()
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), obfuscatorPlugin()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  clearScreen: false,
  server: { port: 1420, strictPort: true },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'terser' : false,
    terserOptions: {
      compress: {
        passes: 3,
        drop_console: true,
        drop_debugger: true,
      },
      mangle: { toplevel: true },
      format: { comments: false },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
