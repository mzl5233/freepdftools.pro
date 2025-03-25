import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, supportedLanguages, getCurrentLanguage, reloadLanguageResources } from '../i18n/config';

// 语言列表
const displayLanguages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '简体中文' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'ko', name: '한국어' },
  { code: 'ja', name: '日本語' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'vi', name: 'Tiếng Việt' }
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage() || 'en');
  const [isChanging, setIsChanging] = useState(false);

  // 监听语言变化
  useEffect(() => {
    const handleLanguageChanged = () => {
      setCurrentLang(i18n.language);
      setIsChanging(false);
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  // 监听i18n-updated事件
  useEffect(() => {
    const handleI18nUpdated = () => {
      // 强制UI更新
      setIsChanging(false);
      setCurrentLang(i18n.language);
    };

    document.addEventListener('i18n-updated', handleI18nUpdated);
    return () => {
      document.removeEventListener('i18n-updated', handleI18nUpdated);
    };
  }, []);

  // 强制同步当前语言
  useEffect(() => {
    if (currentLang !== i18n.language) {
      setCurrentLang(i18n.language);
    }
  }, [i18n.language]);

  const handleLanguageChange = async (langCode) => {
    if (langCode === currentLang || isChanging) return;
    
    setIsChanging(true);
    setIsOpen(false);
    
    try {
      console.log(`切换语言到: ${langCode}`);
      const success = await changeLanguage(langCode);
      
      if (!success) {
        console.log('语言切换失败，尝试刷新资源...');
        await reloadLanguageResources();
      }
      
      // 触发页面更新
      document.dispatchEvent(new Event('i18n-updated'));
      
      // 如果仍然失败，考虑刷新页面
      if (i18n.language !== langCode) {
        console.log('语言未成功切换，刷新页面...');
        setTimeout(() => window.location.reload(), 100);
      }
    } catch (error) {
      console.error('语言切换错误:', error);
      setIsChanging(false);
    }
  };

  // 获取当前语言的显示名称
  const getCurrentLanguageName = () => {
    return supportedLanguages[currentLang]?.nativeName || 'English';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-1.5 text-white rounded-md bg-indigo-700 hover:bg-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-expanded={isOpen}
        disabled={isChanging}
      >
        <span className="mr-1">
          {isChanging ? '...' : getCurrentLanguageName()}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 max-h-96 overflow-y-auto">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {Object.entries(supportedLanguages).map(([code, { nativeName }]) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  code === currentLang
                    ? 'bg-indigo-100 text-indigo-900 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                role="menuitem"
              >
                {nativeName}
                {code === currentLang && (
                  <span className="ml-2 text-indigo-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 