import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 可复用的下载按钮组件
 * 
 * @param {Object} props
 * @param {string} props.content - 要下载的内容
 * @param {string} props.filename - 下载的文件名
 * @param {string} props.mimeType - 内容的MIME类型
 * @param {Function} props.onDownloadStart - 下载开始的回调函数
 * @param {Function} props.onDownloadComplete - 下载完成的回调函数
 * @param {string} props.buttonText - 按钮文本（可选）
 * @param {string} props.buttonClassName - 按钮CSS类名（可选）
 * @param {boolean} props.showIcon - 是否显示下载图标（可选，默认为true）
 */
const DownloadButton = ({
  content,
  filename,
  mimeType = 'text/plain',
  onDownloadStart,
  onDownloadComplete,
  buttonText,
  buttonClassName = 'px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-2',
  showIcon = true,
  disabled = false
}) => {
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);
  
  // 默认按钮文本为"下载"或翻译值
  const defaultButtonText = buttonText || t('output.download', '下载');
  
  const handleDownload = async () => {
    if (disabled || !content || isDownloading) return;
    
    try {
      setIsDownloading(true);
      if (onDownloadStart) onDownloadStart();
      
      // 跟踪下载开始事件
      if (window.gtag) {
        window.gtag('event', 'download_started', {
          'event_category': 'User Action',
          'event_label': filename,
          'file_type': mimeType,
          'content_length': content.length
        });
      }
      
      // 创建Blob对象
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      // 创建下载链接并触发点击
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // 清理
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setIsDownloading(false);
        
        // 跟踪下载完成事件
        if (window.gtag) {
          window.gtag('event', 'download_completed', {
            'event_category': 'User Action',
            'event_label': filename,
            'file_type': mimeType,
            'success': true
          });
        }
        
        if (onDownloadComplete) onDownloadComplete();
      }, 100);
    } catch (error) {
      console.error('下载出错:', error);
      setIsDownloading(false);
      
      // 跟踪下载错误事件
      if (window.gtag) {
        window.gtag('event', 'download_error', {
          'event_category': 'User Action',
          'event_label': filename,
          'error_message': error.message || 'Unknown error'
        });
      }
    }
  };
  
  // 下载图标SVG
  const DownloadIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className="h-5 w-5" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
      />
    </svg>
  );
  
  // 加载中动画
  const LoadingSpinner = () => (
    <svg 
      className="animate-spin h-5 w-5" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      ></circle>
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
  
  return (
    <button
      onClick={handleDownload}
      disabled={disabled || !content || isDownloading}
      className={`${buttonClassName} ${disabled || !content ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={defaultButtonText}
    >
      {isDownloading ? (
        <>
          <LoadingSpinner />
          <span>{t('common.downloading', '下载中...')}</span>
        </>
      ) : (
        <>
          {showIcon && <DownloadIcon />}
          <span>{defaultButtonText}</span>
        </>
      )}
    </button>
  );
};

export default DownloadButton; 