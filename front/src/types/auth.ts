import { User } from "./user"

export interface LoginRequest {
  email: string
  password: string
  turnstileToken: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  turnstileToken: string
  verifyCode: string
}
export type CaptchaType = 'register' | 'reset_password' | 'change_email'

export interface ResetPasswordRequest {
  email: string
  oldPassword: string
  newPassword: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string
  user: User
}


export interface AuthResponse extends TokenResponse {}
