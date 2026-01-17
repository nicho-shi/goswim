// Clerk 配置
export const clerkConfig = {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
};

// 检查配置
if (import.meta.env.DEV) {
  if (!clerkConfig.publishableKey) {
    console.warn('⚠️ Clerk Publishable Key 未配置');
    console.warn('请在 .env.local 文件中设置: VITE_CLERK_PUBLISHABLE_KEY=你的_clerk_publishable_key');
  } else {
    console.log('✅ Clerk 配置已加载');
  }
}
