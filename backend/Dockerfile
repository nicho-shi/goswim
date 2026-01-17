# 后端 Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 安装 Gunicorn
RUN pip install gunicorn

# 复制应用代码
COPY . .

# 暴露端口（Cloud Run 使用 8080）
EXPOSE 8080

# 设置环境变量
ENV PORT=8080
ENV PYTHONUNBUFFERED=1

# 启动应用
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
