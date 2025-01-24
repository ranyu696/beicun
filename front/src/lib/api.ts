'use client'

import axios from 'axios'

export const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 如果是在浏览器环境，添加token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 如果是401错误且不是刷新token的请求，尝试刷新token
    if (error.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')

      if (refreshToken) {
        try {
          const response = await request.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`, {
            refreshToken
          })

          const { accessToken, refreshToken: newRefreshToken } = response.data
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)

          // 重试原始请求
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return request(originalRequest)
        } catch (refreshError) {
          // 刷新token失败，清除所有token
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          // 可以在这里触发登出逻辑
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)
