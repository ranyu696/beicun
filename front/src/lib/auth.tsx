'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {  LoginRequest, RegisterRequest } from '@/types/auth'
import { authService } from '@/services/auth'
import { useRouter } from 'next/navigation'
import { User } from '@/types/user'

interface AuthContextType {
  user: User | null
  login: (data: LoginRequest) => Promise<any>
  register: (data: RegisterRequest) => Promise<any>
  logout: () => Promise<void>
  isLoading: boolean
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    try {
      // 检查本地存储的用户信息
      const storedUser = localStorage.getItem('user')
      const accessToken = localStorage.getItem('accessToken')

      if (storedUser && accessToken && storedUser !== 'undefined') {
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser && typeof parsedUser === 'object') {
          console.log('从本地存储恢复用户:', parsedUser)
          setUser(parsedUser)
        }
      }
    } catch (error) {
      console.error('Error parsing stored user:', error)
      // 清除可能损坏的数据
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateUser = (newUser: User) => {
    console.log('更新用户信息:', newUser)
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
    router.refresh()
  }

  const login = async (data: LoginRequest) => {
    try {
      console.log('调用登录 API...')
      const response = await authService.login(data)
      console.log('登录 API 响应:', response)

      if (response.user) {
        console.log('设置用户状态:', response.user)
        setUser(response.user)
        localStorage.setItem('user', JSON.stringify(response.user))
        localStorage.setItem('accessToken', response.accessToken)
        localStorage.setItem('refreshToken', response.refreshToken)
        router.refresh()
      } else {
        console.error('登录响应中没有用户数据')
        throw new Error('登录响应中没有用户数据')
      }
      
      return response
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      console.log('调用注册 API...')
      const response = await authService.register(data)
      console.log('注册 API 响应:', response)

      if (response.user) {
        console.log('设置用户状态:', response.user)
        setUser(response.user)
        localStorage.setItem('user', JSON.stringify(response.user))
        localStorage.setItem('accessToken', response.accessToken)
        localStorage.setItem('refreshToken', response.refreshToken)
        router.refresh()
      } else {
        console.error('注册响应中没有用户数据')
        throw new Error('注册响应中没有用户数据')
      }
      
      return response
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      router.refresh()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      // 即使出错也清除本地数据
      setUser(null)
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
