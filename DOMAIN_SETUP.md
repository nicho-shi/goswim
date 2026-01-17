# 自定义域名配置指南

## 在 Google Cloud Run 中配置自定义域名

### 步骤 1: 在 Cloud Run 中添加域名映射

1. 打开 [Google Cloud Console](https://console.cloud.google.com)
2. 导航到 **Cloud Run** → 选择你的服务
3. 点击 **"管理自定义域名"** 或 **"Manage Custom Domains"**
4. 点击 **"添加映射"** 或 **"Add Mapping"**
5. 输入你的域名（例如：`lapflow.com` 或 `www.lapflow.com`）
6. 点击 **"继续"**

### 步骤 2: 验证域名所有权

Google Cloud 会要求你验证域名所有权。有两种方法：

#### 方法 A: DNS 验证（推荐）

1. Google 会提供一个 TXT 记录
2. 在你的域名提供商处添加这个 TXT 记录
3. 等待验证完成（通常几分钟到几小时）

#### 方法 B: HTML 文件验证

1. 下载验证文件
2. 上传到你的网站根目录
3. 等待验证完成

### 步骤 3: 配置 DNS 记录

在你的域名提供商（如 GoDaddy, Namecheap, Cloudflare）处添加以下 DNS 记录：

#### 对于根域名 (lapflow.com)

```
类型: A
名称: @
值: (Google 提供的 IP 地址，在域名映射页面可以看到)
TTL: 3600
```

#### 对于 www 子域名 (www.lapflow.com)

```
类型: CNAME
名称: www
值: ghs.googlehosted.com
TTL: 3600
```

### 步骤 4: 等待 DNS 传播

- DNS 传播通常需要 24-48 小时
- 可以使用 [whatsmydns.net](https://www.whatsmydns.net) 检查 DNS 传播状态

### 步骤 5: SSL 证书

Google Cloud 会自动为你的域名提供免费的 SSL 证书：
- 证书会在域名验证后自动配置
- 通常需要几分钟到几小时
- 证书会自动续期

## 配置多个服务

如果你有前端和后端两个服务，可以这样配置：

### 前端服务
- 主域名：`lapflow.com` → 前端服务
- www：`www.lapflow.com` → 前端服务

### 后端服务
- API 子域名：`api.lapflow.com` → 后端服务

DNS 记录示例：
```
@          A      (Google IP)
www        CNAME  ghs.googlehosted.com
api        CNAME  ghs.googlehosted.com
```

## 更新前端配置

部署后，更新前端环境变量：

```bash
VITE_BACKEND_API_URL=https://api.lapflow.com
```

或者如果后端也在主域名下：

```bash
VITE_BACKEND_API_URL=https://lapflow.com/api
```

## 测试域名配置

```bash
# 测试 DNS 解析
dig lapflow.com
nslookup lapflow.com

# 测试 HTTPS
curl -I https://lapflow.com

# 测试后端 API
curl https://api.lapflow.com/api/health
```

## 常见问题

### DNS 记录不生效
- 检查 DNS 记录是否正确
- 等待 DNS 传播（最多 48 小时）
- 清除本地 DNS 缓存：`sudo dscacheutil -flushcache` (macOS)

### SSL 证书未配置
- 确保域名验证已完成
- 等待证书自动配置（最多 24 小时）
- 检查 Cloud Run 域名映射状态

### 无法访问网站
- 检查 Cloud Run 服务是否运行
- 验证 DNS 记录是否正确
- 检查防火墙规则
- 查看 Cloud Run 日志

## 使用 Cloudflare（可选）

如果你使用 Cloudflare：

1. 在 Cloudflare 中添加你的域名
2. 将 DNS 记录指向 Google Cloud
3. 启用 Cloudflare 的代理（橙色云）
4. 配置 SSL/TLS 模式为 "Full" 或 "Full (strict)"

注意：使用 Cloudflare 时，确保后端 API 的 CORS 配置允许 Cloudflare 的域名。
