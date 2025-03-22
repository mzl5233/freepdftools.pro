# FreePDFTools.pro

一个强大的网页应用，用于将PDF文档转换为Markdown格式，提供清晰专业的界面。

## 功能特点

- **PDF转Markdown**
  - 提取文本同时保留文档结构
  - 支持复杂文档布局
  - 表格提取功能
  - 干净、格式化的输出

- **用户界面**
  - 现代化、响应式设计
  - 拖放式文件上传
  - 实时预览
  - 原始和格式化视图选项
  - 下载转换后的文件

## 开始使用

### 前提条件

- Node.js 16.x 或更高版本
- npm 7.x 或更高版本

### 安装

1. 克隆仓库
```bash
git clone https://github.com/mzl5233/freepdftools.pro.git
cd freepdftools.pro
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

## 技术栈

- **前端**
  - React 18
  - Vite
  - Tailwind CSS
  - PDF.js
  - React Dropzone
  - Marked

- **开发工具**
  - PostCSS
  - Autoprefixer

## 项目结构

```
freepdftools.pro/
├── src/
│   ├── App.jsx         # 主应用组件
│   ├── main.jsx        # 应用入口点
│   └── index.css       # 样式文件
├── public/             # 静态资源
└── dist/               # 生产构建输出
```

## 自动部署

本项目通过GitHub Actions自动部署到GitHub Pages。每次提交到main分支时，都会触发自动构建和部署过程。

## 贡献

1. Fork 仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m '添加惊人的特性'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个 Pull Request

## 许可证

该项目采用 MIT 许可证 - 详情请参阅 LICENSE 文件。