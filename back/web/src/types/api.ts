import { User } from "./user";

// 基础响应结构
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// 分页数据
export interface PageData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 分页响应
export interface PageResponse<T> {
  code: number;
  message: string;
  data: PageData<T>;
}

// 令牌响应
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

// 登录请求参数
export interface LoginRequest {
  email: string;
  password: string;
  turnstileToken: string;
}

// 注册请求参数
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  turnstileToken: string;
}

// 修改密码请求参数
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// 重置密码请求参数
export interface ResetPasswordRequest {
  email: string;
}
