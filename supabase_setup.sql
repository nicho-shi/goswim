-- 创建用户资料表
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  swimmer_name TEXT NOT NULL,
  club TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);

-- 启用 Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看和更新自己的资料
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid()::text = clerk_user_id);

-- 注意：由于我们使用 Clerk 而不是 Supabase Auth，
-- 你可能需要调整 RLS 策略或使用服务角色密钥
-- 或者创建一个函数来验证 Clerk 用户 ID

-- 如果使用服务角色，可以暂时禁用 RLS 或创建自定义策略
-- 对于 Clerk 集成，建议使用服务角色密钥在客户端操作
