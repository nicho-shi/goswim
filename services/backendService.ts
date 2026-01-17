/**
 * 后端 API 服务
 * 调用 Python 后端服务来爬取游泳成绩数据
 */

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000';

export interface PersonalBest {
  name: string;
  event: string;
  distance: string;
  stroke: string;
  course: 'SCM' | 'LCM';
  time: string;
  club?: string;
  date?: string;
}

/**
 * 获取运动员个人最佳成绩
 */
export const getPersonalBestsFromBackend = async (
  athleteName: string,
  club?: string
): Promise<PersonalBest[]> => {
  try {
    const params = new URLSearchParams({ name: athleteName });
    if (club) {
      params.append('club', club);
    }

    const response = await fetch(`${BACKEND_API_URL}/api/personal-bests?${params}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.personal_bests || [];
    } else {
      throw new Error(data.error || 'Failed to get personal bests');
    }
  } catch (error) {
    console.error('Backend API PB error:', error);
    throw error;
  }
};

/**
 * 检查后端服务是否可用
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/health`);
    return response.ok;
  } catch (error) {
    console.warn('Backend service not available:', error);
    return false;
  }
};
