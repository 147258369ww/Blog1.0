import request from '@/utils/request'
import type { ApiResponse, PaginationResponse } from '@/types/api'

// 文章状态枚举
export type ArticleStatus = 'draft' | 'published' | 'archived'

// 文章数据类型定义
export interface Article {
  id: number
  title: string
  slug: string
  summary?: string
  content: string
  coverImage?: string
  status: ArticleStatus
  isFeatured: boolean
  allowComments: boolean
  viewCount: number
  authorId: number
  categoryId?: number
  category?: {
    id: number
    name: string
  }
  tags?: Array<{
    id: number
    name: string
  }>
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

// 文章列表项类型定义
export interface ArticleListItem {
  id: number
  title: string
  slug: string
  summary?: string
  coverImage?: string
  status: ArticleStatus
  isFeatured: boolean
  viewCount: number
  authorId: number
  categoryId?: number
  category?: {
    id: number
    name: string
  }
  tags?: Array<{
    id: number
    name: string
  }>
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

// 文章创建请求类型定义
export interface ArticleCreateRequest {
  title: string
  slug?: string
  summary?: string
  content: string
  coverImage?: string
  status?: ArticleStatus
  isFeatured?: boolean
  allowComments?: boolean
  categoryId: number
  tagIds?: number[]
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  publishedAt?: string
}

// 文章更新请求类型定义
export interface ArticleUpdateRequest {
  title?: string
  slug?: string
  summary?: string
  content?: string
  coverImage?: string
  status?: ArticleStatus
  isFeatured?: boolean
  allowComments?: boolean
  categoryId?: number
  tagIds?: number[]
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  publishedAt?: string
}

// 文章列表查询参数
export interface ArticleListParams {
  page?: number
  limit?: number
  status?: ArticleStatus
  category?: number
  includeDeleted?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

import { getFullUrl } from '@/utils/url'

/**
 * 转换后端返回的文章数据（下划线 -> 驼峰）
 */
function transformArticleFromBackend(data: any): Article {
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    summary: data.summary,
    content: data.content,
    coverImage: getFullUrl(data.cover_image || data.coverImage),
    status: data.status,
    isFeatured: data.is_featured ?? data.isFeatured,
    allowComments: data.allow_comments ?? data.allowComments,
    viewCount: data.view_count ?? data.viewCount,
    authorId: data.author_id ?? data.authorId,
    categoryId: data.category_id ?? data.categoryId,
    category: data.category,
    tags: data.tags,
    seoTitle: data.seo_title || data.seoTitle,
    seoDescription: data.seo_description || data.seoDescription,
    seoKeywords: data.seo_keywords || data.seoKeywords,
    publishedAt: data.published_at || data.publishedAt,
    createdAt: data.createdAt || data.created_at,
    updatedAt: data.updatedAt || data.updated_at,
  }
}

/**
 * 文章管理 API
 */
export const articleApi = {
  /**
   * 获取文章列表
   * 支持分页、搜索、筛选
   */
  async getList(params?: ArticleListParams): Promise<PaginationResponse<ArticleListItem>> {
    const response: any = await request({
      url: '/admin/posts',
      method: 'GET',
      params,
    })

    // 转换数据
    if (response.data && Array.isArray(response.data)) {
      response.data = response.data.map((item: any) => transformArticleFromBackend(item))
    }

    return response
  },

  /**
   * 获取文章详情
   * 根据ID获取文章完整信息
   */
  async getById(id: number): Promise<ApiResponse<Article>> {
    const response: any = await request({
      url: `/admin/posts/${id}`,
      method: 'GET',
    })

    // 转换数据
    if (response.data) {
      response.data = transformArticleFromBackend(response.data)
    }

    return response
  },

  /**
   * 创建文章
   * 创建新文章，可以设置为草稿或直接发布
   */
  async create(data: ArticleCreateRequest): Promise<ApiResponse<Article>> {
    // 转换字段名：驼峰 -> 下划线
    // 后端现在返回完整 URL，前端直接传递即可
    const requestData = {
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      content: data.content,
      cover_image: data.coverImage, // 直接传递，后端会处理
      category_id: data.categoryId,
      tag_ids: data.tagIds,
      status: data.status,
      is_featured: data.isFeatured,
      allow_comments: data.allowComments,
      seo_title: data.seoTitle,
      seo_description: data.seoDescription,
      seo_keywords: data.seoKeywords,
      published_at: data.publishedAt,
    }

    const response: any = await request({
      url: '/admin/posts',
      method: 'POST',
      data: requestData,
    })

    // 转换响应数据
    if (response.data) {
      response.data = transformArticleFromBackend(response.data)
    }

    return response
  },

  /**
   * 更新文章
   * 更新指定ID的文章信息
   */
  async update(id: number, data: ArticleUpdateRequest): Promise<ApiResponse<Article>> {
    // 转换字段名：驼峰 -> 下划线
    // 后端现在返回完整 URL，前端直接传递即可
    const requestData: Record<string, any> = {}

    if (data.title !== undefined) requestData.title = data.title
    if (data.slug !== undefined) requestData.slug = data.slug
    if (data.summary !== undefined) requestData.summary = data.summary
    if (data.content !== undefined) requestData.content = data.content
    if (data.coverImage !== undefined) requestData.cover_image = data.coverImage // 直接传递
    if (data.categoryId !== undefined) requestData.category_id = data.categoryId
    if (data.tagIds !== undefined) requestData.tag_ids = data.tagIds
    if (data.status !== undefined) requestData.status = data.status
    if (data.isFeatured !== undefined) requestData.is_featured = data.isFeatured
    if (data.allowComments !== undefined) requestData.allow_comments = data.allowComments
    if (data.seoTitle !== undefined) requestData.seo_title = data.seoTitle
    if (data.seoDescription !== undefined) requestData.seo_description = data.seoDescription
    if (data.seoKeywords !== undefined) requestData.seo_keywords = data.seoKeywords
    if (data.publishedAt !== undefined) requestData.published_at = data.publishedAt

    const response: any = await request({
      url: `/admin/posts/${id}`,
      method: 'PUT',
      data: requestData,
    })

    // 转换响应数据
    if (response.data) {
      response.data = transformArticleFromBackend(response.data)
    }

    return response
  },

  /**
   * 删除文章
   * 软删除指定ID的文章（可以恢复）
   */
  delete(id: number): Promise<ApiResponse<void>> {
    return request({
      url: `/admin/posts/${id}`,
      method: 'DELETE',
    })
  },

  /**
   * 更新文章状态
   * 快速更新文章的发布状态
   */
  async updateStatus(id: number, status: ArticleStatus): Promise<ApiResponse<Article>> {
    const response: any = await request({
      url: `/admin/posts/${id}/status`,
      method: 'PATCH',
      data: { status },
    })

    // 转换响应数据
    if (response.data) {
      response.data = transformArticleFromBackend(response.data)
    }

    return response
  },

  /**
   * 恢复已删除的文章
   * 恢复指定ID的已删除文章
   */
  restore(id: number): Promise<ApiResponse<void>> {
    return request({
      url: `/admin/posts/${id}/restore`,
      method: 'POST',
    })
  },
}
