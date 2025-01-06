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
  build: {
    rollupOptions: {
      external: ['@emailjs/browser', '@heroicons/react/24/solid', '@heroicons/react/24/outline'],
      output: {
        globals: {
          '@emailjs/browser': 'emailjs',
          '@heroicons/react/24/solid': 'HeroIconsSolid',
          '@heroicons/react/24/outline': 'HeroIconsOutline'
        }
      }
    }
  }
})