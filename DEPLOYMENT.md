# Google Cloud 部署指南

## 部署架构

```
前端 (React + Vite) → Cloud Run / App Engine
后端 (Python Flask) → Cloud Run
数据库 → Supabase (已配置)
认证 → Clerk (已配置)
```

## 1. 前端部署 (Cloud Run)

### 创建 Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 使用 nginx 提供静态文件
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 创建 nginx 配置

```nginx
# frontend/nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 2. 后端部署 (Cloud Run)

### 创建 Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 8080

# 启动应用
CMD exec gunicorn --bind :8080 --workers 1 --threads 8 --timeout 0 app:app
```

### 创建 .dockerignore

```
__pycache__
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv
*.log
.env
.git
.gitignore
```

## 3. 部署步骤

### 步骤 1: 安装 Google Cloud SDK

```bash
# macOS
brew install google-cloud-sdk

# 或下载安装包
# https://cloud.google.com/sdk/docs/install
```

### 步骤 2: 初始化 Google Cloud

```bash
gcloud init
gcloud auth login
```

### 步骤 3: 创建项目

```bash
gcloud projects create lapflow-app --name="Lapflow Application"
gcloud config set project lapflow-app
```

### 步骤 4: 启用必要的 API

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 步骤 5: 部署前端

```bash
cd frontend
gcloud builds submit --tag gcr.io/lapflow-app/lapflow-frontend
gcloud run deploy lapflow-frontend \
  --image gcr.io/lapflow-app/lapflow-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars VITE_SUPABASE_URL=your_supabase_url,VITE_SUPABASE_ANON_KEY=your_key,VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

### 步骤 6: 部署后端

```bash
cd backend
gcloud builds submit --tag gcr.io/lapflow-app/lapflow-backend
gcloud run deploy lapflow-backend \
  --image gcr.io/lapflow-app/lapflow-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars PORT=8080
```

## 4. 配置自定义域名

### 步骤 1: 验证域名所有权

```bash
# 在 Google Cloud Console 中
# 导航到 Cloud Run → 域名映射 → 添加映射
```

### 步骤 2: 添加 DNS 记录

在你的域名提供商处添加以下 DNS 记录：

```
类型: A
名称: @
值: (Google 提供的 IP 地址)

类型: CNAME
名称: www
值: ghs.googlehosted.com
```

### 步骤 3: 配置 SSL 证书

Google Cloud 会自动为你的域名提供 SSL 证书。

## 5. 环境变量配置

### 前端环境变量

在 Cloud Run 中设置：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_BACKEND_API_URL` (后端服务 URL)

### 后端环境变量

在 Cloud Run 中设置：
- `PORT=8080`
- 其他需要的环境变量

## 6. 更新前端配置

更新 `services/backendService.ts` 中的后端 URL：

```typescript
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'https://your-backend-url.run.app';
```

## 7. 持续部署 (可选)

### 使用 Cloud Build

创建 `cloudbuild.yaml`:

```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/lapflow-frontend', './frontend']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/lapflow-frontend']
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'lapflow-frontend'
      - '--image'
      - 'gcr.io/$PROJECT_ID/lapflow-frontend'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
```

## 8. 监控和日志

```bash
# 查看日志
gcloud run services logs read lapflow-frontend --region us-central1
gcloud run services logs read lapflow-backend --region us-central1

# 查看服务状态
gcloud run services describe lapflow-frontend --region us-central1
```

## 9. 成本优化

- 使用 Cloud Run 的按需计费
- 设置最小实例数为 0（节省成本）
- 使用 Cloud CDN 缓存静态资源
- 启用压缩和缓存

## 10. 安全检查

- 确保所有敏感信息都在环境变量中
- 不要将 `.env` 文件提交到代码库
- 使用 Secret Manager 存储敏感密钥
- 配置 CORS 策略
- 启用 Cloud Armor（如果需要）

## 故障排除

### 前端无法加载
- 检查环境变量是否正确设置
- 查看 Cloud Run 日志
- 验证构建是否成功

### 后端 API 无法访问
- 检查 CORS 配置
- 验证后端服务 URL
- 查看后端日志

### 域名无法访问
- 验证 DNS 记录是否正确
- 检查 SSL 证书状态
- 等待 DNS 传播（可能需要 24-48 小时）
