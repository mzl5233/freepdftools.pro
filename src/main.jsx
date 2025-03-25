import React from 'react'
import ReactDOM from 'react-dom/client'
import { Suspense, lazy } from 'react'
import './i18n/config'
import './index.css'

// 确保i18n在应用渲染前初始化
import './i18n/config'

// 懒加载主应用组件
const App = lazy(() => import('./App'))

// 简单的性能监控
const logPerformance = () => {
  if (process.env.NODE_ENV === 'production') {
    // 仅在生产环境记录
    const perfData = window.performance.timing
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
    const domReadyTime = perfData.domComplete - perfData.domLoading
    
    console.log(`页面加载时间: ${pageLoadTime}ms`)
    console.log(`DOM 渲染时间: ${domReadyTime}ms`)
    
    // 将关键性能指标发送到Google Analytics
    if (window.gtag) {
      window.gtag('event', 'performance_measurement', {
        'event_category': 'Performance',
        'event_label': 'Page Load',
        'page_load_time': pageLoadTime,
        'dom_ready_time': domReadyTime,
        'non_interaction': true
      })
    }
  }
}

// 全局错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('应用错误:', error, errorInfo)
    // 这里可以添加错误报告服务的集成
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">出错了</h2>
            <p className="text-gray-700 mb-4">抱歉，应用程序遇到了一个问题。请尝试刷新页面。</p>
            <p className="text-gray-500 text-sm mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// 加载指示器
const LoadingIndicator = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
    <div className="ml-4 text-indigo-600 text-xl font-medium">加载应用...</div>
  </div>
)

// 添加调试信息
console.log("应用初始化中...")
console.log("环境:", import.meta.env.MODE)
console.log("基础路径:", import.meta.env.BASE_URL)

// 确保public目录中的资源路径正确
const publicPath = import.meta.env.BASE_URL || './'
console.log("Public路径:", publicPath)

// 使用严格模式渲染应用
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<LoadingIndicator />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>,
)

// 注册性能监控
window.addEventListener('load', logPerformance)

// 注册服务工作线程（如果有）
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration)
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}