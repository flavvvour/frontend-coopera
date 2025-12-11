/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    // Добавляем проксирование для API запросов
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // ваш бэкенд сервер
        changeOrigin: true,
        secure: false,
        // Опционально: можно переписать путь, если нужно
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Алиас @ для папки src
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  }
})