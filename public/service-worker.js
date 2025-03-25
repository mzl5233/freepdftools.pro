// PDF工具站服务工作线程
const CACHE_NAME = 'pdf-tools-cache-v2';
const OFFLINE_URL = '/offline.html';

// 需要缓存的资源列表
const PRE_CACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/assets/index.css',
  '/favicon.ico',
  '/logo.svg',
  '/manifest.json',
  '/locales/en/translation.json',
  '/locales/zh/translation.json',
  '/locales/ja/translation.json',
  '/locales/ko/translation.json',
  '/locales/es/translation.json',
  '/locales/fr/translation.json',
  '/locales/de/translation.json',
  '/locales/vi/translation.json',
  '/locales/zh-TW/translation.json'
];

// 安装事件：预缓存重要资源
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 安装');
  
  // 强制激活，不等待旧的service worker
  self.skipWaiting();
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('[Service Worker] 预缓存');
      
      // 缓存关键资源
      try {
        await cache.addAll(PRE_CACHE_URLS);
        console.log('[Service Worker] 预缓存完成');
      } catch (error) {
        console.error('[Service Worker] 预缓存失败', error);
      }
    })()
  );
});

// 激活事件：清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 激活');
  
  // 立即获取控制权
  event.waitUntil(clients.claim());
  
  // 删除旧缓存
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] 删除旧缓存', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// 判断请求是否为导航请求（HTML）
const isNavigationRequest = (request) => {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && 
          request.headers.get('accept').includes('text/html'));
};

// 判断请求是否为API请求
const isApiRequest = (url) => {
  return url.pathname.startsWith('/api/');
};

// 判断请求是否为翻译资源
const isTranslationRequest = (url) => {
  return url.pathname.includes('/locales/') && url.pathname.includes('/translation.json');
};

// 判断请求是否为谷歌分析
const isGoogleAnalyticsRequest = (url) => {
  return url.hostname.includes('google-analytics.com') || 
         url.hostname.includes('analytics.google.com') || 
         url.hostname.includes('googletagmanager.com');
};

// 判断请求是否为CSS或JS资源
const isStaticAsset = (url) => {
  return url.pathname.endsWith('.css') || 
         url.pathname.endsWith('.js') || 
         url.pathname.endsWith('.json') || 
         url.pathname.endsWith('.png') || 
         url.pathname.endsWith('.jpg') || 
         url.pathname.endsWith('.svg') || 
         url.pathname.endsWith('.ico');
};

// 处理fetch事件
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 跳过不支持的请求
  if (event.request.method !== 'GET') {
    return;
  }
  
  // 对谷歌分析请求不进行缓存
  if (isGoogleAnalyticsRequest(url)) {
    return;
  }
  
  // 处理策略
  if (isNavigationRequest(event.request)) {
    // 导航请求（HTML页面）使用网络优先策略
    event.respondWith(networkFirstStrategy(event.request));
  } else if (isApiRequest(url)) {
    // API请求使用网络优先策略
    event.respondWith(networkFirstStrategy(event.request));
  } else if (isTranslationRequest(url)) {
    // 翻译文件使用网络优先策略
    event.respondWith(networkFirstStrategy(event.request));
  } else if (isStaticAsset(url)) {
    // 静态资源使用缓存优先策略
    event.respondWith(cacheFirstStrategy(event.request));
  } else {
    // 其他资源使用网络优先策略
    event.respondWith(networkFirstStrategy(event.request));
  }
});

// 缓存优先，网络回退策略
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // 缓存有效的响应
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] 获取资源失败', request.url, error);
    
    // 对于图片和图标，返回空响应而不是报错
    if (request.url.match(/\.(jpg|jpeg|png|gif|svg|ico)/i)) {
      return new Response('', { status: 200, headers: { 'Content-Type': 'image/svg+xml' } });
    }
    
    // 对于失败的页面请求，返回离线页面
    if (isNavigationRequest(request)) {
      return caches.match(OFFLINE_URL);
    }
    
    // 其他资源请求失败时仍然抛出错误
    throw error;
  }
}

// 网络优先，缓存回退策略
async function networkFirstStrategy(request) {
  try {
    // 首先尝试网络请求
    const networkResponse = await fetch(request);
    
    // 缓存成功的响应
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] 网络请求失败，尝试从缓存获取', request.url);
    
    // 从缓存中尝试获取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 如果是导航请求，返回离线页面
    if (isNavigationRequest(request)) {
      return caches.match(OFFLINE_URL);
    }
    
    // 对于图片和图标失败，返回空响应而不是错误
    if (request.url.match(/\.(jpg|jpeg|png|gif|svg|ico)/i)) {
      return new Response('', { status: 200, headers: { 'Content-Type': 'image/svg+xml' } });
    }
    
    // 其他请求抛出错误
    throw error;
  }
}

// 接收消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 