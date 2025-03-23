# PDF 工具站部署指南

本文档提供了如何部署 PDF 工具站项目到生产环境的详细说明。

## 部署前提条件

- Node.js 16.x 或更高版本
- npm 8.x 或更高版本
- 静态文件托管服务（如 Netlify、Vercel、GitHub Pages、AWS S3 等）

## 构建项目

1. 确保已安装所有依赖项：

```bash
npm install
```

2. 创建生产环境优化构建：

```bash
npm run build
```

成功构建后，`dist` 目录将包含应用程序的生产就绪文件。

## 部署选项

### 选项 1：使用 Netlify

Netlify 提供了简单的持续部署解决方案，非常适合此类静态应用程序。

1. 在 [Netlify](https://www.netlify.com/) 创建一个账户
2. 点击 "New site from Git" 按钮
3. 连接您的 Git 仓库并选择项目
4. 配置构建设置：
   - 构建命令：`npm run build`
   - 发布目录：`dist`
5. 点击 "Deploy site"

### 选项 2：使用 Vercel

Vercel 类似于 Netlify，并针对 React 应用程序进行了优化。

1. 在 [Vercel](https://vercel.com/) 创建一个账户
2. 导入您的 Git 仓库
3. Vercel 将自动检测 Vite 配置
4. 点击 "Deploy"

### 选项 3：使用 GitHub Pages

1. 修改 `vite.config.js` 文件，添加基本路径配置：

```js
export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/', // 如果部署到 GitHub Pages
})
```

2. 创建部署脚本。在 `package.json` 文件中添加：

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. 安装 `gh-pages` 包：

```bash
npm install --save-dev gh-pages
```

4. 运行部署命令：

```bash
npm run deploy
```

### 选项 4：手动部署到任何静态主机

1. 构建项目（`npm run build`）
2. 将 `dist` 目录的内容上传到您的静态主机服务器

## 环境配置

如果您的应用需要特定的环境变量，可以在部署之前配置它们：

1. 在项目根目录创建 `.env.production` 文件
2. 添加所需的环境变量，例如：

```
VITE_API_URL=https://your-api-url.com
```

## 国际化注意事项

确保所有语言文件都正确部署。部署后进行测试，检查：

1. 语言切换功能是否正常工作
2. 所有支持的语言是否正确显示
3. 默认语言检测是否正常工作

## 性能与故障排除

- 使用 Lighthouse 或类似工具检查网站性能
- 验证所有资源是否正确加载
- 如果存在 CORS 问题，确保合适的头信息配置

## 更新部署

要更新已部署的应用：

1. 进行必要的代码更改
2. 增加应用版本（如果适用）
3. 重新构建项目
4. 按照上述任一部署方法重新部署

## 备份

部署前考虑备份以下内容：

- 源代码（确保 Git 仓库是最新的）
- 自定义配置文件
- 环境变量设置 