// 友情链接 API 服务

import { http } from '../http'
import type { ApiResponse, Link } from '@/types'

/**
 * 友情链接相关 API 服务
 */
export const linksApi = {
  /**
   * 获取友链列表
   * GET /api/v1/links
   */
  getLinks(): Promise<ApiResponse<Link[]>> {
    return http.get('/links')
  }
}
