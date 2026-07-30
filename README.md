# 护肤品成分研究网站

这是由原始单文件 HTML 拆分得到的静态网站工程，可部署到 GitHub Pages。网站不需要后端或数据库服务。

## 本地查看

电脑已安装 Node.js 时，在项目目录运行：

```powershell
npm run dev
```

然后访问终端显示的本地地址。不要直接双击 `index.html`，浏览器通常会阻止它读取独立的 JSON 数据文件。

## 修改与检查

- 成分短描述数据：`data/ingredients.json`
- 页面样式：`css/main.css`
- 搜索、标签页和深链接：`js/app.js`
- 原始单文件版本：`legacy/护肤品成分研究报告.html`

提交前运行：

```powershell
npm run validate
npm run build
```

首次克隆后运行一次以下命令，可启用仓库内置的提交前校验：

```powershell
npm run setup:hooks
```

启用后，每次提交都会自动运行 `npm run validate`；GitHub Actions 还会在推送和拉取请求中再次校验。

## GitHub Pages

推送到 GitHub 后，在仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。推送到 `main` 或 `master` 后，工作流会先校验数据和相对路径，再发布 `dist/` 中的静态文件。

当前站点设置了 `noindex` 和 `robots.txt` 禁止搜索引擎索引，适合个人查看。它不能代替真正的访问控制；若仓库或 Pages 链接公开，知道地址的人仍可能访问。
