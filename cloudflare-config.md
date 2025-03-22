# Cloudflare与GitHub Pages正确配置指南

## 问题诊断

截图分析显示网站无法正常显示的根本原因：Cloudflare当前正在将请求代理到本地开发服务器(127.0.0.1:7890)，而不是GitHub Pages服务器。

控制台错误:
1. 页面加载时返回`text/plain`类型而非`application/javascript`
2. 请求被发送到`127.0.0.1:7890`本地地址
3. CDN请求(cdn-cgi/rum)返回404错误

## 立即解决方案

### 1. 停止使用本地代理服务器

**紧急操作**: 您需要禁用将流量代理到127.0.0.1的配置。

1. 检查您的系统代理设置(可能在系统设置或浏览器设置中)
2. 禁用任何将freepdftools.pro流量重定向到127.0.0.1:7890的代理规则
3. 如果您使用了本地hosts文件映射，请检查并移除相关条目

### 2. 正确配置Cloudflare DNS指向GitHub Pages

1. 登录Cloudflare控制面板
2. 选择您的域名(freepdftools.pro)
3. 进入DNS设置
4. 删除任何指向127.0.0.1或本地IP的记录
5. 添加以下CNAME记录：
   - 类型: CNAME
   - 名称: @（或www，根据您的需求）
   - 目标: mzl5233.github.io
   - 代理状态: 已代理（橙色云图标）

## 解决方案

### 1. 停止使用本地服务器作为生产环境源

首先，应该**立即停止**将Cloudflare配置为代理到本地服务器。这是一个临时开发配置，不适合生产环境。

### 2. 正确配置Cloudflare DNS指向GitHub Pages

1. 登录Cloudflare控制面板
2. 选择您的域名(freetoolspdf.pro)
3. 进入DNS设置
4. 删除任何指向127.0.0.1或本地IP的记录
5. 添加以下CNAME记录：
   - 类型: CNAME
   - 名称: @（或www，根据您的需求）
   - 目标: mzl5233.github.io
   - 代理状态: 已代理（橙色云图标）

### 3. 配置GitHub Pages自定义域名

1. 在GitHub仓库中，前往Settings > Pages
2. 在"Custom domain"部分输入您的域名(freetoolspdf.pro)
3. 点击"Save"
4. 确保"Enforce HTTPS"选项已勾选

### 4. 正确配置Cloudflare页面规则处理MIME类型

在Cloudflare控制面板中：

1. 进入"Rules" > "Page Rules"
2. 创建新规则，URL匹配：`*freetoolspdf.pro/*.jsx*`
3. 添加设置："Cache Level" = "Bypass"
4. 添加设置："Origin Cache Control" = "Off"
5. 添加设置："Custom Caching" = "Cache Everything"
6. 添加设置："Edge Cache TTL" = "4 hours"
7. 添加另一个规则，URL匹配：`*freetoolspdf.pro/*.js*`
8. 设置："Content Type" = "application/javascript"

### 5. 添加Cloudflare Workers处理MIME类型（可选但推荐）

如果页面规则不足以解决问题，可以使用Cloudflare Workers:

1. 在Cloudflare控制面板中，转到"Workers & Pages"
2. 点击"Create a Worker"
3. 使用以下代码创建Worker:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // 获取原始响应
  let response = await fetch(request)
  
  // 处理JSX文件
  if (url.pathname.endsWith('.jsx')) {
    // 创建新的响应，修改Content-Type
    response = new Response(response.body, response)
    response.headers.set('Content-Type', 'application/javascript; charset=utf-8')
  }
  
  // 处理JS文件
  if (url.pathname.endsWith('.js')) {
    response = new Response(response.body, response)
    response.headers.set('Content-Type', 'application/javascript; charset=utf-8')
  }
  
  return response
}
```

4. 部署Workers并配置路由规则：`*freetoolspdf.pro/*`

### 6. 清除所有缓存

配置完成后：

1. 在Cloudflare控制面板中，转到"Caching" > "Configuration"
2. 点击"Purge Everything"清除所有缓存
3. 等待几分钟让DNS更改传播

## 验证配置

配置完成后，通过以下步骤验证：

1. 使用浏览器访问您的网站：https://freetoolspdf.pro
2. 打开开发者工具(F12)，查看网络请求
3. 查找main.jsx或类似JS文件的请求
4. 确认Content-Type现在显示为`application/javascript`
5. 确认网站可以正常加载和使用

## 长期解决方案

为了彻底解决MIME类型问题：

1. 确保vite.config.js配置正确（已完成）
2. 确保构建产物引用的都是.js文件而非.jsx文件（已配置）
3. 使用post-build.js脚本处理路径和引用（已实现）
4. 确保GitHub Pages仓库中存在.nojekyll文件（已添加）
5. 定期更新依赖并测试构建产物 