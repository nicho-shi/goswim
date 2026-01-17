-- 立即创建 user_profiles 表
-- 在 Supabase SQL Editor 中运行此脚本

-- 如果表已存在，先删除（仅用于开发环境）
-- DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- 创建表
CREATE TABLE public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  club TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_user_profiles_clerk_user_id ON public.user_profiles(clerk_user_id);

-- 禁用 RLS（因为使用 Clerk 认证）
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 验证表是否创建成功
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;
