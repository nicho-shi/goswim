#!/bin/bash

# Google Cloud 部署准备脚本
# 此脚本帮助准备环境变量和检查部署前条件

set -e

echo "🚀 LapFlow 部署准备脚本"
echo "========================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查 gcloud 是否安装
echo -n "检查 Google Cloud SDK... "
if command -v gcloud &> /dev/null; then
    echo -e "${GREEN}✓ 已安装${NC}"
    gcloud --version | head -1
else
    echo -e "${YELLOW}✗ 未安装${NC}"
    echo ""
    echo "请先安装 Google Cloud SDK:"
    echo "  macOS: brew install google-cloud-sdk"
    echo "  其他系统: https://cloud.google.com/sdk/docs/install"
    echo ""
    exit 1
fi

echo ""

# 检查是否已登录
echo -n "检查 Google Cloud 登录状态... "
if gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${GREEN}✓ 已登录${NC}"
    gcloud auth list --filter=status:ACTIVE --format="value(account)"
else
    echo -e "${YELLOW}✗ 未登录${NC}"
    echo ""
    echo "请运行以下命令登录:"
    echo "  gcloud auth login"
    echo ""
    exit 1
fi

echo ""

# 检查项目配置
echo -n "检查项目配置... "
PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ -n "$PROJECT" ] && [ "$PROJECT" != "(unset)" ]; then
    echo -e "${GREEN}✓ 已配置${NC}"
    echo "  当前项目: $PROJECT"
else
    echo -e "${YELLOW}✗ 未配置${NC}"
    echo ""
    echo "请运行以下命令设置项目:"
    echo "  gcloud projects create lapflow-app --name=\"LapFlow Application\""
    echo "  gcloud config set project lapflow-app"
    echo ""
    exit 1
fi

echo ""

# 检查环境变量
echo "检查环境变量..."
echo ""

ENV_VARS_SET=true

if [ -z "$VITE_SUPABASE_URL" ]; then
    echo -e "${YELLOW}✗ VITE_SUPABASE_URL 未设置${NC}"
    ENV_VARS_SET=false
else
    echo -e "${GREEN}✓ VITE_SUPABASE_URL 已设置${NC}"
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo -e "${YELLOW}✗ VITE_SUPABASE_ANON_KEY 未设置${NC}"
    ENV_VARS_SET=false
else
    echo -e "${GREEN}✓ VITE_SUPABASE_ANON_KEY 已设置${NC}"
fi

if [ -z "$VITE_CLERK_PUBLISHABLE_KEY" ]; then
    echo -e "${YELLOW}✗ VITE_CLERK_PUBLISHABLE_KEY 未设置${NC}"
    ENV_VARS_SET=false
else
    echo -e "${GREEN}✓ VITE_CLERK_PUBLISHABLE_KEY 已设置${NC}"
fi

if [ -z "$VITE_BACKEND_API_URL" ]; then
    echo -e "${YELLOW}○ VITE_BACKEND_API_URL 未设置 (部署后端后会自动获取)${NC}"
else
    echo -e "${GREEN}✓ VITE_BACKEND_API_URL 已设置${NC}"
fi

echo ""

if [ "$ENV_VARS_SET" = false ]; then
    echo -e "${YELLOW}请设置环境变量后重新运行此脚本${NC}"
    echo ""
    echo "你可以运行以下命令设置环境变量:"
    echo "  export VITE_SUPABASE_URL=\"你的_supabase_url\""
    echo "  export VITE_SUPABASE_ANON_KEY=\"你的_supabase_key\""
    echo "  export VITE_CLERK_PUBLISHABLE_KEY=\"你的_clerk_key\""
    echo ""
    echo "或者创建一个 .env.deploy 文件:"
    echo "  VITE_SUPABASE_URL=..."
    echo "  VITE_SUPABASE_ANON_KEY=..."
    echo "  VITE_CLERK_PUBLISHABLE_KEY=..."
    echo ""
    echo "然后运行: source .env.deploy"
    echo ""
    exit 1
fi

# 检查必要的 API 是否已启用
echo "检查必要的 API..."
echo ""

APIS_ENABLED=true

echo -n "检查 Cloud Build API... "
if gcloud services list --enabled --filter="name:cloudbuild.googleapis.com" --format="value(name)" | grep -q .; then
    echo -e "${GREEN}✓ 已启用${NC}"
else
    echo -e "${YELLOW}✗ 未启用${NC}"
    APIS_ENABLED=false
fi

echo -n "检查 Cloud Run API... "
if gcloud services list --enabled --filter="name:run.googleapis.com" --format="value(name)" | grep -q .; then
    echo -e "${GREEN}✓ 已启用${NC}"
else
    echo -e "${YELLOW}✗ 未启用${NC}"
    APIS_ENABLED=false
fi

echo -n "检查 Container Registry API... "
if gcloud services list --enabled --filter="name:containerregistry.googleapis.com" --format="value(name)" | grep -q .; then
    echo -e "${GREEN}✓ 已启用${NC}"
else
    echo -e "${YELLOW}✗ 未启用${NC}"
    APIS_ENABLED=false
fi

echo ""

if [ "$APIS_ENABLED" = false ]; then
    echo "启用必要的 API..."
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable run.googleapis.com
    gcloud services enable containerregistry.googleapis.com
    echo -e "${GREEN}✓ API 已启用${NC}"
fi

echo ""
echo -e "${GREEN}✅ 所有检查通过！准备就绪，可以开始部署。${NC}"
echo ""
echo "下一步："
echo "1. 部署后端: cd backend && gcloud builds submit --tag gcr.io/$PROJECT/lapflow-backend"
echo "2. 获取后端 URL 并部署前端: 使用 deploy.sh 脚本或手动部署"
echo ""
