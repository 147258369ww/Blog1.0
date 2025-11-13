// 分类 API 服务

import { http } from '../http'
import type {
  ApiResponse,
  PaginatedResponse,
  Category,
  Post,
  GetCategoryPostsParams
} from '@/types'

/**
 * 分类相关 API 服务
 */
export const categoriesApi = {
  /**
   * 获取分类列表
   * GET /api/v1/categories
   */
  getCategories(): Promise<ApiResponse<Category[]>> {
    return http.get('/categories')
  },

  /**
   * 获取分类详情
   * GET /api/v1/categories/:id
   */
  getCategory(id: number): Promise<ApiResponse<Category>> {
    return http.get(`/categories/${id}`)
  },

  /**
   * 获取分类下的文章
   * GET /api/v1/categories/:id/posts
   */
  getCategoryPosts(id: number, params?: GetCategoryPostsParams): Promise<PaginatedResponse<Post>> {
    return http.get(`/categories/${id}/posts`, { params })
  }
}
