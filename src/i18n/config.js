import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// 内置翻译资源，以防静态文件加载失败
const resources = {
  en: {
    translation: {
      "header": {
        "title": "PDF Tool Station"
      },
      "tabs": {
        "convert": "PDF to Markdown",
        "translate": "PDF Translation"
      },
      "dropzone": {
        "dragActive": "Drop the PDF file here...",
        "dragInactive": "Drag and drop a PDF file here, or click to select a file",
        "mobileUpload": "Tap to select a PDF file"
      },
      "output": {
        "markdownOutput": "Markdown Output",
        "translatedText": "Translated Text",
        "raw": "Raw",
        "formatted": "Formatted",
        "downloadMarkdown": "Download Markdown",
        "processing": "Processing your PDF..."
      },
      "errors": {
        "processingError": "Error processing PDF file",
        "fileTooLarge": "File is too large (max 50MB)",
        "invalidFileType": "Only PDF files are supported",
        "translationError": "Error translating text"
      },
      "translation": {
        "targetLanguage": "Target Language"
      },
      "meta": {
        "title": "PDF Tool Station - Convert PDF to Markdown",
        "description": "Convert PDF files to Markdown format with our free online tool. Preserve formatting, extract text, and convert PDFs to clean Markdown.",
        "keywords": "pdf to markdown, pdf converter, markdown converter, free pdf tool, pdf extraction"
      },
      "languageGroups": {
        "popular": "Popular",
        "asian": "Asian",
        "other": "Other"
      }
    }
  },
  zh: {
    translation: {
      "header": {
        "title": "PDF工具站"
      },
      "tabs": {
        "convert": "PDF转Markdown",
        "translate": "PDF翻译"
      },
      "dropzone": {
        "dragActive": "将PDF文件拖放到这里...",
        "dragInactive": "将PDF文件拖放到这里，或点击选择文件",
        "mobileUpload": "点击选择PDF文件"
      },
      "output": {
        "markdownOutput": "Markdown输出",
        "translatedText": "翻译文本",
        "raw": "原始",
        "formatted": "格式化",
        "downloadMarkdown": "下载Markdown",
        "processing": "正在处理您的PDF..."
      },
      "errors": {
        "processingError": "处理PDF文件时出错",
        "fileTooLarge": "文件太大（最大50MB）",
        "invalidFileType": "仅支持PDF文件",
        "translationError": "翻译文本时出错"
      },
      "translation": {
        "targetLanguage": "目标语言"
      },
      "meta": {
        "title": "PDF工具站 - PDF转Markdown",
        "description": "使用我们的免费在线工具将PDF文件转换为Markdown格式。保留格式，提取文本，并将PDF转换为清晰的Markdown。",
        "keywords": "pdf转markdown，pdf转换器，markdown转换器，免费pdf工具，pdf提取"
      },
      "languageGroups": {
        "popular": "常用语言",
        "asian": "亚洲语言",
        "other": "其他语言"
      }
    }
  }
};

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

// 重定向到本地化版本
export const redirectToLocalizedVersion = () => {
  // 只在浏览器环境中执行
  if (typeof window === 'undefined') return;
  
  // 已有语言参数则不重定向
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('lng')) return;
  
  // 尝试从localStorage获取上次语言
  let detectedLang = localStorage.getItem('i18nextLng');
  
  // 没有则从浏览器获取
  if (!detectedLang) {
    detectedLang = navigator.language;
  }
  
  // 映射到支持的语言
  const languageCode = detectedLang.split('-')[0];
  const mappedLang = languageMapping[detectedLang] || 
                    (Object.keys(supportedLanguages).includes(languageCode) ? languageCode : 'en');
  
  // 添加语言参数并重定向
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('lng', mappedLang);
  
  // 使用replace避免在历史记录中添加条目
  window.location.replace(currentUrl.toString());
};

// 初始化i18next
const initI18n = () => {
  i18n
    // 加载翻译文件的后端
    .use(Backend)
    // 检测用户语言
    .use(LanguageDetector)
    // 传递i18n实例给react-i18next
    .use(initReactI18next)
    // 初始化i18next
    .init({
      // 默认语言
      fallbackLng: 'en',
      
      // 显示调试信息
      debug: process.env.NODE_ENV === 'development',
      
      // 命名空间
      ns: ['translation'],
      defaultNS: 'translation',
      
      // 检测用户语言设置
      detection: {
        // 检测语言的顺序
        order: ['querystring', 'navigator', 'htmlTag', 'localStorage', 'cookie', 'path', 'subdomain'],
        // URL查询参数名
        lookupQuerystring: 'lng',
        // 保存到localStorage的键名
        lookupLocalStorage: 'i18nextLng',
        // 缓存用户语言
        caches: ['localStorage', 'cookie'],
        // 排除某些检测结果
        excludeCacheFor: ['cimode'],
        // 设置cookie的选项
        cookieOptions: { path: '/', sameSite: 'strict' }
      },
      
      // 后端配置
      backend: {
        // 翻译文件的加载路径
        loadPath: '/locales/{{lng}}/translation.json',
        // 跨域请求
        crossDomain: true,
        // 允许重试加载失败的资源
        allowMultiLoading: true
      },
      
      // 插值配置
      interpolation: {
        escapeValue: false, // React已经安全防止XSS
      },
      
      // 确保加载完成后返回
      wait: true,
      
      // 资源缓存到浏览器
      load: 'currentOnly',
      
      // 启用查询参数路由
      appendNamespaceToMissingKey: true,
      
      // 调整重载行为
      react: {
        useSuspense: true,
        wait: true,
        bindI18n: 'languageChanged loaded',
        bindI18nStore: 'added removed',
        nsMode: 'default',
        transSupportBasicHtmlNodes: true,
        transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
      }
    });
  
  return i18n;
};

