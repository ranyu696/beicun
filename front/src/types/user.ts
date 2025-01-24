import { Product } from "./product"
import { Rating } from "./rating"
import { Review } from "./review"

// 用户角色枚举
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}



// 用户收藏类型
export interface UserFavorite {
  userId: string
  productId: string
  createdAt: string
  product?: Product
}

// 用户类型
export interface User {
  id: string
  name: string
  email: string
  isEmailVerified: boolean
  role: UserRole
  avatar?: string
  bio?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  status: UserStatus
  
  // 关联
  products?: Product[]
  ratings?: Rating[]
  reviews?: Review[]
  comments?: Comment[]
  favorites?: UserFavorite[]
}




