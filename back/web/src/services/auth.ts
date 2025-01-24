import { User } from '@/types/user';
import { axiosInstance } from './axios';
import type { ApiResponse, TokenResponse, LoginRequest, RegisterRequest, ChangePasswordRequest } from '@/types/api';

export const authApi = {
  // 登录
  login: async (data: LoginRequest) => {
    const response = await axiosInstance.post<ApiResponse<TokenResponse>>('/auth/login', data);
    return response.data;
  },

  // 注册
  register: async (data: RegisterRequest) => {
    const response = await axiosInstance.post<ApiResponse<TokenResponse>>('/auth/register', data);
    return response.data;
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    const response = await axiosInstance.get<ApiResponse<User>>('/user/profile');
    return response.data;
  },

  // 修改密码
  changePassword: async (data: ChangePasswordRequest) => {
    const response = await axiosInstance.post<ApiResponse<null>>('/user/change-password', data);
    return response.data;
  },

  // 刷新令牌
  refreshToken: async (refreshToken: string) => {
    const response = await axiosInstance.post<ApiResponse<TokenResponse>>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  // 登出
  logout: async () => {
    const response = await axiosInstance.post<ApiResponse<null>>('/auth/logout');
    return response.data;
  },
};
