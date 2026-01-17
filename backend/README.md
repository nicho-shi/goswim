# Swimming Archive Scraper Backend

Python 后端服务，用于爬取 Swimming NZ Archive 网站的比赛结果数据。

## 安装

```bash
cd backend
pip install -r requirements.txt
```

## 运行

```bash
python app.py
```

服务器将在 `http://localhost:5000` 启动。

## API 端点

### 1. 健康检查
```
GET /api/health
```

### 2. 搜索运动员成绩
```
GET /api/search?name=<athlete_name>&club=<club_name>
```

示例：
```
GET /api/search?name=Michael&club=North%20Shore
```

### 3. 获取个人最佳成绩
```
GET /api/personal-bests?name=<athlete_name>&club=<club_name>
```

示例：
```
GET /api/personal-bests?name=Michael&club=North%20Shore
```

### 4. 爬取指定页面
```
POST /api/scrape-page
Content-Type: application/json

{
  "url": "https://archive.swimming.org.nz/results/..."
}
```

## 测试

```bash
# 测试爬虫
python scraper.py

# 测试 API
curl http://localhost:5000/api/health
curl "http://localhost:5000/api/personal-bests?name=Michael&club=North%20Shore"
```

## 环境变量

创建 `.env` 文件：
```
PORT=5000
DEBUG=True
```
