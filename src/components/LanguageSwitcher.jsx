import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n/config';

// 根据截图更新的语言列表
const displayLanguages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '简体中文' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'ko', name: '한국어' },
  { code: 'ja', name: '日本語' },
  { code: 'pt-BR', name: 'Português' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'vi', name: 'Tiếng Việt' }
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // 获取当前语言代码
  const getCurrentLanguageCode = () => {
    return i18n.language.split('-')[0];
  };

  // 获取当前语言显示名称
  const getCurrentLanguageLabel = () => {
    const currentLang = getCurrentLanguageCode();
    const langObj = displayLanguages.find(lang => 
      lang.code === currentLang || 
      lang.code.split('-')[0] === currentLang
    );
    return langObj ? langObj.name : 'EN';
  };

  // 切换语言
  const handleChangeLanguage = (langCode) => {
    // 跟踪UI语言切换事件
    if (window.gtag) {
      window.gtag('event', 'language_changed', {
        'event_category': 'User Preference',
        'event_label': 'UI Language',
        'from_language': getCurrentLanguageCode(),
        'to_language': langCode
      });
    }
    
    changeLanguage(langCode);
    setIsOpen(false);
  };

  // 切换下拉菜单
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // 点击外部关闭下拉菜单
  const handleClickOutside = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button 
        className="flex items-center space-x-1 px-3 py-1 rounded-md bg-indigo-700 text-white"
        onClick={toggleDropdown}
      >
        <span className="i18n-globe">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        <span>{getCurrentLanguageLabel()}</span>
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={handleClickOutside}
          ></div>
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-20">
            <div className="py-1">
              {displayLanguages.map((lang) => (
                <button
                  key={lang.code}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => handleChangeLanguage(lang.code)}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher; 