# GitHub 同步配置指南

配置 GitHub 同步后，你的数据会自动保存到 GitHub 仓库，实现跨设备数据同步和备份。

## 📋 配置步骤

### 第一步：创建 GitHub Personal Access Token

1. **访问 GitHub Token 设置页面**
   - 打开：https://github.com/settings/tokens
   - 或者：GitHub 头像 → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **生成新 Token**
   - 点击 **"Generate new token"** → **"Generate new token (classic)"**
   - 填写 Token 信息：
     - **Note（备注）**：例如 "Life Tracker 数据同步"
     - **Expiration（过期时间）**：选择合适的时间（建议选择较长时间，如 90 天或 1 年）
     - **Select scopes（权限）**：**必须勾选 `repo` 权限**
       - ✅ `repo` - 完整仓库访问权限（包括私有仓库）
       - 其他权限不需要勾选

3. **生成并复制 Token**
   - 点击 **"Generate token"** 按钮
   - **重要**：立即复制 Token（格式：`ghp_xxxxxxxxxxxx`），关闭页面后无法再次查看
   - 如果忘记 Token，需要重新生成

### 第二步：准备 GitHub 仓库

你可以使用现有的仓库，或者创建一个新仓库：

1. **创建新仓库（可选）**
   - 访问：https://github.com/new
   - 填写仓库名，例如：`life-tracker-data`
   - 选择 Public 或 Private（都可以）
   - 点击 "Create repository"

2. **确认仓库信息**
   - 记住你的 **GitHub 用户名**（或组织名）
   - 记住 **仓库名**
   - 例如：`yiranzhimo/life-tracker-data`

### 第三步：在应用中配置

1. **打开应用**
   - 访问你的 Life Tracker 应用
   - 滚动到页面底部的 **"数据管理"** 模块

2. **打开 GitHub 配置**
   - 在 "GitHub 同步" 部分，点击 **"配置"** 按钮

3. **填写配置信息**
   - **GitHub 用户名/组织**：输入你的 GitHub 用户名（例如：`yiranzhimo`）
   - **仓库名**：输入仓库名（例如：`life-tracker-data`）
   - **文件路径**：数据文件在仓库中的路径（默认：`data/life-tracker.json`）
     - 可以自定义，例如：`backups/life-tracker.json` 或 `life-tracker.json`
   - **分支名**：通常是 `main` 或 `master`（默认：`main`）
   - **Personal Access Token**：粘贴刚才复制的 Token（格式：`ghp_xxxxxxxxxxxx`）

4. **保存配置**
   - 点击 **"保存配置"** 按钮
   - 系统会自动验证配置是否正确
   - 如果验证成功，会显示 "GitHub 配置已保存！"
   - 如果验证失败，会显示错误信息，请检查：
     - Token 是否正确
     - Token 是否有 `repo` 权限
     - 仓库是否存在且有访问权限
     - 用户名和仓库名是否正确

### 第四步：首次同步

配置成功后，你可以：

1. **推送到 GitHub**（首次使用）
   - 点击 **"推送到 GitHub"** 按钮
   - 这会将当前本地数据上传到 GitHub 仓库
   - 如果 GitHub 上还没有数据文件，会自动创建

2. **从 GitHub 拉取**（在其他设备上）
   - 在其他设备上配置相同的 GitHub 信息
   - 点击 **"从 GitHub 拉取"** 按钮
   - 这会从 GitHub 下载数据并覆盖本地数据

## 🔄 自动同步

配置完成后，**每次你修改数据时，系统会自动同步到 GitHub**：

- ✅ 修改出生日期或预期寿命 → 自动同步
- ✅ 添加或修改愿望清单 → 自动同步
- ✅ 记录结绳记事 → 自动同步

你不需要手动操作，数据会自动保存到 GitHub 仓库。

## 📱 跨设备使用

在不同设备上使用：

1. **设备 A（已配置）**
   - 正常使用，数据会自动同步到 GitHub

2. **设备 B（新设备）**
   - 打开应用
   - 配置相同的 GitHub 信息
   - 点击 **"从 GitHub 拉取"** 获取最新数据
   - 之后数据会自动同步

## 🔍 查看 GitHub 上的数据

你可以在 GitHub 仓库中查看同步的数据：

1. 访问你的 GitHub 仓库
2. 找到配置的文件路径（例如：`data/life-tracker.json`）
3. 点击文件可以查看 JSON 格式的数据
4. 在文件历史中可以看到每次同步的记录

## ⚙️ 配置示例

### 示例 1：使用现有仓库

```
GitHub 用户名/组织: yiranzhimo
仓库名: Lifetime
文件路径: data/life-tracker.json
分支名: main
Token: ghp_xxxxxxxxxxxx
```

### 示例 2：使用专用数据仓库

```
GitHub 用户名/组织: yiranzhimo
仓库名: life-tracker-data
文件路径: backup.json
分支名: main
Token: ghp_xxxxxxxxxxxx
```

## ⚠️ 注意事项

### Token 安全

- 🔒 Token 只存储在浏览器 localStorage 中，不会上传到任何服务器
- 🔒 Token 只用于访问你指定的仓库
- ⚠️ 如果 Token 泄露，可以在 GitHub 设置中立即撤销
- ⚠️ Token 过期后需要重新生成并更新配置

### 数据冲突

- ⚠️ 如果多个设备同时修改数据，最后保存的会覆盖之前的
- 💡 建议在不同设备上使用前，先拉取最新数据
- 💡 或者在不同设备上使用不同的时间段

### 网络要求

- 🌐 同步需要网络连接
- 🌐 如果网络不稳定，同步可能失败，但本地数据不会丢失
- 🌐 可以稍后手动点击 "推送到 GitHub" 重试

## 🛠️ 故障排除

### 问题 1：验证失败

**错误信息**：Token 无效或已过期

**解决方案**：
- 检查 Token 是否正确复制（不要有多余空格）
- 确认 Token 有 `repo` 权限
- Token 可能已过期，重新生成新 Token

### 问题 2：仓库不存在

**错误信息**：仓库不存在或无访问权限

**解决方案**：
- 检查用户名和仓库名是否正确
- 确认仓库存在
- 如果是私有仓库，确认 Token 有访问权限

### 问题 3：同步失败

**错误信息**：同步失败

**解决方案**：
- 检查网络连接
- 确认 GitHub 服务正常
- 稍后重试
- 检查浏览器控制台是否有详细错误信息

### 问题 4：数据冲突

**问题**：多个设备数据不一致

**解决方案**：
1. 在主要设备上点击 "推送到 GitHub"
2. 在其他设备上点击 "从 GitHub 拉取"
3. 或者手动导出/导入数据

## 🔄 更新配置

如果需要修改配置：

1. 点击 "配置" 按钮
2. 修改相应字段
3. 点击 "保存配置"

如果需要清除配置：

1. 点击 "配置" 按钮
2. 点击 "清除配置" 按钮
3. 之后数据只保存在本地，不会同步到 GitHub

## 📚 相关链接

- [GitHub Personal Access Tokens 文档](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub REST API 文档](https://docs.github.com/en/rest)

