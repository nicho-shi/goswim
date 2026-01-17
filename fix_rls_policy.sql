-- 修复 RLS 策略问题
-- 在 Supabase SQL Editor 中运行此脚本

-- 方法 1: 完全禁用 RLS（推荐用于开发环境）
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 方法 2: 如果方法 1 不起作用，删除所有现有策略并创建允许所有操作的策略
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.user_profiles;

-- 确保 RLS 已禁用
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 验证 RLS 状态
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'user_profiles';

-- 如果 rowsecurity 显示为 true，说明 RLS 仍然启用
-- 可以尝试强制禁用：
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY OFF;
