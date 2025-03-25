import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import { marked } from 'marked';
import MobileUploader from './MobileUploader';
import DownloadButton from './DownloadButton';

// 懒加载时初始化PDF.js worker
const initPdfWorker = () => {
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
};

const PdfToMarkdown = () => {
  const { t } = useTranslation();
  const [markdown, setMarkdown] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(() => {
    // 从localStorage恢复用户偏好
    const savedPrefs = localStorage.getItem('pdfToolPrefs');
    return savedPrefs ? JSON.parse(savedPrefs).previewMode || 'raw' : 'raw';
  });
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // 检测设备类型
  const isMobile = typeof navigator !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // 组件加载时初始化PDF.js worker
  useEffect(() => {
    initPdfWorker();
    
    // 组件卸载时保存用户偏好
    return () => {
      const currentPrefs = localStorage.getItem('pdfToolPrefs');
      const prefsObj = currentPrefs ? JSON.parse(currentPrefs) : {};
      localStorage.setItem('pdfToolPrefs', JSON.stringify({
        ...prefsObj,
        previewMode
      }));
    };
  }, [previewMode]);

  const processTextStyles = (textContent) => {
    let processedText = '';
    let currentStyle = null;
    let lastY = null;
    let lastX = null;

    textContent.items.forEach((item, index) => {
      const fontName = item.fontName?.toLowerCase() || '';
      const isBold = fontName.includes('bold') || item.fontWeight >= 700;
      const isNewLine = lastY !== null && Math.abs(item.transform[5] - lastY) > 5;
      const isLargeGap = lastX !== null && (item.transform[4] - lastX) > 20;

      // Add new line for significant Y position changes
      if (isNewLine) {
        processedText += '\n';
        if (Math.abs(item.transform[5] - lastY) > 15) {
          processedText += '\n'; // Double line break for larger gaps
        }
      } else if (isLargeGap && index > 0) {
        processedText += ' '; // Add space for large X gaps
      }

      // Handle bold text
      if (isBold && currentStyle !== 'bold') {
        processedText += '**';
        currentStyle = 'bold';
      } else if (!isBold && currentStyle === 'bold') {
        processedText += '**';
        currentStyle = null;
      }

      processedText += item.str;
      lastY = item.transform[5];
      lastX = item.transform[4] + (item.width || 0);
    });

    // Close any remaining bold tags
    if (currentStyle === 'bold') {
      processedText += '**';
    }

    return processedText;
  };

  const validateFile = (file) => {
    // 检查文件大小（限制为50MB）
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage(t('errors.fileTooLarge', 'File is too large (max 50MB)'));
      return false;
    }
    
    // 验证文件类型
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage(t('errors.invalidFileType', 'Only PDF files are supported'));
      return false;
    }
    
    return true;
  };

  const extractTextFromPDF = async (arrayBuffer) => {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += processTextStyles(content) + '\n\n';
    }
    
    return text;
  };

  const processFile = async (file) => {
    if (!file) return;
    
    if (!validateFile(file)) {
      return;
    }
    
    setErrorMessage('');
    setIsLoading(true);
    setFile(file);
    
    try {
      // 跟踪PDF转换开始事件
      if (window.gtag) {
        window.gtag('event', 'conversion_started', {
          'event_category': 'PDF Processing',
          'event_label': 'PDF to Markdown',
          'file_size': Math.round(file.size / 1024), // 文件大小(KB)
          'file_type': file.type
        });
      }
      
      const startTime = performance.now();
      const arrayBuffer = await file.arrayBuffer();
      const text = await extractTextFromPDF(arrayBuffer);
      const processingTime = Math.round(performance.now() - startTime);
      
      setMarkdown(text);
      
      // 跟踪PDF转换完成事件
      if (window.gtag) {
        window.gtag('event', 'conversion_completed', {
          'event_category': 'PDF Processing',
          'event_label': 'PDF to Markdown',
          'processing_time': processingTime,
          'content_length': text.length,
          'success': true
        });
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      setErrorMessage(t('errors.processingError', 'Error processing PDF file'));
      
      // 跟踪PDF转换错误事件
      if (window.gtag) {
        window.gtag('event', 'conversion_error', {
          'event_category': 'PDF Processing',
          'event_label': 'PDF to Markdown',
          'error_message': error.message || 'Unknown error'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    await processFile(file);
  };

  const downloadMarkdown = () => {
    if (!markdown) return;
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file ? `${file.name.replace(/\.pdf$/i, '')}.md` : 'converted.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const renderContent = () => {
    if (!markdown) return null;

    return (
      <div className="mt-6">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex flex-wrap items-center space-x-2 mb-2 sm:mb-0">
            <h2 className="text-lg font-medium text-gray-900">{t('output.markdownOutput')}</h2>
            <div className="flex items-center space-x-1 mt-1 sm:mt-0">
              <button
                onClick={() => setPreviewMode('raw')}
                className={`px-3 py-1 text-sm rounded-md ${
                  previewMode === 'raw'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('output.raw')}
              </button>
              <button
                onClick={() => setPreviewMode('formatted')}
                className={`px-3 py-1 text-sm rounded-md ${
                  previewMode === 'formatted'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('output.formatted')}
              </button>
            </div>
          </div>
          <DownloadButton
            content={markdown}
            filename="converted.md"
            mimeType="text/markdown"
            buttonText={t('output.downloadMarkdown')}
            onDownloadStart={() => {
              console.log('下载开始');
              // 可以添加分析事件跟踪
            }}
            onDownloadComplete={() => {
              console.log('下载完成');
              // 可以记录成功下载事件
            }}
          />
        </div>

        <div className={`bg-white rounded-lg border border-gray-200 ${
          previewMode === 'formatted' ? 'p-4 sm:p-8' : 'p-4'
        }`}>
          {previewMode === 'raw' ? (
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono overflow-x-auto">{markdown}</pre>
          ) : (
            <div 
              className="prose max-w-none dark:prose-invert prose-headings:mt-4 prose-headings:mb-2"
              dangerouslySetInnerHTML={{ __html: marked(markdown) }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {isMobile ? (
        <MobileUploader onFileSelect={processFile} isLoading={isLoading} />
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500'
          }`}
          onClick={() => {
            // 跟踪点击上传区域事件
            if (window.gtag) {
              window.gtag('event', 'upload_area_clicked', {
                'event_category': 'User Interaction',
                'event_label': 'PDF to Markdown'
              });
            }
          }}
        >
          <input {...getInputProps()} />
          <div className="text-gray-600">
            {isDragActive ? (
              <p>{t('dropzone.dragActive')}</p>
            ) : (
              <p>{t('dropzone.dragInactive')}</p>
            )}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {errorMessage}
        </div>
      )}

      {isLoading && (
        <div className="mt-4 text-center text-gray-600">
          <div className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('output.processing')}
          </div>
        </div>
      )}

      {renderContent()}
    </div>
  );
};

export default PdfToMarkdown; 