// 网站配置 API 服务

import { http } from '../http'
import type { ApiResponse, SiteConfig, SEOConfig, Stats } from '@/types'

/**
 * 网站配置相关 API 服务
 */
export const settingsApi = {
  /**
   * 获取网站配置
   * GET /api/v1/settings/site
   */
  getSiteConfig(): Promise<ApiResponse<SiteConfig>> {
    return http.get('/settings/site')
  },

  /**
   * 获取 SEO 配置
   * GET /api/v1/settings/seo
   */
  getSEOConfig(): Promise<ApiResponse<SEOConfig>> {
    return http.get('/settings/seo')
  },

  /**
   * 获取统计数据
   * GET /api/v1/settings/stats
   */
  getStats(): Promise<ApiResponse<Stats>> {
    return http.get('/settings/stats')
  }
}
