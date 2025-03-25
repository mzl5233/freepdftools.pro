import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 公共基础路径
  base: './',
  
  // 配置静态资源目录
  publicDir: 'public',
  
  // 解决文件路径问题
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  
  // 服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true,
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 增强模块预加载
    modulePreload: {
      polyfill: true,
    },
    // 优化大型依赖项
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: '/index.html',
      output: {
        manualChunks(id) {
          // 将node_modules中的代码单独打包
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})