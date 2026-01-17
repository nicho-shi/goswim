-- 创建用户资料表
-- 在 Supabase SQL Editor 中运行此脚本

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  club TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON public.user_profiles(clerk_user_id);

-- 暂时禁用 RLS（因为使用 Clerk 认证，不是 Supabase Auth）
-- 如果需要启用 RLS，需要创建自定义策略来验证 Clerk 用户
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 验证表是否创建成功
SELECT * FROM public.user_profiles LIMIT 1;
