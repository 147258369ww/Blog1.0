// API 请求/响应类型定义

import type { User, SiteConfig, SEOConfig } from './models'

// 通用API响应
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// 分页响应
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// ==================== 认证相关 ====================

// 注册请求 - 发送验证码
export interface SendVerificationCodeRequest {
  email: string
}

// 注册请求 - 验证注册
export interface RegisterRequest {
  username: string
  email: string
  password: string
  code: string
  nickname?: string
}

// 登录请求
export interface LoginRequest {
  email: string
  password: string
}

// 认证响应
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

// 刷新令牌请求
export interface RefreshTokenRequest {
  refreshToken: string
}

// 修改密码请求
export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

// ==================== 文章相关 ====================

// 创建文章请求
export interface CreatePostRequest {
  title: string
  content: string
  excerpt?: string
  coverImage?: string
  categoryId: number
  tagIds: number[]
  status: 'published' | 'draft'
}

// 更新文章请求
export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  id: number
}

// 获取文章列表参数
export interface GetPostsParams {
  page?: number
  pageSize?: number
  categoryId?: number
  tagId?: number
  status?: 'published' | 'draft'
}

// 搜索请求
export interface SearchRequest {
  keyword: string
  page?: number
  pageSize?: number
}

// ==================== 分类相关 ====================

// 创建分类请求
export interface CreateCategoryRequest {
  name: string
  slug: string
  description?: string
  color: string
}

// 更新分类请求
export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: number
}

// 获取分类文章参数
export interface GetCategoryPostsParams {
  page?: number
  pageSize?: number
}

// ==================== 标签相关 ====================

// 创建标签请求
export interface CreateTagRequest {
  name: string
  slug: string
  color: string
}

// 更新标签请求
export interface UpdateTagRequest extends Partial<CreateTagRequest> {
  id: number
}

// 搜索标签参数
export interface SearchTagsParams {
  keyword: string
}

// 获取标签文章参数
export interface GetTagPostsParams {
  page?: number
  pageSize?: number
}

// ==================== 友链相关 ====================

// 创建友链请求
export interface CreateLinkRequest {
  name: string
  url: string
  logo?: string
  description?: string
  order: number
}

// 更新友链请求
export interface UpdateLinkRequest extends Partial<CreateLinkRequest> {
  id: number
}

// ==================== 配置相关 ====================

// 更新网站配置请求
export interface UpdateSiteConfigRequest extends Partial<SiteConfig> {}

// 更新SEO配置请求
export interface UpdateSEOConfigRequest extends Partial<SEOConfig> {}

// ==================== 统计相关 ====================

// 增加浏览量请求
export interface IncrementViewCountRequest {
  postId: number
}

// ==================== 类型导出 ====================

// 导出所有类型以便统一引用
export type {
  User,
  Post,
  Category,
  Tag,
  Link,
  SiteConfig,
  SEOConfig,
  Stats
} from './models'
