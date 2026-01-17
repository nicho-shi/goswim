# 用户资料功能设置说明

## ✅ 已完成的功能

1. **用户资料服务** (`services/supabaseService.ts`)
   - 保存和加载用户资料（运动员姓名、俱乐部）
   - 使用 Clerk 用户 ID 关联

2. **用户资料设置组件** (`components/UserProfileSettings.tsx`)
   - 输入运动员姓名
   - 选择或输入俱乐部名称
   - 保存到 Supabase

3. **自动成绩抓取** (`services/archiveService.ts`)
   - 从 https://archive.swimming.org.nz/results.html 自动抓取成绩
   - 使用 AI 搜索和解析数据

4. **主应用集成** (`App.tsx`)
   - 登录后自动加载用户资料
   - 如果未设置资料，显示设置界面
   - 保存资料后自动抓取成绩
   - 可以随时编辑资料

## 🗄️ 数据库设置

### 在 Supabase 中创建表

1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. 运行 `supabase_setup.sql` 中的 SQL 脚本

或者手动创建表：

```sql
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  swimmer_name TEXT NOT NULL,
  club TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);
```

### RLS (Row Level Security) 设置

由于使用 Clerk 而不是 Supabase Auth，你有两个选择：

**选项 1：禁用 RLS（开发环境）**
```sql
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

**选项 2：使用服务角色密钥**
- 在客户端使用服务角色密钥（不推荐，仅用于开发）
- 或创建后端 API 来处理数据操作

**选项 3：创建自定义验证函数**
- 创建函数验证 Clerk JWT token
- 在 RLS 策略中使用该函数

## 🚀 使用流程

1. **首次登录**
   - 用户登录后，如果没有资料，会显示设置界面
   - 输入运动员姓名和选择俱乐部
   - 点击"保存资料"

2. **自动同步**
   - 保存后，系统自动从 Swimming NZ Archive 抓取成绩
   - 显示同步状态和抓取到的成绩数量

3. **下次登录**
   - 自动加载保存的资料
   - 自动抓取最新成绩
   - 显示运动员摘要和俱乐部信息

4. **编辑资料**
   - 点击资料输入框旁边的设置图标
   - 修改姓名或俱乐部
   - 保存后自动重新同步成绩

## 📋 功能特性

- ✅ 用户资料持久化存储（Supabase）
- ✅ 自动从官方网站抓取成绩
- ✅ 支持多个俱乐部选择
- ✅ 自定义俱乐部名称
- ✅ 自动同步和更新
- ✅ 友好的用户界面

## 🔧 故障排除

### 如果成绩抓取失败

1. 检查网络连接
2. 确认 Gemini API Key 已配置
3. 检查运动员姓名是否正确
4. 查看浏览器控制台的错误信息

### 如果资料保存失败

1. 检查 Supabase 连接
2. 确认表已创建
3. 检查 RLS 策略设置
4. 查看浏览器控制台的错误信息

## 📝 注意事项

- 成绩抓取依赖 AI 搜索，可能需要一些时间
- 如果网站结构变化，可能需要更新抓取逻辑
- 建议定期更新成绩数据
