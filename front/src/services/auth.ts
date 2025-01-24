'use client'

import { AuthResponse, LoginRequest, RegisterRequest, ResetPasswordRequest, TokenResponse } from '@/types/auth'
import { request } from '@/lib/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}


export const authService = {
  // 登录
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await request.post<ApiResponse<AuthResponse>>(`${API_BASE_URL}/auth/login`, data)
    console.log('API 原始响应:', response)
    
    // 存储令牌和用户信息
    const { accessToken, refreshToken, user, expiresAt } = response.data.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))
    
    return {
      accessToken,
      refreshToken,
      user,
      expiresAt
    }
  },

  // 注册
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await request.post<ApiResponse<AuthResponse>>(`${API_BASE_URL}/auth/register`, data)
    console.log('API 原始响应:', response)
    
    // 存储令牌和用户信息
    const { accessToken, refreshToken, user, expiresAt } = response.data.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))
    
    return {
      accessToken,
      refreshToken,
      user,
      expiresAt
    }
  },

  // 刷新令牌
  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await request.post<TokenResponse>(`${API_BASE_URL}/auth/refresh`, { refreshToken })
    // 更新存储的令牌
    localStorage.setItem('accessToken', response.data.accessToken)
    localStorage.setItem('refreshToken', response.data.refreshToken)
    return response.data
  },

  // 重置密码
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await request.post<void>(`${API_BASE_URL}/auth/reset-password`, data, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
  },

  // 登出
  logout: async (): Promise<void> => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        await request.post<void>(`${API_BASE_URL}/auth/logout`, null, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        })
      }
    } finally {
      // 无论是否成功都清除本地存储
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  },
}
