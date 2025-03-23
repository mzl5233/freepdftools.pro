import en from './en';
import zh from './zh';
import es from './es';

// 在这里导入更多语言

// 所有可用的语言
export const languages = {
  en,
  zh,
  es
  // 添加更多语言
};

// 获取浏览器语言，如果不支持则使用英语
export const getBrowserLanguage = () => {
  const browserLang = navigator.language.split('-')[0];
  return languages[browserLang] ? browserLang : 'en';
};

// 获取语言文本
export const getText = (lang, key) => {
  const keys = key.split('.');
  let text = languages[lang];
  
  for (const k of keys) {
    if (text && text[k]) {
      text = text[k];
    } else {
      // 如果找不到对应的翻译，回退到英文
      text = getEnglishFallback(key);
      break;
    }
  }
  
  return text;
};

// 英文回退
const getEnglishFallback = (key) => {
  const keys = key.split('.');
  let text = languages.en;
  
  for (const k of keys) {
    if (text && text[k]) {
      text = text[k];
    } else {
      return key; // 如果在英文中也找不到，直接返回键名
    }
  }
  
  return text;
}; 