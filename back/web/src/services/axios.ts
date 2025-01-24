import axios from 'axios';
import { authApi } from './auth';
import { useAuthStore } from '@/store/useAuthStore';

// 创建 axios 实例
export const axiosInstance = axios.create({
  baseURL: '/api', // API 的基础路径
  timeout: 0,  // 上传大文件不设置超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 从 store 获取 token
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 如果是 401 错误且不是刷新令牌的请求
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;

      try {
        // 获取刷新令牌
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) {
          // 如果没有刷新令牌，清除认证状态并重定向到登录页面
          useAuthStore.getState().clearAuth();
          window.location.href = '/login';
          throw new Error('No refresh token');
        }

        // 刷新令牌
        const response = await authApi.refreshToken(refreshToken);
        if (!response.success || !response.data) {
          // 如果刷新失败，清除认证状态并重定向到登录页面
          useAuthStore.getState().clearAuth();
          window.location.href = '/login';
          throw new Error(response.message || 'Failed to refresh token');
        }

        const tokenData = response.data;
        const { setTokens } = useAuthStore.getState();

        // 更新令牌
        setTokens({
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
        });

        // 更新原始请求的令牌
        originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;

        // 重试原始请求
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // 刷新令牌失败，清除认证状态
        const { clearAuth } = useAuthStore.getState();
        clearAuth();
        return Promise.reject(refreshError);
      }
    }

    // 处理其他错误
    if (error.response?.data?.message) {
      return Promise.reject(new Error(error.response.data.message));
    }
    return Promise.reject(error);
  }
);
