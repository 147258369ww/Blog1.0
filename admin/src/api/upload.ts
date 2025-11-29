import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'

/**
 * 文件上传 API
 */
export const uploadApi = {
  /**
   * 上传文件
   * @param file 要上传的文件
   * @param fileType 文件类型 (image | file)
   */
  uploadFile(file: File, fileType: 'image' | 'file' = 'image'): Promise<ApiResponse<any>> {
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
}
