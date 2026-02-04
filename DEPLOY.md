# 部署到 Render 指南

## 方式一：使用 Render Blueprint（推荐）

### 1. 创建 GitHub 仓库
1. 访问 https://github.com/new
2. 仓库名称：`elderly-points`（或其他名称）
3. 选择 Public 或 Private
4. 点击 "Create repository"

### 2. 上传代码到 GitHub
由于你的电脑没有安装 Git，使用以下方式上传：

**方式 A：直接网页上传**
1. 访问你刚创建的 GitHub 仓库
2. 点击 "uploading an existing file" 链接
3. 拖拽项目所有文件到页面
4. 点击 "Commit changes"

**方式 B：使用 GitHub Desktop**
1. 下载安装 https://desktop.github.com/
2. 选择 "Add existing repository"
3. 选择项目文件夹
4. 填写提交信息，点击 "Commit to main"
5. 点击 "Publish repository"

### 3. 在 Render 部署

1. 访问 https://dashboard.render.com
2. 点击 "New +" → "Blueprint"
3. 连接你的 GitHub 账号，授权访问仓库
4. 选择 `elderly-points` 仓库
5. Render 会自动读取 `render.yaml` 并创建服务：
   - **elderly-db**: MySQL 数据库（免费版）
   - **elderly-backend**: Node.js 后端 API
   - **elderly-frontend**: 静态前端网站
6. 等待部署完成（约 5-10 分钟）

### 4. 初始化数据库

部署完成后，需要初始化数据库：

1. 在 Render 控制台找到 **elderly-db** 数据库
2. 点击 "Connect" 获取连接信息
3. 使用以下方式执行 init.sql：

**使用 Render Shell：**
```bash
# 进入后端服务 Shell
mysql -h <数据库host> -u <用户名> -p <密码> <database_name> < init.sql
```

或 **使用 MySQL Workbench：**
1. 下载安装 MySQL Workbench
2. 创建新连接，填入 Render 提供的数据库信息
3. 打开 init.sql 文件并执行

### 5. 访问网站

部署完成后，Render 会提供两个 URL：
- 前端：https://elderly-frontend.onrender.com
- 后端：https://elderly-backend.onrender.com

默认账号：
- 管理员：admin / 123456
- 李河院长：lihe_yz / 123456
- 武陵院长：wuling_yz / 123456
- 甘宁院长：ganning_yz / 123456

---

## 方式二：手动创建服务（备用）

如果 Blueprint 有问题，可以手动创建：

### 1. 创建数据库
1. Render Dashboard → "New +" → "PostgreSQL"（或 MySQL）
2. 名称：`elderly-db`
3. 选择 Free Plan
4. 记录连接信息

### 2. 创建后端服务
1. "New +" → "Web Service"
2. 选择 GitHub 仓库
3. 配置：
   - **Name**: elderly-backend
   - **Runtime**: Docker
   - **Dockerfile Path**: ./backend/Dockerfile
   - **Port**: 3000
4. 添加环境变量（从数据库页面复制）
5. 点击 "Create Web Service"

### 3. 创建前端服务
1. "New +" → "Static Site"
2. 选择 GitHub 仓库
3. 配置：
   - **Name**: elderly-frontend
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: frontend/dist
4. 添加环境变量：`VITE_API_BASE_URL` = 后端服务 URL
5. 点击 "Create Static Site"

---

## 注意事项

1. **免费版限制**：
   - 服务一段时间不访问会休眠，首次访问需要等待唤醒（约 30 秒）
   - 数据库有存储限制

2. **唤醒服务**：
   - 可以访问 https://uptimerobot.com/ 添加监控，每 5 分钟 ping 一次保持活跃

3. **域名**：
   - Render 提供免费域名 `xxx.onrender.com`
   - 可以绑定自定义域名（在设置中添加 Custom Domain）

4. **更新代码**：
   - 每次推送到 GitHub，Render 会自动重新部署

---

## 故障排查

**问题 1：数据库连接失败**
- 检查环境变量是否正确
- 确认数据库允许外部连接（Render 默认允许）

**问题 2：前端无法连接后端**
- 检查 `VITE_API_BASE_URL` 是否设置正确
- 确认后端服务状态为 "Live"

**问题 3：页面显示 404**
- 检查前端 Build Command 和 Publish Directory
- 查看 Render 构建日志

**问题 4：数据库表不存在**
- 确认 init.sql 已正确执行
- 检查数据库连接是否正确
