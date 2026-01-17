# --- 第一阶段：构建阶段 ---
FROM node:18-alpine AS build-stage

WORKDIR /app

# 复制依赖描述文件并安装
COPY package*.json ./
RUN npm install

# 复制项目所有代码
COPY . .

# 构建应用时传入环境变量
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_BACKEND_API_URL

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_BACKEND_API_URL=$VITE_BACKEND_API_URL

# 构建应用 (Vite 必须步骤)
RUN npm run build

# --- 第二阶段：运行阶段 (使用 Nginx) ---
FROM nginx:stable-alpine

# 从第一阶段复制构建好的静态文件到 Nginx 目录
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制自定义 Nginx 配置文件（已配置监听 8080 端口）
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Google Cloud Run 默认监听 8080 端口
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
