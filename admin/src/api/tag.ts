import request from '@/utils/request'
import type { ApiResponse, PaginationResponse } from '@/types/api'
import type { Tag } from '@/types/models'

/**
 * 标签列表查询参数
 */
export interface TagListParams {
  page?: number
  limit?: number
  search?: string
}

/**
 * 标签创建请求类型定义
 */
export interface TagCreateRequest {
  name: string
  slug?: string
  color?: string
  description?: string
}

/**
 * 标签更新请求类型定义
 */
export interface TagUpdateRequest {
  name?: string
  slug?: string
  color?: string
  description?: string
}

/**
 * 标签管理 API
 */
export const tagApi = {
  /**
   * 获取标签列表
   * 支持分页和搜索
   */
  getList(params?: TagListParams): Promise<PaginationResponse<Tag>> {
    return request({
      url: '/admin/tags',
      method: 'GET',
      params,
    })
  },

  /**
   * 创建标签
   * 创建新标签，名称必须唯一
   */
  create(data: TagCreateRequest): Promise<ApiResponse<Tag>> {
    return request({
      url: '/admin/tags',
      method: 'POST',
      data,
    })
  },

  /**
   * 更新标签
   * 更新指定ID的标签信息
   */
  update(id: number, data: TagUpdateRequest): Promise<ApiResponse<Tag>> {
    return request({
      url: `/admin/tags/${id}`,
      method: 'PUT',
      data,
    })
  },

  /**
   * 删除标签
   * 删除指定ID的标签（需要检查是否有文章使用该标签）
   */
  delete(id: number): Promise<ApiResponse<void>> {
    return request({
      url: `/admin/tags/${id}`,
      method: 'DELETE',
    })
  },
}
