// 用户角色类型
export type UserRole = 'USER' | 'EDITOR' | 'ADMIN' | 'GUEST';

// 用户状态类型
export type UserStatus = 'active' | 'blocked' | 'inactive';

// 用户相关类型
export interface User {
  id: string; // 用户ID
  name: string; // 用户名称
  email: string; // 用户邮箱
  password?: string; // 用户密码，登录时需要
  isEmailVerified: boolean; // 邮箱是否已验证
  role: UserRole; // 用户角色
  status: UserStatus; // 用户状态
  avatar?: string; // 用户头像
  bio?: string; // 用户简介
  lastLoginAt?: string; // 最后登录时间
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
  deletedAt?: string; // 软删除
}

// 用户评论类型
export interface UserReview {
  id: string;
  userId: string;
  content: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

// 用户登录历史类型
export interface UserLoginHistory {
  id: string;
  userId: string;
  loginTime: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
}

// 用户收藏类型
export interface UserFavorite {
  userId: string; // 用户ID
  productId: string; // 产品ID
  createdAt: string; // 创建时间
}