import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, changeLanguage } from '../i18n/config';

// 语言分组显示
const languageTiers = {
  tier1: ['en', 'es', 'de', 'fr'],
  tier2: ['pt-BR', 'ja', 'zh', 'ru', 'hi', 'id', 'it', 'es-MX'],
  tier3: ['nl', 'ko', 'tr', 'pl', 'sv', 'rm', 'ar', 'ha', 'ig', 'yo']
};

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const currentLanguage = i18n.language;

  // 切换下拉菜单状态
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // 关闭下拉菜单
  const closeDropdown = () => {
    setIsOpen(false);
  };

  // 切换语言
  const handleLanguageChange = async (languageCode) => {
    await changeLanguage(languageCode);
    closeDropdown();
  };

  // 获取当前语言的本地名称
  const getCurrentLanguageName = () => {
    const code = currentLanguage.split('-')[0]; // 处理复合语言代码
    return supportedLanguages[currentLanguage]?.nativeName || 
           supportedLanguages[code]?.nativeName || 
           'English';
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-center items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          id="language-menu"
          aria-expanded="true"
          aria-haspopup="true"
          onClick={toggleDropdown}
        >
          {getCurrentLanguageName()}
          <svg
            className="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 max-h-96 overflow-y-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-menu"
        >
          <div className="py-1" role="none">
            {/* 第一层语言 */}
            <div className="px-4 py-2 text-xs text-gray-500">
              {t('languages.tier1')}
            </div>
            {languageTiers.tier1.map((code) => (
              <button
                key={code}
                className={`${
                  currentLanguage === code ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                } flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-100`}
                role="menuitem"
                onClick={() => handleLanguageChange(code)}
              >
                {t(`languages.${code}`)}
              </button>
            ))}

            {/* 分隔线 */}
            <div className="border-t border-gray-100 my-1"></div>

            {/* 第二层语言 */}
            <div className="px-4 py-2 text-xs text-gray-500">
              {t('languages.tier2')}
            </div>
            {languageTiers.tier2.map((code) => (
              <button
                key={code}
                className={`${
                  currentLanguage === code ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                } flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-100`}
                role="menuitem"
                onClick={() => handleLanguageChange(code)}
              >
                {t(`languages.${code}`)}
              </button>
            ))}

            {/* 分隔线 */}
            <div className="border-t border-gray-100 my-1"></div>

            {/* 第三层语言 */}
            <div className="px-4 py-2 text-xs text-gray-500">
              {t('languages.tier3')}
            </div>
            {languageTiers.tier3.map((code) => (
              <button
                key={code}
                className={`${
                  currentLanguage === code ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                } flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-100`}
                role="menuitem"
                onClick={() => handleLanguageChange(code)}
              >
                {t(`languages.${code}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 背景蒙版，点击关闭下拉菜单 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeDropdown}
        ></div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 