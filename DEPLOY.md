# FreePDFTools.pro 部署指南

## 设置 GitHub 仓库

1. 在 GitHub 上创建一个新的仓库：https://github.com/mzl5233/freepdftools.pro

2. 将本地代码推送到远程仓库：

```bash
git init
git add .
git commit -m "初始化提交"
git branch -M main
git remote add origin https://github.com/mzl5233/freepdftools.pro.git
git push -u origin main
```

## 创建 GitHub Personal Access Token (PAT)

为了让 GitHub Actions 有足够的权限进行部署，您需要创建一个个人访问令牌 (PAT)：

1. 登录您的 GitHub 账户
2. 点击右上角头像，选择 "Settings"
3. 在左侧菜单中，滚动到底部并点击 "Developer settings"
4. 点击 "Personal access tokens" > "Tokens (classic)"
5. 点击 "Generate new token" > "Generate new token (classic)"
6. 在"Note"字段中输入一个描述性名称，例如 "FreePDFTools Deployment"
7. 设置过期时间（建议选择较长时间）
8. 选择以下权限范围：
   - `repo` (完整仓库访问权限)
   - `workflow` (工作流访问权限)
9. 点击 "Generate token" 按钮
10. **复制生成的令牌**（这是唯一一次可以看到完整令牌的机会）

## 设置 GitHub Secrets

GitHub Actions 需要访问 API 密钥和 PAT 来构建和部署应用程序。请按照以下步骤设置必要的 secrets：

1. 前往您的 GitHub 仓库页面
2. 点击 "Settings" 选项卡
3. 在左侧菜单中，选择 "Secrets and variables" > "Actions"
4. 点击 "New repository secret" 按钮
5. 添加以下 secrets：
   - 名称：`GH_PAT`，值：您刚才生成的个人访问令牌
   - 名称：`GEMINI_API_KEY`，值：您的 Gemini API 密钥
   - 名称：`OPENROUTER_API_KEY`，值：您的 OpenRouter API 密钥（如果使用）
   
![GitHub Secrets 设置截图](https://docs.github.com/assets/cb-49263/mw-1440/images/help/actions/secrets-and-variables-link.webp)

## 启用 GitHub Pages

1. 前往您的 GitHub 仓库页面
2. 点击 "Settings" 选项卡
3. 在左侧菜单中，选择 "Pages"
4. 在 "Source" 下，选择 "Deploy from a branch"
5. 在 "Branch" 下拉菜单中，选择 "gh-pages" 分支，并点击 "Save"

![GitHub Pages 设置截图](https://docs.github.com/assets/cb-46977/mw-1440/images/help/pages/publishing-source-drop-down.webp)

## 检查部署状态

1. 前往您的 GitHub 仓库页面
2. 点击 "Actions" 选项卡，查看工作流运行状态
3. 成功部署后，您的网站将可在 https://mzl5233.github.io/freepdftools.pro/ 访问

## 本地开发

在本地开发时，您需要设置环境变量：

1. 复制 `.env.example` 文件并重命名为 `.env`
2. 在 `.env` 文件中填入您的 API 密钥：
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```
3. 运行开发服务器：
   ```bash
   npm run dev
   ```

## 故障排除

如果您遇到部署问题，请检查以下几点：

1. 确保 GitHub Actions 工作流（`.github/workflows/deploy.yml`）中的配置正确
2. 验证 GitHub Secrets（特别是 `GH_PAT`）已正确设置
3. 检查 GitHub Pages 设置是否正确配置为从 `gh-pages` 分支部署
4. 在 "Actions" 选项卡中查看工作流运行日志以获取错误信息

### 常见的部署错误

1. **权限错误**：如果看到与权限相关的错误，请确保您的 PAT 具有正确的权限范围。
2. **构建错误**：如果构建失败，请查看错误日志，确保所有依赖项都正确安装。
3. **API密钥错误**：确保您的 API 密钥 secrets 已正确设置。 