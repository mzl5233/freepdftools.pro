import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 使用'./'确保资源使用相对路径
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    // 确保Vite生成符合GitHub Pages要求的资源格式
    assetsInlineLimit: 4096,
    sourcemap: false,
    // 确保资源路径一致性
    assetsDir: 'assets'
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
})