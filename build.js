// 自定义构建脚本
import { build } from 'vite'
import fs from 'fs'
import path from 'path'

async function copyPublicFiles() {
  // 确保dist目录存在
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist')
  }
  
  // 复制vite.svg到dist根目录
  if (fs.existsSync('vite.svg')) {
    fs.copyFileSync('vite.svg', 'dist/vite.svg')
  }
  
  // 复制404.html到dist根目录
  if (fs.existsSync('public/404.html')) {
    fs.copyFileSync('public/404.html', 'dist/404.html')
  }
  
  console.log('必要的文件已复制到dist目录')
}

async function buildApp() {
  try {
    // 运行Vite构建
    await build()
    // 复制必要的文件
    await copyPublicFiles()
    console.log('构建完成！')
  } catch (e) {
    console.error('构建过程中出错:', e)
    process.exit(1)
  }
}

buildApp() 