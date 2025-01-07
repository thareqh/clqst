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
      external: ['date-fns', '@emailjs/browser', 'react-hot-toast', 'emoji-picker-react'],
      output: {
        globals: {
          'date-fns': 'dateFns',
          '@emailjs/browser': 'emailjs',
          'react-hot-toast': 'toast',
          'emoji-picker-react': 'EmojiPicker'
        }
      }
    }
  }
})