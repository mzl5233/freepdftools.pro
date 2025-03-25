import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import { marked } from 'marked';
import MobileUploader from './MobileUploader';

// 懒加载时初始化PDF.js worker
const initPdfWorker = () => {
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
};

const PdfTranslation = () => {
  const { t, i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(() => {
    // 从localStorage恢复用户偏好
    const savedPrefs = localStorage.getItem('pdfToolPrefs');
    return savedPrefs ? JSON.parse(savedPrefs).translationPreviewMode || 'raw' : 'raw';
  });
  const [targetLanguage, setTargetLanguage] = useState(() => {
    // 默认使用当前UI语言作为目标语言
    const savedPrefs = localStorage.getItem('pdfToolPrefs');
    return savedPrefs ? JSON.parse(savedPrefs).targetLanguage || i18n.language : i18n.language;
  });
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // 检测设备类型
  const isMobile = typeof navigator !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // 支持的目标语言列表
  const targetLanguages = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文 (Chinese)' },
    { code: 'es', name: 'Español (Spanish)' },
    { code: 'fr', name: 'Français (French)' },
    { code: 'de', name: 'Deutsch (German)' },
    { code: 'ja', name: '日本語 (Japanese)' },
    { code: 'ko', name: '한국어 (Korean)' },
    { code: 'ru', name: 'Русский (Russian)' },
    { code: 'pt', name: 'Português (Portuguese)' },
    { code: 'it', name: 'Italiano (Italian)' },
  ];

  // 组件加载时初始化PDF.js worker
  useEffect(() => {
    initPdfWorker();
    
    // 组件卸载时保存用户偏好
    return () => {
      const currentPrefs = localStorage.getItem('pdfToolPrefs');
      const prefsObj = currentPrefs ? JSON.parse(currentPrefs) : {};
      localStorage.setItem('pdfToolPrefs', JSON.stringify({
        ...prefsObj,
        translationPreviewMode: previewMode,
        targetLanguage
      }));
    };
  }, [previewMode, targetLanguage]);

  const extractTextFromPDF = async (arrayBuffer) => {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      
      // 简单地连接文本内容
      content.items.forEach(item => {
        text += item.str + ' ';
      });
      
      text += '\n\n';
    }
    
    return text.trim();
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

  // 模拟翻译功能（实际项目中应连接到翻译服务）
  const translateText = (text, targetLang) => {
    // 这里是模拟翻译，实际项目中应替换为实际翻译API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        // 仅作示例，返回原文
        resolve(`${text}\n\n(Translation to ${targetLanguages.find(lang => lang.code === targetLang)?.name} would appear here)`);
      }, 1000);
    });
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
      // 跟踪PDF翻译开始事件
      if (window.gtag) {
        window.gtag('event', 'translation_started', {
          'event_category': 'PDF Processing',
          'event_label': 'PDF Translation',
          'file_size': Math.round(file.size / 1024), // 文件大小(KB)
          'file_type': file.type,
          'target_language': targetLanguage
        });
      }
      
      const startTime = performance.now();
      const arrayBuffer = await file.arrayBuffer();
      const text = await extractTextFromPDF(arrayBuffer);
      
      // 获取翻译结果
      const translated = await translateText(text, targetLanguage);
      const processingTime = Math.round(performance.now() - startTime);
      
      setTranslatedText(translated);
      
      // 跟踪PDF翻译完成事件
      if (window.gtag) {
        window.gtag('event', 'translation_completed', {
          'event_category': 'PDF Processing',
          'event_label': 'PDF Translation',
          'processing_time': processingTime,
          'content_length': translated.length,
          'target_language': targetLanguage,
          'success': true
        });
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      setErrorMessage(t('errors.processingError', 'Error processing PDF file'));
      
      // 跟踪PDF翻译错误事件
      if (window.gtag) {
        window.gtag('event', 'translation_error', {
          'event_category': 'PDF Processing',
          'event_label': 'PDF Translation',
          'error_message': error.message || 'Unknown error',
          'target_language': targetLanguage
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setTargetLanguage(newLanguage);
    
    // 跟踪语言切换事件
    if (window.gtag) {
      window.gtag('event', 'target_language_changed', {
        'event_category': 'User Preference',
        'event_label': 'Translation Language',
        'language': newLanguage
      });
    }
    
    // 如果已有文件，重新翻译
    if (file && translatedText) {
      setIsLoading(true);
      translateText(translatedText.split('\n\n')[0], newLanguage)
        .then(result => {
          setTranslatedText(result);
          setIsLoading(false);
          
          // 跟踪重新翻译完成事件
          if (window.gtag) {
            window.gtag('event', 'retranslation_completed', {
              'event_category': 'PDF Processing',
              'event_label': 'PDF Translation',
              'target_language': newLanguage,
              'success': true
            });
          }
        })
        .catch(error => {
          console.error('Translation error:', error);
          setErrorMessage(t('errors.translationError', 'Error translating text'));
          setIsLoading(false);
          
          // 跟踪重新翻译错误事件
          if (window.gtag) {
            window.gtag('event', 'retranslation_error', {
              'event_category': 'PDF Processing',
              'event_label': 'PDF Translation',
              'error_message': error.message || 'Unknown error',
              'target_language': newLanguage
            });
          }
        });
    }
  };

  const renderContent = () => {
    if (!translatedText) return null;

    return (
      <div className="mt-6">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex flex-wrap items-center space-x-2 mb-2 sm:mb-0">
            <h2 className="text-lg font-medium text-gray-900">{t('output.translatedText')}</h2>
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
        </div>

        <div className={`bg-white rounded-lg border border-gray-200 ${
          previewMode === 'formatted' ? 'p-4 sm:p-8' : 'p-4'
        }`}>
          {previewMode === 'raw' ? (
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono overflow-x-auto">{translatedText}</pre>
          ) : (
            <div 
              className="prose max-w-none dark:prose-invert prose-headings:mt-4 prose-headings:mb-2"
              dangerouslySetInnerHTML={{ __html: marked(translatedText) }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="target-language" className="block text-sm font-medium text-gray-700 mb-1">
          {t('translation.targetLanguage', 'Target Language')}
        </label>
        <select
          id="target-language"
          value={targetLanguage}
          onChange={handleLanguageChange}
          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          {targetLanguages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {isMobile ? (
        <MobileUploader onFileSelect={processFile} isLoading={isLoading} />
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500'
          }`}
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

export default PdfTranslation; 