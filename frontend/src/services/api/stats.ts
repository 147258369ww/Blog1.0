// 统计数据 API 服务

import { http } from '../http'
import type { ApiResponse, Stats } from '@/types'

/**
 * 统计数据相关 API 服务
 */
export const statsApi = {
  /**
   * 获取统计数据
   * GET /api/v1/stats
   */
  getStats(): Promise<ApiResponse<Stats>> {
    return http.get('/stats')
  }
}
