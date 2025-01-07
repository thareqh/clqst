import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    include: [
      'date-fns',
      '@emailjs/browser',
      'react-hot-toast',
      'emoji-picker-react'
    ]
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    sourcemap: false,
    minify: 'terser',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1600
  }
})