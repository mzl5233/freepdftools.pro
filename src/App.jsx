import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import { marked } from 'marked';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Gemini API Key
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// 使用API转换为Markdown
async function convertToMarkdown(text) {
  try {
    // 首选使用Gemini API
    if (GEMINI_API_KEY) {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `将以下PDF提取的文本转换为格式良好的Markdown格式。保留原始文档的结构、标题、列表和段落。如果有表格，请使用Markdown表格语法重新创建它们。
              
              这是提取的文本:
              
              ${text}`,
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        }),
      });
      
      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      }
      throw new Error('无效的API响应');
    } 
    // 备选使用OpenRouter API (Gemini Flash 2.0)
    else if (OPENROUTER_API_KEY) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.href,
          'X-Title': 'FreePDFTools.pro',
        },
        body: JSON.stringify({
          model: 'google/gemini-flash-1.5',
          messages: [
            {
              role: 'user',
              content: `将以下PDF提取的文本转换为格式良好的Markdown格式。保留原始文档的结构、标题、列表和段落。如果有表格，请使用Markdown表格语法重新创建它们。
              
              这是提取的文本:
              
              ${text}`,
            }
          ],
          temperature: 0.2,
          max_tokens: 4000,
        }),
      });
      
      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      }
      throw new Error('无效的API响应');
    } else {
      // 如果API密钥未设置，则返回原始文本
      console.warn('API密钥未设置，返回原始文本');
      return text;
    }
  } catch (error) {
    console.error('转换为Markdown时出错:', error);
    return text;
  }
}

function App() {
  const [markdown, setMarkdown] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('convert');
  const [previewMode, setPreviewMode] = useState('raw');

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
        // 使用Gemini API转换为Markdown
        const formattedMarkdown = await convertToMarkdown(text);
        setMarkdown(formattedMarkdown);
      } else {
        setTranslatedText(text);
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF file');
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
              {activeTab === 'convert' ? 'Markdown Output' : 'Translated Text'}
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
                Raw
              </button>
              <button
                onClick={() => setPreviewMode('formatted')}
                className={`px-3 py-1 text-sm rounded-md ${
                  previewMode === 'formatted'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Formatted
              </button>
            </div>
          </div>
          {activeTab === 'convert' && (
            <button
              onClick={downloadMarkdown}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Download Markdown
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
          <div className="px-6 py-4 bg-indigo-600">
            <h1 className="text-2xl font-bold text-white">FreePDFTools.pro</h1>
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
                PDF to Markdown
              </button>
              <button
                onClick={() => setActiveTab('translate')}
                className={`${
                  activeTab === 'translate'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex-1 py-4 px-6 text-center border-b-2 font-medium`}
              >
                PDF Translation
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
                  <p>Drop the PDF file here...</p>
                ) : (
                  <p>Drag and drop a PDF file here, or click to select a file</p>
                )}
              </div>
            </div>

            {isLoading && (
              <div className="mt-4 text-center text-gray-600">
                Processing your PDF...
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