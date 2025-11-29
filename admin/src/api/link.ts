import request from '@/utils/request'
import type { ApiResponse, PaginationResponse } from '@/types/api'
import type { Link } from '@/types/models'

/**
 * 友情链接列表查询参数
 */
export interface LinkListParams {
  page?: number
  limit?: number
}

/**
 * 友情链接创建请求类型定义
 */
export interface LinkCreateRequest {
  name: string
  url: string
  logo?: string
  description?: string
}

/**
 * 友情链接更新请求类型定义
 */
export interface LinkUpdateRequest {
  name?: string
  url?: string
  logo?: string
  description?: string
}

/**
 * 友情链接排序更新请求类型定义
 */
export interface LinkSortUpdateRequest {
  id: number
  sort: number
}

/**
 * 友情链接管理 API
 */
export const linkApi = {
  /**
   * 获取友情链接列表
   * 支持分页
   */
  getList(params?: LinkListParams): Promise<PaginationResponse<Link>> {
    return request({
      url: '/admin/links',
      method: 'GET',
      params,
    })
  },

  /**
   * 创建友情链接
   * 创建新的友情链接
   */
  create(data: LinkCreateRequest): Promise<ApiResponse<Link>> {
    return request({
      url: '/admin/links',
      method: 'POST',
      data,
    })
  },

  /**
   * 更新友情链接
   * 更新指定ID的友情链接信息
   */
  update(id: number, data: LinkUpdateRequest): Promise<ApiResponse<Link>> {
    return request({
      url: `/admin/links/${id}`,
      method: 'PUT',
      data,
    })
  },

  /**
   * 删除友情链接
   * 删除指定ID的友情链接
   */
  delete(id: number): Promise<ApiResponse<void>> {
    return request({
      url: `/admin/links/${id}`,
      method: 'DELETE',
    })
  },

  /**
   * 更新友情链接排序
   * 批量更新友情链接的排序权重
   */
  updateSort(data: LinkSortUpdateRequest[]): Promise<ApiResponse<void>> {
    return request({
      url: '/admin/links/sort',
      method: 'PUT',
      data,
    })
  },
}
