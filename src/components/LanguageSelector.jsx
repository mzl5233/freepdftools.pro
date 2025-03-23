import React from 'react';
import { languages } from '../i18n';

function LanguageSelector({ currentLang, onChange, t }) {
  return (
    <div className="relative inline-block text-left">
      <select
        className="block w-full py-1 pl-3 pr-10 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        value={currentLang}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Select language"
      >
        {Object.keys(languages).map((lang) => (
          <option key={lang} value={lang}>
            {t(`languages.${lang}`)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSelector; 