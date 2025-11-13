// 认证 API 服务

import { http } from '../http'
import type {
  ApiResponse,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  User
} from '@/types'

/**
 * 认证相关 API 服务
 */
export const authApi = {
  /**
   * 发送注册验证码
   * POST /api/v1/auth/register
   */
  sendVerificationCode(email: string): Promise<ApiResponse<void>> {
    return http.post('/auth/register', { email })
  },

  /**
   * 验证注册码并完成注册
   * POST /api/v1/auth/verify
   */
  register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return http.post('/auth/verify', data)
  },

  /**
   * 用户登录
   * POST /api/v1/auth/login
   */
  login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return http.post('/auth/login', data)
  },

  /**
   * 用户登出
   * POST /api/v1/auth/logout
   */
  logout(): Promise<ApiResponse<void>> {
    return http.post('/auth/logout')
  },

  /**
   * 刷新访问令牌
   * POST /api/v1/auth/refresh
   */
  refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return http.post('/auth/refresh', { refreshToken })
  },

  /**
   * 获取当前用户信息
   * GET /api/v1/auth/me
   */
  getCurrentUser(): Promise<ApiResponse<User>> {
    return http.get('/auth/me')
  },

  /**
   * 修改密码
   * PUT /api/v1/auth/password
   */
  changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return http.put('/auth/password', { oldPassword, newPassword })
  }
}
