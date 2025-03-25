// PDF工具站 Service Worker
const CACHE_NAME = 'pdf-tools-cache-v1';

// 需要缓存的资源列表
const RESOURCES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/locales/zh/translation.json',
  '/locales/en/translation.json',
  '/locales/ja/translation.json'
];

// 安装事件 - 预缓存关键资源
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 安装');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] 缓存资源');
        return cache.addAll(RESOURCES_TO_CACHE);
      })
      .then(() => {
        // 强制激活
        return self.skipWaiting();
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 激活');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 立即接管页面
      return self.clients.claim();
    })
  );
});

// 网络优先策略，回退到缓存
const networkFirstWithCacheFallback = async (request) => {
  try {
    // 尝试从网络获取
    const networkResponse = await fetch(request);
    
    // 复制响应，因为响应流只能使用一次
    const clonedResponse = networkResponse.clone();
    
    // 如果成功获取，更新缓存
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(request, clonedResponse);
    });
    
    return networkResponse;
  } catch (error) {
    // 网络请求失败，尝试从缓存中获取
    console.log('[Service Worker] 网络请求失败，使用缓存:', request.url);
    const cachedResponse = await caches.match(request);
    
    // 如果缓存中存在，返回缓存的响应
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 如果缓存中也不存在，返回一个离线页面或错误响应
    if (request.destination === 'document') {
      return caches.match('/offline.html') || new Response('网络不可用', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'text/html'
        })
      });
    }
    
    // 其他资源类型的错误处理
    return new Response('资源不可用', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
};

// 缓存优先策略，用于静态资源
const cacheFirstWithNetworkFallback = async (request) => {
  // 先尝试从缓存中获取
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // 缓存中没有，尝试从网络获取
  try {
    const networkResponse = await fetch(request);
    const clonedResponse = networkResponse.clone();
    
    // 更新缓存
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(request, clonedResponse);
    });
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] 无法获取资源:', request.url);
    
    // 如果是图片资源，可以返回一个占位图
    if (request.destination === 'image') {
      return new Response('', {
        status: 200,
        statusText: 'OK'
      });
    }
    
    // 对于其他类型的资源，返回一个错误响应
    return new Response('资源不可用', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
};

// 拦截请求
self.addEventListener('fetch', (event) => {
  // 排除非GET请求和浏览器扩展请求
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith('http')) {
    return;
  }
  
  const url = new URL(event.request.url);
  
  // 不同的资源类型使用不同的策略
  if (
    event.request.destination === 'document' || 
    url.pathname.includes('/locales/') || 
    url.pathname.includes('/api/')
  ) {
    // HTML、翻译资源和API请求使用网络优先策略
    event.respondWith(networkFirstWithCacheFallback(event.request));
  } else if (
    event.request.destination === 'style' || 
    event.request.destination === 'script' || 
    event.request.destination === 'image' || 
    event.request.destination === 'font'
  ) {
    // 静态资源使用缓存优先策略
    event.respondWith(cacheFirstWithNetworkFallback(event.request));
  } else {
    // 其他请求
    event.respondWith(networkFirstWithCacheFallback(event.request));
  }
});

// 接收消息 - 处理页面发送的消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 