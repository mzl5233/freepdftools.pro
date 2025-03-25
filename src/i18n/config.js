import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// 支持的语言列表，按优先级分组
export const supportedLanguages = {
  // 第一层（高优先级）
  en: { nativeName: 'English' },
  es: { nativeName: 'Español' },
  de: { nativeName: 'Deutsch' },
  fr: { nativeName: 'Français' },
  
  // 第二层（中等优先级）
  'pt-BR': { nativeName: 'Português Brasileiro' },
  ja: { nativeName: '日本語' },
  zh: { nativeName: '中文' },
  ru: { nativeName: 'Русский' },
  hi: { nativeName: 'हिन्दी' },
  id: { nativeName: 'Bahasa Indonesia' },
  it: { nativeName: 'Italiano' },
  'es-MX': { nativeName: 'Español Mexicano' },
  
  // 第三层（较低优先级）
  nl: { nativeName: 'Nederlands' },
  ko: { nativeName: '한국어' },
  tr: { nativeName: 'Türkçe' },
  pl: { nativeName: 'Polski' },
  sv: { nativeName: 'Svenska' },
  rm: { nativeName: 'Rumantsch' },
  ar: { nativeName: 'العربية' },
  ha: { nativeName: 'Hausa' },
  ig: { nativeName: 'Igbo' },
  yo: { nativeName: 'Yorùbá' }
};

// 语言代码映射，处理区域变体
const languageMapping = {
  'en-US': 'en',
  'en-GB': 'en',
  'es-ES': 'es',
  'de-DE': 'de',
  'fr-FR': 'fr',
  'zh-CN': 'zh',
  'zh-TW': 'zh',
  'zh-HK': 'zh',
  'pt-PT': 'pt-BR',
  'ja-JP': 'ja',
  'ru-RU': 'ru',
  'hi-IN': 'hi',
  'id-ID': 'id',
  'it-IT': 'it',
  'nl-NL': 'nl',
  'ko-KR': 'ko',
  'tr-TR': 'tr',
  'pl-PL': 'pl',
  'sv-SE': 'sv',
  'ar-SA': 'ar'
};

i18n
  // 加载翻译文件
  .use(Backend)
  // 自动检测用户语言
  .use(LanguageDetector)
  // 将i18n实例传递给react-i18next
  .use(initReactI18next)
  // 初始化i18next
  .init({
    // 后端配置
    backend: {
      // 翻译文件的加载路径 - 修正路径
      loadPath: '/locales/{{lng}}/translation.json',
    },
    
    // 语言检测配置
    detection: {
      // 检测顺序
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      
      // 使用查询参数处理语言切换 (?lng=en)
      lookupQuerystring: 'lng',
      
      // 使用cookie持久化语言选择
      lookupCookie: 'i18next',
      cookieExpirationDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2年
      
      // 使用localStorage存储语言选择
      lookupLocalStorage: 'i18nextLng',
      
      // 总是存储语言选择
      caches: ['localStorage', 'cookie'],
    },
    
    // 默认语言
    fallbackLng: 'en',
    
    // 确保不是加载中状态显示键名
    partialBundledLanguages: true,
    
    // 资源预加载
    preload: ['en', 'zh', 'es', 'fr', 'de', 'ja'],
    
    // 插值配置
    interpolation: {
      escapeValue: false, // React已经安全地处理了转义
    },
    
    // 错误处理
    saveMissing: false, // 不记录缺失的翻译键，避免干扰用户
    
    // 加载设置
    load: 'currentOnly',
    react: {
      useSuspense: true,
    },
    
    // 调试模式
    debug: false
  });

// 处理语言切换
export const changeLanguage = async (language) => {
  try {
    await i18n.changeLanguage(language);
    document.documentElement.lang = language;
    
    // 更新HTML lang属性和网页标题
    updateMetadata(language);
    
    // 更新hreflang标签
    updateHrefLangTags(language);
    
    return true;
  } catch (error) {
    console.error('Error changing language:', error);
    return false;
  }
};

// 更新页面元数据
export const updateMetadata = (language) => {
  // 更新页面标题
  const title = i18n.t('meta.title', { defaultValue: 'PDF Tool Station' });
  document.title = title;
  
  // 更新描述
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.content = i18n.t('meta.description', { defaultValue: '' });
  } else {
    const descriptionMeta = document.createElement('meta');
    descriptionMeta.name = 'description';
    descriptionMeta.content = i18n.t('meta.description', { defaultValue: '' });
    document.head.appendChild(descriptionMeta);
  }
  
  // 更新关键词
  const metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords) {
    metaKeywords.content = i18n.t('meta.keywords', { defaultValue: '' });
  } else {
    const keywordsMeta = document.createElement('meta');
    keywordsMeta.name = 'keywords';
    keywordsMeta.content = i18n.t('meta.keywords', { defaultValue: '' });
    document.head.appendChild(keywordsMeta);
  }
};

// 更新hreflang标签，用于SEO
export const updateHrefLangTags = (currentLang) => {
  // 移除现有的hreflang标签
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
  
  // 获取当前URL，不包含查询参数
  const url = new URL(window.location.href);
  const baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
  
  // 添加默认的canonical链接
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = `${baseUrl}?lng=${currentLang}`;
  
  // 为每种支持的语言添加hreflang标签
  Object.keys(supportedLanguages).forEach(lang => {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = lang;
    link.href = `${baseUrl}?lng=${lang}`;
    document.head.appendChild(link);
  });
  
  // 添加x-default hreflang
  const defaultLink = document.createElement('link');
  defaultLink.rel = 'alternate';
  defaultLink.hreflang = 'x-default';
  defaultLink.href = `${baseUrl}?lng=en`;
  document.head.appendChild(defaultLink);
};

// 监听语言变化，更新元数据
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  updateMetadata(lng);
  updateHrefLangTags(lng);
});

// 手动初始化语言
const initializeLanguage = () => {
  const currentLang = i18n.language || window.navigator.language || 'en';
  const mappedLang = languageMapping[currentLang] || currentLang.split('-')[0] || 'en';
  
  if (Object.keys(supportedLanguages).includes(mappedLang)) {
    changeLanguage(mappedLang);
  } else {
    changeLanguage('en');
  }
};

// 初始化
initializeLanguage();

export default i18n; 