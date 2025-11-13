// 标签 API 服务

import { http } from '../http'
import type {
  ApiResponse,
  PaginatedResponse,
  Tag,
  Post,
  SearchTagsParams,
  GetTagPostsParams
} from '@/types'

/**
 * 标签相关 API 服务
 */
export const tagsApi = {
  /**
   * 获取标签列表
   * GET /api/v1/tags
   */
  getTags(): Promise<ApiResponse<Tag[]>> {
    return http.get('/tags')
  },

  /**
   * 获取单个标签详情
   * GET /api/v1/tags/:id
   */
  getTag(id: number): Promise<ApiResponse<Tag>> {
    return http.get(`/tags/${id}`)
  },

  /**
   * 搜索标签
   * GET /api/v1/tags/search
   */
  searchTags(params: SearchTagsParams): Promise<ApiResponse<Tag[]>> {
    return http.get('/tags/search', { params })
  },

  /**
   * 获取标签下的文章
   * GET /api/v1/tags/:id/posts
   */
  getTagPosts(id: number, params?: GetTagPostsParams): Promise<PaginatedResponse<Post>> {
    return http.get(`/tags/${id}/posts`, { params })
  }
}
