# 快速部署指南 - Google Cloud

## 前提条件

1. ✅ 已购买域名
2. ✅ 已安装 Google Cloud SDK
3. ✅ 已创建 Google Cloud 项目

## 快速开始

### 1. 初始化 Google Cloud

```bash
# 登录
gcloud auth login

# 创建项目（如果还没有）
gcloud projects create lapflow-app --name="Lapflow Application"

# 设置项目
gcloud config set project lapflow-app

# 启用必要的 API
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. 准备环境变量

创建 `.env.deploy` 文件（不要提交到 Git）：

```bash
VITE_SUPABASE_URL=你的_supabase_url
VITE_SUPABASE_ANON_KEY=你的_supabase_key
VITE_CLERK_PUBLISHABLE_KEY=你的_clerk_key
VITE_BACKEND_API_URL=https://lapflow-backend-xxxxx.run.app
```

### 3. 部署后端

```bash
cd backend

# 构建并推送镜像
gcloud builds submit --tag gcr.io/lapflow-app/lapflow-backend

# 部署到 Cloud Run
gcloud run deploy lapflow-backend \
  --image gcr.io/lapflow-app/lapflow-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080

# 获取后端 URL
BACKEND_URL=$(gcloud run services describe lapflow-backend --region us-central1 --format 'value(status.url)')
echo "Backend URL: $BACKEND_URL"
```

### 4. 部署前端

```bash
cd ..

# 构建并推送镜像（使用环境变量）
gcloud builds submit \
  --tag gcr.io/lapflow-app/lapflow-frontend \
  --substitutions _VITE_SUPABASE_URL=$VITE_SUPABASE_URL,_VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY,_VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY,_VITE_BACKEND_API_URL=$BACKEND_URL \
  --config=cloudbuild-frontend.yaml

# 或者直接部署（需要先设置环境变量）
gcloud run deploy lapflow-frontend \
  --image gcr.io/lapflow-app/lapflow-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars VITE_SUPABASE_URL=$VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY,VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY,VITE_BACKEND_API_URL=$BACKEND_URL
```

### 5. 配置自定义域名

1. 在 [Cloud Run Console](https://console.cloud.google.com/run) 中选择你的服务
2. 点击 **"管理自定义域名"**
3. 添加你的域名（例如：`lapflow.com`）
4. 按照提示验证域名所有权
5. 在你的域名提供商处添加 DNS 记录：
   ```
   类型: A
   名称: @
   值: (Google 提供的 IP 地址)
   ```
6. 等待 DNS 传播和 SSL 证书配置（通常 24-48 小时）

## 使用部署脚本（推荐）

```bash
# 设置环境变量
export VITE_SUPABASE_URL="你的_supabase_url"
export VITE_SUPABASE_ANON_KEY="你的_supabase_key"
export VITE_CLERK_PUBLISHABLE_KEY="你的_clerk_key"

# 运行部署脚本
./deploy.sh
```

## 验证部署

```bash
# 检查服务状态
gcloud run services list

# 查看日志
gcloud run services logs read lapflow-frontend --region us-central1
gcloud run services logs read lapflow-backend --region us-central1

# 测试 API
curl https://your-backend-url.run.app/api/health
```

## 更新部署

```bash
# 重新构建和部署
gcloud builds submit --tag gcr.io/lapflow-app/lapflow-frontend
gcloud run deploy lapflow-frontend --image gcr.io/lapflow-app/lapflow-frontend --region us-central1
```

## 成本估算

- Cloud Run: 按使用量计费，免费额度包括：
  - 每月 200 万次请求
  - 每月 360,000 GB-秒
  - 每月 180,000 vCPU-秒
- 对于小型应用，通常在免费额度内

## 需要帮助？

查看详细文档：
- `DEPLOYMENT.md` - 完整部署指南
- `DOMAIN_SETUP.md` - 域名配置指南
