#!/bin/bash

# Google Cloud 部署脚本

set -e

PROJECT_ID="lapflow-app"
REGION="us-central1"
FRONTEND_SERVICE="lapflow-frontend"
BACKEND_SERVICE="lapflow-backend"

echo "🚀 Starting deployment to Google Cloud..."

# 检查 gcloud 是否安装
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install Google Cloud SDK."
    exit 1
fi

# 设置项目
echo "📦 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# 部署前端
echo "🌐 Deploying frontend..."
# 从项目根目录构建（因为 Dockerfile 需要访问所有文件）
gcloud builds submit \
  --tag gcr.io/$PROJECT_ID/$FRONTEND_SERVICE \
  --config cloudbuild-frontend.yaml \
  --substitutions _VITE_SUPABASE_URL=$VITE_SUPABASE_URL,_VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY,_VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY,_VITE_BACKEND_API_URL=$VITE_BACKEND_API_URL

# 或者直接构建和部署
# gcloud builds submit --tag gcr.io/$PROJECT_ID/$FRONTEND_SERVICE --file frontend/Dockerfile .
# gcloud run deploy $FRONTEND_SERVICE \
#   --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE \
#   --platform managed \
#   --region $REGION \
#   --allow-unauthenticated

FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region $REGION --format 'value(status.url)')
echo "✅ Frontend deployed: $FRONTEND_URL"

# 部署后端
echo "🔧 Deploying backend..."
gcloud builds submit \
  --tag gcr.io/$PROJECT_ID/$BACKEND_SERVICE \
  --config cloudbuild-backend.yaml

# 或者直接构建和部署
# cd backend
# gcloud builds submit --tag gcr.io/$PROJECT_ID/$BACKEND_SERVICE
# gcloud run deploy $BACKEND_SERVICE \
#   --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE \
#   --platform managed \
#   --region $REGION \
#   --allow-unauthenticated \
#   --port 8080

BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region $REGION --format 'value(status.url)')
echo "✅ Backend deployed: $BACKEND_URL"

echo ""
echo "🎉 Deployment complete!"
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
echo ""
echo "📝 Next steps:"
echo "1. Update VITE_BACKEND_API_URL in frontend environment variables to: $BACKEND_URL"
echo "2. Configure custom domain in Cloud Run console"
echo "3. Update DNS records for your domain"
