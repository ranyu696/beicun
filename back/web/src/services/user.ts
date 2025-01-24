import { User, UserLoginHistory, UserReview } from '@/types/user';
import { ApiResponse, PageResponse } from '@/types/api';
import { axiosInstance } from './axios';

export interface UserQueryParams {
  keyword?: string;
  role?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const userApi = {
  // 获取用户列表
  getUsers: async (params: UserQueryParams) => {
    const response = await axiosInstance.get<PageResponse<User>>('/users', { params });
    return response.data;
  },

  // 获取单个用户
  getUser: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  // 创建用户
  createUser: async (data: Partial<User>) => {
    const response = await axiosInstance.post<ApiResponse<User>>('/users', data);
    return response.data;
  },

  // 更新用户
  updateUser: async (id: string, data: Partial<User>) => {
    const response = await axiosInstance.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  },

  // 删除用户
  deleteUser: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<null>>(`/users/${id}`);
    return response.data;
  },

  // 更新用户状态
  updateUserStatus: async (id: string, status: string) => {
    const response = await axiosInstance.put<ApiResponse<User>>(`/users/${id}/status`, { status });
    return response.data;
  },

  // 更新用户角色
  updateUserRole: async (id: string, role: string) => {
    const response = await axiosInstance.put<ApiResponse<User>>(`/users/${id}/role`, { role });
    return response.data;
  },

  // 获取用户评论
  getUserReviews: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<UserReview[]>>(`/users/${id}/reviews`);
    return response.data;
  },

  // 获取用户登录历史
  getUserLoginHistory: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<UserLoginHistory[]>>(`/users/${id}/login-history`);
    return response.data;
  },
};
