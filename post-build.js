// 构建后处理脚本
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

// 确保目录存在
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`创建目录: ${dir}`);
  }
}

// 复制文件
function copyFile(src, dest) {
  try {
    fs.copyFileSync(src, dest);
    console.log(`已复制: ${src} -> ${dest}`);
  } catch (err) {
    console.error(`复制文件失败: ${src} -> ${dest}`, err);
  }
}

// 写入文件
function writeFile(file, content) {
  try {
    fs.writeFileSync(file, content);
    console.log(`已创建: ${file}`);
  } catch (err) {
    console.error(`创建文件失败: ${file}`, err);
  }
}

// 确保dist目录存在
ensureDirectoryExists('dist');

// 复制必要文件
if (fs.existsSync('vite.svg')) {
  copyFile('vite.svg', 'dist/vite.svg');
}

if (fs.existsSync('public/404.html')) {
  copyFile('public/404.html', 'dist/404.html');
}

// 复制MIME类型配置文件
if (fs.existsSync('_headers')) {
  copyFile('_headers', 'dist/_headers');
}

// 创建.nojekyll文件
writeFile('dist/.nojekyll', '');

// 检查构建后的index.html并修复可能的问题
if (fs.existsSync('dist/index.html')) {
  let indexContent = fs.readFileSync('dist/index.html', 'utf8');
  
  // 确保使用相对路径
  indexContent = indexContent.replace(/href="\//g, 'href="./');
  indexContent = indexContent.replace(/src="\//g, 'src="./');
  
  // 添加正确的MIME类型标记
  if (!indexContent.includes('text/javascript')) {
    indexContent = indexContent.replace(/<head>/, '<head>\n    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />');
  }
  
  // 写回文件
  fs.writeFileSync('dist/index.html', indexContent);
  console.log('已修复: dist/index.html 中的路径引用和MIME类型');
}

// 添加.htaccess文件以处理MIME类型（如果需要）
const htaccessContent = `
# 设置正确的MIME类型
<IfModule mod_mime.c>
  AddType application/javascript .js
  AddType application/javascript .mjs
  AddType application/javascript .jsx
</IfModule>

# 强制HTTPS
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# 404页面重定向到index.html（单页应用）
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;

// 创建.htaccess文件（可选，在某些托管环境中可能有用）
// writeFile('dist/.htaccess', htaccessContent);

console.log('构建后处理完成！'); 