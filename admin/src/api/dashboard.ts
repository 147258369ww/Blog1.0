import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'

/**
 * 后端统计数据结构
 */
interface BlogStats {
  totalPosts: number
  totalTags: number
  totalViews: number
}

/**
 * 文章统计数据结构
 */
interface PostStats {
  draft: number
  published: number
  archived: number
}

/**
 * 仪表盘相关 API
 */
export const dashboardApi = {
  /**
   * 获取博客统计数据
   * 包括文章总数、标签总数、总访问量
   */
  getStats(): Promise<ApiResponse<BlogStats>> {
    return request({
      url: '/stats',
      method: 'GET',
    })
  },

  /**
   * 获取文章统计信息
   * 按状态分组统计文章数量
   */
  getPostStats(): Promise<ApiResponse<PostStats>> {
    return request({
      url: '/stats/posts',
      method: 'GET',
    })
  },

  /**
   * 增加文章浏览量
   * @param postId 文章ID
   */
  incrementPostView(postId: number): Promise<ApiResponse<void>> {
    return request({
      url: `/stats/post/${postId}/view`,
      method: 'POST',
    })
  },
}
