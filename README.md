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
- Gemini API 密钥（用于AI文本处理）

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

3. 创建环境变量文件
```bash
# 复制示例环境变量文件
cp .env.example .env
# 编辑文件并添加你的API密钥
```

4. 启动开发服务器
```bash
npm run dev
```

5. 构建生产版本
```bash
npm run build
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

- **API 集成**
  - Gemini Pro API
  - OpenRouter API (可选)

## 项目结构

```
freepdftools.pro/
├── src/
│   ├── App.jsx         # 主应用组件
│   ├── main.jsx        # 应用入口点
│   └── index.css       # 样式文件
├── public/             # 静态资源
│   └── 404.html        # SPA路由重定向
├── dist/               # 生产构建输出
├── _headers            # MIME类型配置
├── vite.config.js      # Vite配置
├── post-build.js       # 构建后处理脚本
└── .github/workflows/  # GitHub Actions工作流
```

## 部署配置

本项目通过GitHub Actions自动部署到GitHub Pages。每次提交到main分支时，都会触发自动构建和部署过程。

### 关键配置文件

- **vite.config.js**: 配置项目构建选项
  ```js
  export default defineConfig({
    plugins: [react()],
    base: './', // 使用相对路径确保资源正确加载
    // 其他配置...
  })
  ```

- **post-build.js**: 构建后处理
  ```js
  // 复制必要文件
  copyFile('vite.svg', 'dist/vite.svg');
  copyFile('public/404.html', 'dist/404.html');
  copyFile('_headers', 'dist/_headers');
  
  // 创建.nojekyll文件
  writeFile('dist/.nojekyll', '');
  
  // 修复资源路径引用
  // ...
  ```

- **_headers**: MIME类型配置
  ```
  /*.js
    Content-Type: application/javascript; charset=utf-8
  
  /*.jsx
    Content-Type: application/javascript; charset=utf-8
  ```

### 部署注意事项

- 确保存在`.nojekyll`文件，防止GitHub Pages使用Jekyll处理
- 确保`404.html`正确配置以支持SPA路由
- 确保所有资源路径使用相对引用（`./`前缀）
- 解决MIME类型问题，特别是对于JSX文件

## 特殊技术实现

### MIME类型处理

项目使用多种方式确保资源正确加载：

1. `_headers`文件为不同文件类型设置正确的Content-Type头
2. `meta`标签确保HTML文档MIME类型正确
3. `post-build.js`自动修复构建后的资源路径

### SPA路由处理

使用自定义404.html页面实现客户端路由：

```html
<script type="text/javascript">
  // 单页应用的GitHub Pages重定向
  var pathSegmentsToKeep = 0;
  
  var l = window.location;
  l.replace(
    l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
    l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
    l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
    (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
    l.hash
  );
</script>
```

## 贡献

1. Fork 仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m '添加惊人的特性'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个 Pull Request

## 许可证

该项目采用 MIT 许可证 - 详情请参阅 LICENSE 文件。