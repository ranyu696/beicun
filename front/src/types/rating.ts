import { User } from './user'
import { Product } from './product'

// 评分类型
export interface Rating {
  id: string
  productId: number
  userId: string
  rating: number
  reason?: string
  createdAt: string

  // 关联
  product?: Product
  user?: User
}

// 创建评分请求
export interface CreateRatingRequest {
  productId: number
  rating: number
  reason?: string
}

// 更新评分请求
export interface UpdateRatingRequest {
  rating?: number
  reason?: string
}

// 评分列表查询参数
export interface RatingListParams {
  productId?: number
  userId?: string
  minRating?: number
  maxRating?: number
  page?: number
  pageSize?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

// 评分列表响应
export interface RatingListResponse {
  ratings: Rating[]
  total: number
  page: number
  pageSize: number
}
