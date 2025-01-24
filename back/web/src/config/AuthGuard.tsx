import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { UserRole } from '@/types/user'
import { useEffect } from 'react'
import { authApi } from '@/services/auth'

const ALLOWED_ROLES: UserRole[] = ['ADMIN', 'EDITOR']

const AuthGuard = () => {
  const { user, isAuthenticated, setUser } = useAuthStore()

  useEffect(() => {
    // 如果有 token 但没有用户信息，尝试获取用户信息
    if (isAuthenticated && !user) {
      authApi.getCurrentUser().then(response => {
        if (response.data) {
          setUser(response.data)
        }
      })
    }
  }, [isAuthenticated, user, setUser])

  // 如果未认证，重定向到登录页面
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  // 如果已认证但没有用户信息，显示加载状态
  if (!user) {
    return <div>Loading...</div>
  }

  // 检查角色权限
  if (!ALLOWED_ROLES.includes(user.role)) {
    return <Navigate to="/auth/unauthorized" replace />
  }

  return <Outlet />
}

export default AuthGuard
