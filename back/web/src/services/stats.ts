import { DashboardStats, UserStats, ProductStatsData, RatingStats } from '@/types/stats';
import { ApiResponse } from '@/types/api';
import { axiosInstance } from './axios';

export const statsApi = {
  // 获取仪表盘统计数据
  getDashboardStats: async () => {
    const response = await axiosInstance.get<ApiResponse<DashboardStats>>('/admin/stats/dashboard');
    return response.data;
  },

  // 获取用户统计数据
  getUserStats: async () => {
    const response = await axiosInstance.get<ApiResponse<UserStats>>('/admin/stats/users');
    return response.data;
  },

  // 获取产品统计数据
  getProductStats: async () => {
    const response = await axiosInstance.get<ApiResponse<ProductStatsData>>('/admin/stats/products');
    return response.data;
  },

  // 获取产品评分统计数据
  getRatingStats: async (productId: string) => {
    const response = await axiosInstance.get<ApiResponse<RatingStats>>(`/admin/stats/products/${productId}/ratings`);
    return response.data;
  },
};
