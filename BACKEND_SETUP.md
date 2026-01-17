# 后端爬虫服务设置指南

## 概述

已创建 Python 后端服务，使用 BeautifulSoup 爬取 Swimming NZ Archive 网站的比赛结果数据。

## 文件结构

```
backend/
├── scraper.py          # 爬虫核心逻辑
├── app.py              # Flask API 服务器
├── requirements.txt    # Python 依赖
├── README.md           # 后端使用说明
└── .env.example        # 环境变量示例
```

## 安装步骤

### 1. 安装 Python 依赖

```bash
cd backend
pip install -r requirements.txt
```

或者使用虚拟环境（推荐）：

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. 配置环境变量

创建 `.env` 文件：

```bash
PORT=5000
DEBUG=True
```

### 3. 启动后端服务

```bash
python app.py
```

服务器将在 `http://localhost:5000` 启动。

## API 端点

### 健康检查
```
GET http://localhost:5000/api/health
```

### 获取个人最佳成绩
```
GET http://localhost:5000/api/personal-bests?name=<athlete_name>&club=<club_name>
```

示例：
```bash
curl "http://localhost:5000/api/personal-bests?name=Michael&club=North%20Shore"
```

### 搜索运动员成绩
```
GET http://localhost:5000/api/search?name=<athlete_name>&club=<club_name>
```

## 前端集成

### 1. 配置后端 API URL

在 `.env.local` 文件中添加：

```bash
VITE_BACKEND_API_URL=http://localhost:5000
```

### 2. 前端会自动使用后端 API

前端代码已经更新，会：
1. 首先尝试使用后端 API 爬取数据
2. 如果后端不可用，自动回退到 AI 搜索

## 爬虫功能说明

### 主要功能

1. **HTML 解析**：使用 BeautifulSoup 解析网页
2. **表格识别**：自动识别结果表格（支持多种表格结构）
3. **数据提取**：
   - 姓名 (Name)
   - 项目 (Event)
   - 成绩 (Time)
   - 分段赛绩 (Splits)
   - 俱乐部 (Club)
   - 日期 (Date)
4. **数据验证**：
   - 验证时间格式
   - 解析项目信息（距离、泳姿、课程类型）
   - 处理 colspan 和表头行
5. **PB 计算**：自动计算每个项目的个人最佳成绩

### 异常处理

- 处理表格中的 colspan
- 跳过表头行
- 处理空行和无效数据
- 网络请求超时处理
- 页面解析错误处理

## 测试

### 测试爬虫

```bash
cd backend
python scraper.py
```

### 测试 API

```bash
# 健康检查
curl http://localhost:5000/api/health

# 获取 PB
curl "http://localhost:5000/api/personal-bests?name=Michael&club=North%20Shore"
```

## 部署建议

### 开发环境
- 直接运行 `python app.py`
- 使用 `DEBUG=True` 启用调试模式

### 生产环境
- 使用 Gunicorn 或 uWSGI
- 配置 Nginx 反向代理
- 设置适当的超时和重试机制
- 添加请求限流

示例 Gunicorn 启动：
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 注意事项

1. **网站结构变化**：如果网站 HTML 结构改变，可能需要更新选择器
2. **请求频率**：避免过于频繁的请求，可能被网站限制
3. **数据准确性**：爬取的数据需要验证，建议与官方数据对比
4. **法律合规**：确保爬取行为符合网站的使用条款

## 故障排除

### 后端服务无法启动
- 检查 Python 版本（需要 3.7+）
- 确认所有依赖已安装
- 检查端口 5000 是否被占用

### 无法爬取数据
- 检查网络连接
- 验证网站 URL 是否可访问
- 查看控制台错误信息
- 可能需要更新选择器以匹配新的 HTML 结构

### 前端无法连接后端
- 确认后端服务正在运行
- 检查 `VITE_BACKEND_API_URL` 配置
- 检查 CORS 设置
- 查看浏览器控制台错误
