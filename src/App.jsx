import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import { marked } from 'marked';
import { getBrowserLanguage, getText } from './i18n';
import LanguageSelector from './components/LanguageSelector';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function App() {
  const [markdown, setMarkdown] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('convert');
  const [previewMode, setPreviewMode] = useState('raw');
  const [language, setLanguage] = useState('en');
  
  // 初始化语言设置为浏览器语言或本地存储中的语言
  useEffect(() => {
    const savedLang = localStorage.getItem('pdftools-language');
    const initialLang = savedLang || getBrowserLanguage();
    setLanguage(initialLang);
  }, []);
  
  // 当语言改变时保存到本地存储
  useEffect(() => {
    localStorage.setItem('pdftools-language', language);
  }, [language]);
  
  // 翻译函数
  const t = (key) => getText(language, key);

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

  const onDrop = async (acceptedFiles) => {
    setIsLoading(true);
    const file = acceptedFiles[0];
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const text = await extractTextFromPDF(arrayBuffer);
      
      if (activeTab === 'convert') {
        setMarkdown(text);
      } else {
        setTranslatedText(text);
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert(t('errors.processingError'));
    } finally {
      setIsLoading(false);
    }
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.md';
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
    const content = activeTab === 'convert' ? markdown : translatedText;
    if (!content) return null;

    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-medium text-gray-900">
              {activeTab === 'convert' ? t('output.markdownOutput') : t('output.translatedText')}
            </h2>
            <div className="flex items-center space-x-2">
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
          {activeTab === 'convert' && (
            <button
              onClick={downloadMarkdown}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              {t('output.downloadMarkdown')}
            </button>
          )}
        </div>

        <div className={`bg-white rounded-lg border border-gray-200 ${
          previewMode === 'formatted' ? 'p-8' : 'p-4'
        }`}>
          {previewMode === 'raw' ? (
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">{content}</pre>
          ) : (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: marked(content) }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-indigo-600 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">{t('header.title')}</h1>
            <LanguageSelector 
              currentLang={language} 
              onChange={setLanguage} 
              t={t} 
            />
          </div>

          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('convert')}
                className={`${
                  activeTab === 'convert'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex-1 py-4 px-6 text-center border-b-2 font-medium`}
              >
                {t('tabs.convert')}
              </button>
              <button
                onClick={() => setActiveTab('translate')}
                className={`${
                  activeTab === 'translate'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex-1 py-4 px-6 text-center border-b-2 font-medium`}
              >
                {t('tabs.translate')}
              </button>
            </nav>
          </div>

          <div className="p-6">
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

            {isLoading && (
              <div className="mt-4 text-center text-gray-600">
                {t('output.processing')}
              </div>
            )}

            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;