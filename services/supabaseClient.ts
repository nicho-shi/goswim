import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 调试信息
if (import.meta.env.DEV) {
  console.log('Supabase 配置检查:', {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : '未设置',
    key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '未设置'
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 环境变量未配置！');
  console.error('请在 .env.local 文件中设置:');
  console.error('  VITE_SUPABASE_URL=你的_supabase_url');
  console.error('  VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key');
  throw new Error('Supabase 环境变量未配置');
}

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  // 添加全局错误处理
  global: {
    headers: {
      'x-client-info': 'lapflow@1.0.0'
    }
  }
});

// 用于浏览器环境的客户端（如果需要）
export const createBrowserClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};

// 测试 Supabase 连接
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('_test').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 是表不存在的错误，这是正常的
      throw error;
    }
    console.log('✅ Supabase 连接成功！');
    return true;
  } catch (error: any) {
    console.error('❌ Supabase 连接失败:', error.message);
    console.error('错误详情:', error);
    return false;
  }
};
