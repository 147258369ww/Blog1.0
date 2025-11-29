import request from '@/utils/request'
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '@/types/api'

/**
 * 认证相关 API
 */
export const authApi = {
  /**
   * 用户登录
   */
  login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return request({
      url: '/admin/auth/login',
      method: 'POST',
      data,
    })
  },

  /**
   * 刷新访问令牌
   */
  refresh(data: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> {
    return request({
      url: '/admin/auth/refresh',
      method: 'POST',
      data,
    })
  },

  /**
   * 用户登出
   */
  logout(): Promise<ApiResponse<void>> {
    return request({
      url: '/admin/auth/logout',
      method: 'POST',
    })
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser(): Promise<ApiResponse<LoginResponse['user']>> {
    return request({
      url: '/admin/auth/me',
      method: 'GET',
    })
  },
}
