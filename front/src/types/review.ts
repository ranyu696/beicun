import { User } from './user'
import { Product } from './product'
import { Comment } from './comment'

// 测评状态枚举
export enum ReviewStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  DELETED = 'DELETED',
}

// 测评类型
export interface Review {
  id: string
  title: string
  cover: string
  slug: string
  status: ReviewStatus
  productId: number
  userId: string
  content: string
  pros: string[]
  cons: string[]
  conclusion: string
  views: number
  isRecommended: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string

  // 关联
  product?: Product
  author: User
  comments?: Comment[]
}

export interface  ReviewListResponse {
  list: Review[]
  total: number
  page: number
  pageSize: number
}

// 测评列表查询参数
export interface ReviewListParams {
  status?: ReviewStatus
  page?: number
  pageSize?: number
}
