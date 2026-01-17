#!/bin/sh

# 获取 PORT 环境变量，默认为 8080
PORT=${PORT:-8080}

# 使用 sed 替换 nginx 配置中的端口号（Alpine Linux 兼容语法）
sed -i.bak "s/listen 8080;/listen ${PORT};/" /etc/nginx/conf.d/default.conf
rm -f /etc/nginx/conf.d/default.conf.bak

# 验证配置
echo "Starting nginx on port ${PORT}"

# 测试 nginx 配置
nginx -t

# 启动 nginx
exec nginx -g "daemon off;"
