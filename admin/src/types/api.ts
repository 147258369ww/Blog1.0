/**
 * API 响应通用类型
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number
  limit: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
}

/**
 * 分页响应
 */
export interface PaginationResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * 后端分页响应（包装在 success 中）
 */
export interface BackendPaginationResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * 登录请求参数
 */
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

/**
 * 登录响应
 */
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: number
    email: string
    username: string
    role: 'admin' | 'user'
    avatar?: string
    createdAt: string
  }
}

/**
 * Token 刷新请求参数
 */
export interface RefreshTokenRequest {
  refreshToken: string
}

/**
 * Token 刷新响应
 */
export interface RefreshTokenResponse {
  accessToken: string
}

/**
 * 文件上传响应
 */
export interface FileUploadResponse {
  file: {
    id: number
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
    thumbnailUrl?: string
  }
  url: string
}

/**
 * 错误响应
 */
export interface ErrorResponse {
  success: false
  error: string
  message?: string
  statusCode?: number
}
