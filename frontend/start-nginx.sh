#!/bin/sh
set -e

# 获取 PORT 环境变量，默认为 8080
PORT=${PORT:-8080}

# 输出日志
echo "Configuring nginx to listen on port ${PORT}"

# 使用 sed 替换 nginx 配置中的端口号（Alpine Linux 兼容语法）
if sed -i.bak "s/listen 8080;/listen ${PORT};/" /etc/nginx/conf.d/default.conf 2>/dev/null; then
  rm -f /etc/nginx/conf.d/default.conf.bak
elif sed -i "s/listen 8080;/listen ${PORT};/" /etc/nginx/conf.d/default.conf 2>/dev/null; then
  # 如果 -i.bak 失败，尝试不带备份的版本
  :
else
  # 如果 sed 失败，使用 awk 或其他方法
  awk -v port="${PORT}" '{gsub(/listen 8080;/, "listen " port ";"); print}' /etc/nginx/conf.d/default.conf > /tmp/nginx.conf.tmp && \
  mv /tmp/nginx.conf.tmp /etc/nginx/conf.d/default.conf
fi

# 验证配置
echo "Testing nginx configuration..."
nginx -t || {
  echo "Nginx configuration test failed!"
  cat /etc/nginx/conf.d/default.conf
  exit 1
}

# 启动 nginx
echo "Starting nginx on port ${PORT}..."
exec nginx -g "daemon off;"
