# 优化项目，彻底解决MIME类型问题

## 当前项目配置回顾

已经实施的解决方案：

1. 使用正确的`vite.config.js`配置
2. 创建`.nojekyll`文件阻止GitHub Pages使用Jekyll处理
3. 使用`post-build.js`脚本处理构建后的文件和路径
4. 添加`_headers`文件定义正确的MIME类型
5. 修改`index.html`中的脚本引用路径

## 进一步优化方案

### 1. 确保构建系统产生正确的文件类型

修改`vite.config.js`，完全避免在构建后产生`.jsx`文件引用：

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: './', // 使用相对路径
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // 确保资源文件名使用js扩展名
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 4096,
    sourcemap: false,
    assetsDir: 'assets'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    // 强制使用.js扩展名
    enforceExtension: false
  }
})
```

### 2. 增强post-build.js处理能力

修改`post-build.js`脚本，确保所有资源引用正确：

```javascript
// 增强版post-build.js
import fs from 'fs'
import path from 'path'

// 处理目录中所有HTML和JS文件
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 递归处理子目录
      processDirectory(filePath);
    } else if (filePath.endsWith('.html') || filePath.endsWith('.js')) {
      // 处理HTML和JS文件
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 替换所有.jsx引用为.js
      content = content.replace(/\.jsx(['"])/g, '.js$1');
      
      // 确保使用相对路径
      content = content.replace(/href="\//g, 'href="./');
      content = content.replace(/src="\//g, 'src="./');
      
      // 写回文件
      fs.writeFileSync(filePath, content);
      console.log(`处理文件: ${filePath}`);
    }
  });
}

// 确保dist目录存在
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
  console.log('创建dist目录');
}

// 复制必要文件
if (fs.existsSync('vite.svg')) {
  fs.copyFileSync('vite.svg', 'dist/vite.svg');
  console.log('复制: vite.svg -> dist/vite.svg');
}

if (fs.existsSync('public/404.html')) {
  fs.copyFileSync('public/404.html', 'dist/404.html');
  console.log('复制: public/404.html -> dist/404.html');
}

// 复制MIME类型配置
if (fs.existsSync('_headers')) {
  fs.copyFileSync('_headers', 'dist/_headers');
  console.log('复制: _headers -> dist/_headers');
} else {
  // 创建默认_headers文件
  const headersContent = `/*
  Content-Type: text/html; charset=utf-8

/*.js
  Content-Type: application/javascript; charset=utf-8

/*.jsx
  Content-Type: application/javascript; charset=utf-8

/*.css
  Content-Type: text/css; charset=utf-8

/*.svg
  Content-Type: image/svg+xml
`;
  fs.writeFileSync('dist/_headers', headersContent);
  console.log('创建: dist/_headers');
}

// 创建.nojekyll文件
fs.writeFileSync('dist/.nojekyll', '');
console.log('创建: dist/.nojekyll');

// 处理构建目录中的所有文件
processDirectory('dist');

console.log('构建后处理完成!');
```

### 3. 优化index.html模板

修改`index.html`，完全避免直接引用`.jsx`文件：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="./vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>FreePDFTools.pro - PDF转Markdown工具</title>
    <meta name="description" content="免费在线PDF转Markdown工具，使用AI技术保留原文格式">
    <!-- 确保JavaScript MIME类型正确 -->
    <script type="application/javascript">
      // SPA路由处理
      (function() {
        if (window.location.hostname !== 'localhost') {
          const l = window.location;
          if (l.search[1] === '/') {
            var decoded = l.search.slice(1).split('&').map(function(s) { 
              return s.replace(/~and~/g, '&')
            }).join('?');
            window.history.replaceState(null, null,
              l.pathname.slice(0, -1) + decoded + l.hash
            );
          }
        }
      })();
    </script>
  </head>
  <body>
    <div id="root"></div>
    <!-- 注意：Vite会处理这个路径，确保使用相对路径 -->
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 4. 添加Netlify配置（备选部署平台）

创建`netlify.toml`文件，处理MIME类型和重定向：

```toml
[build]
  publish = "dist"
  command = "npm run build"

[[headers]]
  for = "/*.js"
    [headers.values]
    Content-Type = "application/javascript; charset=utf-8"

[[headers]]
  for = "/*.jsx"
    [headers.values]
    Content-Type = "application/javascript; charset=utf-8"

[[headers]]
  for = "/*.css"
    [headers.values]
    Content-Type = "text/css; charset=utf-8"

# SPA路由处理
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 本地开发环境配置

如果需要在本地开发环境中测试：

1. 启动开发服务器，确保使用带有正确MIME类型配置的服务器：

```javascript
// server.js
const express = require('express');
const path = require('path');
const app = express();

// 设置MIME类型
app.use((req, res, next) => {
  if (req.path.endsWith('.jsx')) {
    res.type('application/javascript');
  }
  next();
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')));

// SPA路由处理
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

2. 安装Express并运行服务器：

```bash
npm install express --save-dev
node server.js
```

## 部署前的检查清单

在每次部署前，请检查：

1. ✅ `vite.config.js`配置正确
2. ✅ 确保不直接引用`.jsx`文件
3. ✅ `.nojekyll`文件存在于项目根目录
4. ✅ `_headers`文件包含正确的MIME类型配置
5. ✅ `post-build.js`脚本能正确处理所有文件

通过实施这些优化，应该能彻底解决MIME类型问题，确保网站在GitHub Pages和其他平台上正常运行。 