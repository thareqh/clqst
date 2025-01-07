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
      '@': path.resolve(__dirname, './src'),
      '@heroicons/react': path.resolve(__dirname, 'node_modules/@heroicons/react')
    }
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return
        }
        warn(warning)
      }
    },
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser'
  }
})