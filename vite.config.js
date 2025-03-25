import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'locales/**/*'],
      manifest: {
        name: 'PDF工具站',
        short_name: 'PDF工具',
        description: '免费在线PDF转Markdown工具，轻松将PDF文件转换为Markdown格式或翻译PDF内容',
        theme_color: '#4f46e5',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  // 公共基础路径 - 修复为绝对路径
  base: '/',
  
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
    // 确保资产URL正确
    assetsInlineLimit: 4096,
    // 增强模块预加载
    modulePreload: {
      polyfill: true,
    },
    // 优化大型依赖项
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: '/index.html',
      output: {
        // 确保生成的资产路径正确
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'js/[name].[hash].js',
        entryFileNames: 'js/[name].[hash].js',
        manualChunks: {
          // 将PDF.js单独打包
          'pdf-lib': ['pdfjs-dist'],
          // 将i18next相关库打包到一起
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend'],
          // React相关库
          'react-vendor': ['react', 'react-dom'],
          // UI相关库
          'ui-vendor': ['marked', 'react-dropzone']
        }
      }
    },
    // 添加预渲染配置
    ssrManifest: true
  },
  
  // 移除可能导致路径问题的实验性配置
  experimental: {
    // 使用绝对路径
    renderBuiltUrl(filename, { hostId, hostType, type }) {
      return '/' + filename;
    }
  }
})