// 初始化i18n
const i18nInstance = initI18n();

// 监听语言变化
i18nInstance.on('languageChanged', (lng) => {
  console.log(`语言已更改为: ${lng}`);
  
  // 更新页面元数据
  updateMetadata(lng);
  
  // 更新页面URL
  updateUrlLanguage(lng);
  
  // 如果有localStorage，保存用户选择
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('i18nextLng', lng);
  }
  
  // 刷新文本和布局
  document.documentElement.lang = lng;
  document.documentElement.dir = isRTL(lng) ? 'rtl' : 'ltr';
  
  // 如果存在，通知分析工具
  if (window.gtag) {
    window.gtag('event', 'language_change', {
      'language': lng
    });
  }
});

// 检查是否是RTL语言
const isRTL = (language) => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(language);
};

// 获取URL中的语言参数
export const getUrlLanguage = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lng');
  }
  return null;
};

// 更新URL中的语言参数
export const updateUrlLanguage = (language) => {
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.set('lng', language);
    
    // 使用history API更新URL而不刷新页面
    window.history.replaceState({}, '', url.toString());
  }
};

// 更新页面元数据
export const updateMetadata = (language) => {
  // 设置文档语言
  document.documentElement.lang = language;
  
  // 获取翻译键
  const t = (key) => {
    return i18nInstance.t(key);
  };
  
  // 更新页面标题
  document.title = t('meta.title');
  
  // 更新meta描述
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.content = t('meta.description');
  }
  
  // 更新meta关键词
  const metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords) {
    metaKeywords.content = t('meta.keywords');
  }
  
  // 更新Open Graph元数据
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.content = t('meta.title');
  }
  
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.content = t('meta.description');
  }
  
  // 更新Twitter卡片元数据
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) {
    twitterTitle.content = t('meta.title');
  }
  
  const twitterDescription = document.querySelector('meta[name="twitter:description"]');
  if (twitterDescription) {
    twitterDescription.content = t('meta.description');
  }
  
  // 更新结构化数据
  const structuredData = document.querySelector('script[type="application/ld+json"]');
  if (structuredData) {
    try {
      const data = JSON.parse(structuredData.textContent);
      data.name = t('header.title');
      data.description = t('meta.description');
      structuredData.textContent = JSON.stringify(data);
    } catch (e) {
      console.error('结构化数据JSON解析错误:', e);
    }
  }
};

// 语言切换函数
export const changeLanguage = async (language) => {
  try {
    // 检查语言资源是否已加载
    const hasLoadedLanguage = i18nInstance.hasResourceBundle(language, 'translation');
    
    // 如果没有加载，预先加载资源
    if (!hasLoadedLanguage) {
      try {
        const response = await fetch(`/locales/${language}/translation.json`);
        if (response.ok) {
          const data = await response.json();
          i18nInstance.addResourceBundle(language, 'translation', data);
        } else {
          console.warn(`无法加载语言资源: ${language}`);
        }
      } catch (error) {
        console.error(`加载语言资源时出错: ${language}`, error);
      }
    }
    
    // 切换语言
    await i18nInstance.changeLanguage(language);
    
    // 更新页面URL
    updateUrlLanguage(language);
    
    return true;
  } catch (error) {
    console.error('切换语言时出错:', error);
    return false;
  }
};

// 强制刷新语言资源
export const reloadLanguageResources = async () => {
  const currentLng = i18nInstance.language;
  
  try {
    // 重新加载当前语言资源
    await i18nInstance.reloadResources(currentLng);
    console.log(`已刷新语言资源: ${currentLng}`);
    return true;
  } catch (error) {
    console.error('刷新语言资源时出错:', error);
    return false;
  }
};

// 获取当前语言
export const getCurrentLanguage = () => {
  return i18nInstance.language;
};

// 修复语言代码
export const fixLanguageCode = (code) => {
  if (!code) return 'en';
  
  // 处理一些特殊情况
  if (code === 'zh-CN' || code === 'zh-Hans') return 'zh';
  if (code === 'zh-TW' || code === 'zh-Hant') return 'zh-TW';
  
  // 如果是复合语言代码，只取主要部分
  if (code.includes('-')) {
    const mainCode = code.split('-')[0];
    // 检查是否支持主要语言
    if (['en', 'zh', 'es', 'fr', 'de', 'ja', 'ko'].includes(mainCode)) {
      return mainCode;
    }
  }
  
  return code;
};

// 初始化多语言支持
export const initLanguage = () => {
  console.log('初始化语言设置...');
  
  // 从URL获取语言设置
  const urlLang = getUrlLanguage();
  
  // 从localStorage获取用户之前的语言设置
  const storedLang = typeof localStorage !== 'undefined' ? localStorage.getItem('i18nextLng') : null;
  
  // 从浏览器获取语言设置
  const browserLang = navigator.language || navigator.userLanguage;
  
  // 优先级：URL > localStorage > 浏览器设置
  const languageToUse = fixLanguageCode(urlLang || storedLang || browserLang);
  
  // 设置语言
  if (languageToUse) {
    changeLanguage(languageToUse);
  }
  
  return languageToUse;
};

// 在组件挂载时调用此函数
export { i18nInstance };
export default i18nInstance; 