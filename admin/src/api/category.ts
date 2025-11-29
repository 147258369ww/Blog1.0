import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { Category } from '@/types/models'

/**
 * 分类创建请求类型定义
 */
export interface CategoryCreateRequest {
  name: string
  slug?: string
  parentId?: number
  description?: string
  sort?: number
}

/**
 * 分类更新请求类型定义
 */
export interface CategoryUpdateRequest {
  name?: string
  slug?: string
  parentId?: number
  description?: string
  sort?: number
}

/**
 * 分类排序更新请求类型定义
 */
export interface CategorySortUpdateRequest {
  id: number
  sort: number
}

/**
 * 分类管理 API
 */
export const categoryApi = {
  /**
   * 获取分类列表（扁平化）
   * 返回所有分类的扁平列表，用于下拉选择等场景
   */
  getList(): Promise<ApiResponse<Category[]>> {
    return request({
      url: '/admin/categories',
      method: 'GET',
    })
  },

  /**
   * 获取分类树
   * 返回包含层级结构的完整分类树
   */
  getTree(): Promise<ApiResponse<Category[]>> {
    return request({
      url: '/admin/categories/tree',
      method: 'GET',
    })
  },

  /**
   * 创建分类
   * 创建新分类，可以指定父分类以支持层级分类
   */
  create(data: CategoryCreateRequest): Promise<ApiResponse<Category>> {
    return request({
      url: '/admin/categories',
      method: 'POST',
      data,
    })
  },

  /**
   * 更新分类
   * 更新指定ID的分类信息
   */
  update(id: number, data: CategoryUpdateRequest): Promise<ApiResponse<Category>> {
    return request({
      url: `/admin/categories/${id}`,
      method: 'PUT',
      data,
    })
  },

  /**
   * 删除分类
   * 删除指定ID的分类（需要检查是否有文章使用该分类）
   */
  delete(id: number): Promise<ApiResponse<void>> {
    return request({
      url: `/admin/categories/${id}`,
      method: 'DELETE',
    })
  },

  /**
   * 更新分类排序
   * 批量更新分类的排序权重
   */
  updateSort(data: CategorySortUpdateRequest[]): Promise<ApiResponse<void>> {
    return request({
      url: '/admin/categories/sort',
      method: 'PUT',
      data,
    })
  },
}
