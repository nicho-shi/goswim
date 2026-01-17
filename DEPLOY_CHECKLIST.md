# Google Cloud 部署准备清单

## ✅ 前置条件检查

### 1. 安装 Google Cloud SDK

**macOS:**
```bash
brew install google-cloud-sdk
```

**其他系统:**
访问 https://cloud.google.com/sdk/docs/install

**验证安装:**
```bash
gcloud --version
```

### 2. 登录 Google Cloud

```bash
gcloud auth login
gcloud init
```

### 3. 创建或选择项目

```bash
# 创建新项目
gcloud projects create lapflow-app --name="LapFlow Application"

# 或选择现有项目
gcloud config set project YOUR_PROJECT_ID

# 验证
gcloud config list
```

### 4. 启用必要的 API

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 验证已启用的 API
gcloud services list --enabled
```

### 5. 准备环境变量

部署前需要准备以下环境变量值：

**必需的：**
- `VITE_SUPABASE_URL` - 从 Supabase 项目设置获取
- `VITE_SUPABASE_ANON_KEY` - 从 Supabase 项目设置获取
- `VITE_CLERK_PUBLISHABLE_KEY` - 从 Clerk Dashboard 获取

**部署后端后获取：**
- `VITE_BACKEND_API_URL` - 部署后端服务后获得

**设置环境变量（可选）:**
```bash
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export VITE_SUPABASE_ANON_KEY="your-anon-key"
export VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
```

---

## 📋 部署流程

### 步骤 1: 部署后端

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
BACKEND_URL=$(gcloud run services describe lapflow-backend \
  --region us-central1 \
  --format 'value(status.url)')
echo "Backend URL: $BACKEND_URL"
```

### 步骤 2: 部署前端

```bash
cd ..

# 设置后端 URL（如果还没设置）
export VITE_BACKEND_API_URL=$BACKEND_URL

# 使用 Cloud Build 配置文件部署
gcloud builds submit \
  --config cloudbuild-frontend.yaml \
  --substitutions \
    _VITE_SUPABASE_URL=$VITE_SUPABASE_URL,\
    _VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY,\
    _VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY,\
    _VITE_BACKEND_API_URL=$VITE_BACKEND_API_URL
```

### 步骤 3: 验证部署

```bash
# 查看前端服务
FRONTEND_URL=$(gcloud run services describe lapflow-frontend \
  --region us-central1 \
  --format 'value(status.url)')
echo "Frontend URL: $FRONTEND_URL"

# 测试访问
curl $FRONTEND_URL
```

---

## 🚀 使用自动化脚本部署

**前提：** 已设置环境变量

```bash
# 设置环境变量
export VITE_SUPABASE_URL="your_supabase_url"
export VITE_SUPABASE_ANON_KEY="your_supabase_key"
export VITE_CLERK_PUBLISHABLE_KEY="your_clerk_key"

# 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

---

## 📝 环境变量获取指南

### Supabase

1. 登录 https://app.supabase.com
2. 选择你的项目
3. 进入 **Settings** → **API**
4. 复制：
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### Clerk

1. 登录 https://dashboard.clerk.com
2. 选择你的应用
3. 进入 **API Keys**
4. 复制 **Publishable key** → `VITE_CLERK_PUBLISHABLE_KEY`

---

## ❓ 常见问题

### Q: 如何检查 gcloud 是否已安装？
```bash
gcloud --version
```

### Q: 如何查看当前配置的项目？
```bash
gcloud config get-value project
```

### Q: 如何查看服务列表？
```bash
gcloud run services list
```

### Q: 如何查看构建日志？
```bash
gcloud builds list --limit 5
gcloud builds log BUILD_ID
```

### Q: 如何查看服务日志？
```bash
gcloud run services logs read lapflow-frontend --region us-central1
gcloud run services logs read lapflow-backend --region us-central1
```

---

**下一步:** 完成上述检查后，可以开始部署流程！
