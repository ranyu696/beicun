import { Review } from "./review"

// 评论状态枚举
export enum CommentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DELETED = 'DELETED',
}

// 用户类型
export interface User {
  id: string
  name: string
  avatar?: string
}

// 评论类型
export interface Comment {
  id: string
  reviewId: string
  userId: string
  parentId?: string
  replyToId?: string
  content: string
  status: CommentStatus
  level: number
  createdAt: string
  updatedAt: string

  // 关联
  review?: Review
  user: User
  parent?: Comment
  replyTo?: User
  replies?: Comment[]
}

// 创建评论请求
export interface CreateCommentRequest {
  reviewId: string
  content: string
  parentId?: string
  replyToId?: string
}

// 更新评论请求
export interface UpdateCommentRequest {
  content?: string
  status?: CommentStatus
}

// 评论列表查询参数
export interface CommentListParams {
  reviewId?: string
  userId?: string
  status?: CommentStatus
  parentId?: string
  page?: number
  pageSize?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

// 评论列表响应
export interface CommentListResponse {
  comments: Comment[]
  total: number
  page: number
  pageSize: number
}

// 评论表单属性
export interface CommentFormProps {
  reviewId: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}