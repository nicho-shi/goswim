import { supabase } from './supabaseClient';

// 示例：用户认证相关函数
export const authService = {
  // 注册新用户
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // 登录
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // 登出
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // 获取当前用户
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // 监听认证状态变化
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// 示例：数据库操作函数（根据你的实际表结构调整）
export const databaseService = {
  // 示例：获取训练记录
  async getTrainingRecords(userId: string) {
    const { data, error } = await supabase
      .from('training_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // 示例：创建训练记录
  async createTrainingRecord(record: {
    user_id: string;
    distance: string;
    stroke: string;
    time: string;
    course: string;
    [key: string]: any;
  }) {
    const { data, error } = await supabase
      .from('training_records')
      .insert(record)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 示例：更新训练记录
  async updateTrainingRecord(id: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('training_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 示例：删除训练记录
  async deleteTrainingRecord(id: string) {
    const { error } = await supabase
      .from('training_records')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// 用户资料服务
export const userProfileService = {
  // 获取用户资料
  async getUserProfile(clerkUserId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();
    
    // PGRST116 是"未找到记录"的错误，这是正常的（用户还没有资料）
    if (error && error.code !== 'PGRST116') {
      console.error('获取用户资料失败:', error);
      throw error;
    }
    return data;
  },

  // 保存或更新用户资料
  async saveUserProfile(clerkUserId: string, profile: {
    first_name: string;
    last_name: string;
    club: string;
  }) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        clerk_user_id: clerkUserId,
        first_name: profile.first_name,
        last_name: profile.last_name,
        club: profile.club,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'clerk_user_id'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Failed to save user profile:', error);
      throw error;
    }
    return data;
  },
};

// 实时订阅示例
export const realtimeService = {
  // 订阅训练记录变化
  subscribeToTrainingRecords(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`training_records:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'training_records',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },
};
