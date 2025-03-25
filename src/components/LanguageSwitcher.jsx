import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage } from '../i18n/config';

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

  // 当语言变化时更新状态
  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      console.log(`语言已切换到: ${lng}`);
      setCurrentLang(lng);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    
    // 在组件卸载时清理事件监听
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  // 获取当前语言代码
  const getCurrentLanguageCode = () => {
    return currentLang.split('-')[0];
  };

  // 获取当前语言显示名称
  const getCurrentLanguageLabel = () => {
    const currentLangCode = getCurrentLanguageCode();
    const langObj = displayLanguages.find(lang => 
      lang.code === currentLang || 
      lang.code.split('-')[0] === currentLangCode
    );
    return langObj ? langObj.name : 'English';
  };

  // 切换语言
  const handleChangeLanguage = async (langCode) => {
    try {
      // 跟踪UI语言切换事件
      if (window.gtag) {
        window.gtag('event', 'language_changed', {
          'event_category': 'User Preference',
          'event_label': 'UI Language',
          'from_language': getCurrentLanguageCode(),
          'to_language': langCode
        });
      }
      
      console.log(`正在切换语言到: ${langCode}`);
      const success = await changeLanguage(langCode);
      
      if (success) {
        console.log(`语言切换成功: ${langCode}`);
        // 强制刷新页面内容
        window.location.reload();
      } else {
        console.error(`语言切换失败: ${langCode}`);
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('语言切换出错:', error);
      setIsOpen(false);
    }
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
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="i18n-globe">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        <span className="language-label">{getCurrentLanguageLabel()}</span>
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={handleClickOutside}
            aria-hidden="true"
          ></div>
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20">
            <div className="py-1" role="menu" aria-orientation="vertical">
              {displayLanguages.map((lang) => (
                <button
                  key={lang.code}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    currentLang === lang.code || currentLang.split('-')[0] === lang.code.split('-')[0] 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleChangeLanguage(lang.code)}
                  role="menuitem"
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