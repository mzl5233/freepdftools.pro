// 构建后处理脚本
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

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
  writeFile('dist/_headers', headersContent);
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

// 处理所有构建目录中的文件
processDirectory('dist');

console.log('构建后处理完成！'); 