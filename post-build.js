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

// 创建.nojekyll文件
writeFile('dist/.nojekyll', '');

// 检查构建后的index.html并修复可能的问题
if (fs.existsSync('dist/index.html')) {
  let indexContent = fs.readFileSync('dist/index.html', 'utf8');
  
  // 确保使用相对路径
  indexContent = indexContent.replace(/href="\//g, 'href="./');
  indexContent = indexContent.replace(/src="\//g, 'src="./');
  
  // 写回文件
  fs.writeFileSync('dist/index.html', indexContent);
  console.log('已修复: dist/index.html 中的路径引用');
}

console.log('构建后处理完成！'); 