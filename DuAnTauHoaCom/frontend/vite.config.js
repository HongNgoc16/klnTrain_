
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@dispatcher': path.resolve(__dirname, '../DieuPhoiVien/frontend/src'),
      '@admin': path.resolve(__dirname, '../../train/src'),
      // train/src nằm ngoài frontend/, các package này phải trỏ về
      // node_modules của frontend để dùng chung 1 bản React.
      'react-icons': path.resolve(__dirname, 'node_modules/react-icons'),
      'recharts': path.resolve(__dirname, 'node_modules/recharts'),
      'xlsx': path.resolve(__dirname, 'node_modules/xlsx'),
      'file-saver': path.resolve(__dirname, 'node_modules/file-saver'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
