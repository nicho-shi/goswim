# Google Cloud SDK 安装指南

## ✅ 检查状态

根据检查，你的系统**尚未安装** Google Cloud SDK。

## 📥 安装方法

### 方法 1: macOS 使用 Homebrew（推荐）

**如果已安装 Homebrew:**
```bash
brew install google-cloud-sdk
```

**如果未安装 Homebrew，先安装:**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

安装后运行:
```bash
brew install google-cloud-sdk
```

### 方法 2: 官方安装脚本（推荐）

macOS/Linux:
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 方法 3: 下载安装包

访问: https://cloud.google.com/sdk/docs/install

下载 macOS 安装包并按照提示安装。

## 🔐 安装后初始化

1. **重新打开终端**（让 PATH 生效）

2. **验证安装:**
   ```bash
   gcloud --version
   ```

3. **登录 Google Cloud:**
   ```bash
   gcloud auth login
   ```

4. **初始化配置:**
   ```bash
   gcloud init
   ```
   
   按照提示：
   - 选择或创建项目
   - 选择区域（推荐：`us-central1`）

5. **创建项目（如果还没有）:**
   ```bash
   gcloud projects create lapflow-app --name="LapFlow Application"
   gcloud config set project lapflow-app
   ```

6. **启用必要的 API:**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

## ✅ 验证配置

运行检查脚本：
```bash
chmod +x prepare_deploy.sh
./prepare_deploy.sh
```

## 📝 下一步

安装完成后，继续准备环境变量和部署：

1. 复制环境变量模板：
   ```bash
   cp env.template .env.deploy
   ```

2. 编辑 `.env.deploy`，填入你的 Supabase 和 Clerk 密钥

3. 加载环境变量：
   ```bash
   source .env.deploy
   ```

4. 开始部署！
