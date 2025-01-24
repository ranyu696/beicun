import { User } from '@/types/user'
import { Review, ReviewListResponse } from '@/types/review'
import { PageParams } from '@/types/api'
import { request } from './api'

export const userService = {
  // 获取当前用户信息
  getCurrentUser: () =>
    request.get<User>('/user/profile'),

  // 更新当前用户信息
  updateCurrentUser: (data: { name?: string; avatar?: string; bio?: string }) =>
    request.put<User>('/user/profile', data),

  // 修改密码
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    request.post<void>('/user/change-password', data),

  // 获取当前用户的测评列表
  getCurrentUserReviews: (params?: PageParams) =>
    request.get<ReviewListResponse>('/user/me/reviews', { params }),

  // 获取收藏列表
  getFavorites: (params?: PageParams) =>
    request.get<ReviewListResponse>('/user/me/favorites', { params }),

  // 添加收藏
  addToFavorites: (productId: number) =>
    request.post<void>(`/user/me/favorites/${productId}`),

  // 取消收藏
  removeFromFavorites: (productId: number) =>
    request.delete<void>(`/user/me/favorites/${productId}`),
}
