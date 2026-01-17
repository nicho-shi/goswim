-- 更新 user_profiles 表结构
-- 将 swimmer_name 拆分为 first_name 和 last_name
-- 在 Supabase SQL Editor 中运行此脚本

-- 添加新列
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- 如果表中有旧数据，可以尝试从 swimmer_name 迁移（可选）
-- UPDATE public.user_profiles 
-- SET first_name = SPLIT_PART(swimmer_name, ' ', 1),
--     last_name = SPLIT_PART(swimmer_name, ' ', 2)
-- WHERE swimmer_name IS NOT NULL AND first_name IS NULL;

-- 删除旧列（如果确定不再需要）
-- ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS swimmer_name;

-- 或者保留旧列作为备份，稍后再删除
-- 建议先测试新功能，确认无误后再删除 swimmer_name 列
