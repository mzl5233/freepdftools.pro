// 构建后处理脚本
import fs from 'fs'
import path from 'path'

// 确保dist目录存在
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

// 复制vite.svg到dist根目录
if (fs.existsSync('vite.svg')) {
  fs.copyFileSync('vite.svg', 'dist/vite.svg')
  console.log('已复制: vite.svg -> dist/vite.svg')
}

// 复制404.html到dist根目录
if (fs.existsSync('public/404.html')) {
  fs.copyFileSync('public/404.html', 'dist/404.html')
  console.log('已复制: public/404.html -> dist/404.html')
}

// 创建.nojekyll文件，防止GitHub Pages使用Jekyll处理
fs.writeFileSync('dist/.nojekyll', '')
console.log('已创建: dist/.nojekyll')

// 复制或创建CNAME文件（如果需要自定义域名）
// fs.writeFileSync('dist/CNAME', 'freepdftools.pro')
// console.log('已创建: dist/CNAME')

console.log('构建后处理完成！') 