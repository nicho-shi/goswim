#!/bin/bash

# LapFlow 部署脚本
# 自动部署前端和后端到 Google Cloud Run

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 LapFlow 部署脚本${NC}"
echo "=========================="
echo ""

# 检查 gcloud
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ 错误：未找到 gcloud 命令${NC}"
    echo ""
    echo "请确保："
    echo "1. Google Cloud SDK 已安装"
    echo "2. 重新打开了终端窗口（让 PATH 生效）"
    echo "3. 或手动添加 gcloud 到 PATH："
    echo "   export PATH=\$PATH:\$HOME/google-cloud-sdk/bin"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ gcloud 已找到${NC}"
echo ""

# 加载环境变量
if [ -f .env.deploy ]; then
    echo -e "${BLUE}📋 加载环境变量...${NC}"
    source .env.deploy
    echo -e "${GREEN}✓ 环境变量已加载${NC}"
else
    echo -e "${RED}❌ 错误：未找到 .env.deploy 文件${NC}"
    exit 1
fi

# 检查必需的环境变量
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ] || [ -z "$VITE_CLERK_PUBLISHABLE_KEY" ]; then
    echo -e "${RED}❌ 错误：环境变量未完整设置${NC}"
    echo "请检查 .env.deploy 文件"
    exit 1
fi

# 获取项目 ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "(unset)" ]; then
    echo -e "${YELLOW}⚠️  未检测到 Google Cloud 项目${NC}"
    read -p "请输入项目 ID (例如: lapflow-app): " PROJECT_ID
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}❌ 项目 ID 不能为空${NC}"
        exit 1
    fi
    gcloud config set project $PROJECT_ID
fi

echo -e "${GREEN}✓ 项目: $PROJECT_ID${NC}"
echo ""

REGION="us-central1"
BACKEND_SERVICE="lapflow-backend"
FRONTEND_SERVICE="lapflow-frontend"

# 步骤 1: 部署后端
echo -e "${BLUE}🔧 步骤 1: 部署后端服务...${NC}"
echo ""

cd backend

echo "构建并推送后端镜像..."
gcloud builds submit \
  --tag gcr.io/$PROJECT_ID/$BACKEND_SERVICE \
  --timeout=20m

echo ""
echo "部署后端到 Cloud Run..."
gcloud run deploy $BACKEND_SERVICE \
  --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --timeout=300

BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE \
  --region $REGION \
  --format 'value(status.url)')

echo ""
echo -e "${GREEN}✅ 后端部署成功！${NC}"
echo -e "   后端 URL: ${GREEN}$BACKEND_URL${NC}"
echo ""

cd ..

# 更新环境变量中的后端 URL
export VITE_BACKEND_API_URL=$BACKEND_URL
echo -e "${BLUE}📝 已更新 VITE_BACKEND_API_URL: $BACKEND_URL${NC}"
echo ""

# 步骤 2: 部署前端
echo -e "${BLUE}🌐 步骤 2: 部署前端服务...${NC}"
echo ""

echo "构建并推送前端镜像（包含环境变量）..."
gcloud builds submit \
  --config cloudbuild-frontend.yaml \
  --substitutions \
    _VITE_SUPABASE_URL=$VITE_SUPABASE_URL,\
    _VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY,\
    _VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY,\
    _VITE_BACKEND_API_URL=$VITE_BACKEND_API_URL \
  --timeout=20m

FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE \
  --region $REGION \
  --format 'value(status.url)')

echo ""
echo -e "${GREEN}✅ 前端部署成功！${NC}"
echo -e "   前端 URL: ${GREEN}$FRONTEND_URL${NC}"
echo ""

# 完成
echo "=========================="
echo -e "${GREEN}🎉 部署完成！${NC}"
echo ""
echo "服务地址："
echo -e "  🌐 前端: ${GREEN}$FRONTEND_URL${NC}"
echo -e "  🔧 后端: ${GREEN}$BACKEND_URL${NC}"
echo ""
echo "📝 下一步："
echo "1. 访问前端 URL 测试应用"
echo "2. 配置自定义域名（可选）"
echo "3. 在 Cloud Run Console 中监控服务"
echo ""
