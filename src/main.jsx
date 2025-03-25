import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 确保i18n在应用渲染前初始化
import './i18n/config'

// 加载指示器组件
const LoadingIndicator = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    <div className="ml-3 text-indigo-500">正在加载翻译...</div>
  </div>
)

// 添加调试信息
console.log("应用初始化中...");
console.log("环境:", import.meta.env.MODE);
console.log("基础路径:", import.meta.env.BASE_URL);

// 确保public目录中的资源路径正确
const publicPath = import.meta.env.BASE_URL || './';
console.log("Public路径:", publicPath);

// 使用严格模式渲染应用
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<LoadingIndicator />}>
      <App />
    </Suspense>
  </React.StrictMode>,
)