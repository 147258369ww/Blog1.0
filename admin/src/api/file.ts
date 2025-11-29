import request from '@/utils/request'
import type {
  ApiResponse,
  PaginationResponse,
  BackendPaginationResponse,
  FileUploadResponse,
} from '@/types/api'
import type { File as FileModel } from '@/types/models'

/**
 * 文件列表查询参数
 */
export interface FileListParams {
  page?: number
  limit?: number
  type?: string
  search?: string
}

/**
 * 文件管理 API
 */
export const fileApi = {
  /**
   * 获取文件列表
   * 支持分页、类型筛选和搜索
   */
  async getList(params?: FileListParams): Promise<PaginationResponse<FileModel>> {
    const response = (await request({
      url: '/admin/files',
      method: 'GET',
      params,
    })) as BackendPaginationResponse<FileModel>

    // 转换后端响应格式为前端期望的格式
    return {
      data: response.data,
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages,
    }
  },

  /**
   * 上传文件
   * @param file 要上传的文件
   * @param fileType 文件类型 (image | file)
   */
  upload(
    file: File,
    fileType: 'image' | 'file' = 'image'
  ): Promise<ApiResponse<FileUploadResponse>> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileType', fileType)

    return request({
      url: '/admin/files/upload',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * 删除文件
   * 删除指定ID的文件
   */
  delete(id: number): Promise<ApiResponse<void>> {
    return request({
      url: `/admin/files/${id}`,
      method: 'DELETE',
    })
  },
}
