// 文章 API 服务

import { http } from '../http'
import type {
  ApiResponse,
  PaginatedResponse,
  Post,
  GetPostsParams,
  SearchRequest
} from '@/types'

/**
 * 文章相关 API 服务
 */
export const postsApi = {
  /**
   * 获取文章列表
   * GET /api/v1/posts
   */
  getPosts(params?: GetPostsParams): Promise<PaginatedResponse<Post>> {
    return http.get('/posts', { params })
  },

  /**
   * 获取文章详情
   * GET /api/v1/posts/:id
   */
  getPost(id: number): Promise<ApiResponse<Post>> {
    return http.get(`/posts/${id}`)
  },

  /**
   * 搜索文章
   * GET /api/v1/posts/search
   */
  searchPosts(params: SearchRequest): Promise<PaginatedResponse<Post>> {
    return http.get('/posts/search', { params })
  },

  /**
   * 增加文章浏览量
   * POST /api/v1/stats/post/:id/view
   */
  incrementViewCount(id: number): Promise<ApiResponse<void>> {
    return http.post(`/stats/post/${id}/view`)
  }
}
