# GitHub Pages 部署指南

## 前置准备

1. **确保已安装 Git**
   ```bash
   git --version
   ```

2. **确保已安装 Node.js 和 npm**
   ```bash
   node --version
   npm --version
   ```

## 部署步骤

### 第一步：在 GitHub 上创建仓库

1. 登录 GitHub，点击右上角的 "+" → "New repository"
2. 填写仓库信息：
   - **Repository name**: 例如 `life-tracker` 或 `人生追踪器`
   - **Description**: 可选，描述项目
   - **Visibility**: 选择 Public（GitHub Pages 免费版需要公开仓库）或 Private（需要 GitHub Pro）
   - **不要**勾选 "Initialize this repository with a README"（因为本地已有代码）
3. 点击 "Create repository"

### 第二步：初始化本地 Git 仓库并推送代码

在项目目录下执行以下命令：

```bash
# 进入项目目录
cd /Users/liqian/IAPR/1.Productivity/Lifetime

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: Life Tracker with GitHub sync"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/你的仓库名.git

# 推送到 GitHub（首次推送）
git branch -M main
git push -u origin main
```

**注意**：将 `你的用户名` 和 `你的仓库名` 替换为实际的 GitHub 用户名和仓库名。

例如：
```bash
git remote add origin https://github.com/liqian/life-tracker.git
```

### 第三步：启用 GitHub Pages

1. 在 GitHub 仓库页面，点击 **Settings**（设置）
2. 在左侧菜单中找到 **Pages**（页面）
3. 在 **Source**（源）部分：
   - 选择 **"GitHub Actions"**
   - 不要选择 "Deploy from a branch"
4. 点击 **Save**（保存）

### 第四步：等待自动部署

1. 推送代码后，GitHub Actions 会自动开始构建
2. 在仓库页面点击 **Actions** 标签，可以看到构建进度
3. 构建完成后（通常 1-2 分钟），部署会自动完成
4. 在 **Settings → Pages** 中可以看到部署地址

### 第五步：访问网站

部署完成后，访问地址为：
```
https://你的用户名.github.io/你的仓库名/
```

例如：
```
https://liqian.github.io/life-tracker/
```

## 后续更新

每次修改代码后，只需：

```bash
git add .
git commit -m "更新描述"
git push
```

GitHub Actions 会自动重新构建和部署。

## 常见问题

### 1. 构建失败

**问题**：GitHub Actions 构建失败

**解决方案**：
- 检查 Actions 标签中的错误信息
- 确保 `package.json` 中的依赖都正确
- 确保 `next.config.js` 配置正确
- 检查是否有语法错误

### 2. 页面显示 404

**问题**：访问地址显示 404

**解决方案**：
- 等待几分钟，首次部署可能需要更长时间
- 检查 Settings → Pages 中的部署状态
- 确保 Source 选择了 "GitHub Actions"
- 检查仓库是否为 Public（免费版 GitHub Pages 需要公开仓库）

### 3. 样式或功能不正常

**问题**：页面显示但样式错乱或功能不工作

**解决方案**：
- 检查浏览器控制台是否有错误
- 确保 `next.config.js` 中 `output: 'export'` 已配置
- 清除浏览器缓存后重试

### 4. 自定义域名

如果需要使用自定义域名：

1. 在仓库 Settings → Pages 中，在 **Custom domain** 输入域名
2. 在域名 DNS 设置中添加 CNAME 记录，指向 `你的用户名.github.io`
3. 等待 DNS 生效（通常几分钟到几小时）

## 验证部署

部署成功后，你可以：

1. ✅ 访问网站并测试所有功能
2. ✅ 测试数据保存（localStorage）
3. ✅ 测试 GitHub 同步功能（如果已配置）
4. ✅ 在不同设备上访问，验证响应式设计

## 安全提示

- ⚠️ **不要**在代码中硬编码敏感信息（如 GitHub Token）
- ⚠️ GitHub Token 只存储在浏览器 localStorage 中，不会暴露在代码中
- ⚠️ 如果使用 Private 仓库，确保 Token 有足够权限

## 相关链接

- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Next.js 静态导出文档](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

