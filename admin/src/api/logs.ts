import request from '../utils/request'
import type { ApiResponse, PaginationResponse } from '../types/api'

export interface AuditLog {
  id: number
  user_id?: number
  action: string
  resource_type?: string
  resource_id?: string
  status: 'success' | 'fail'
  ip?: string
  user_agent?: string
  route?: string
  method?: string
  request_id?: string
  details?: any
  created_at: string
  updated_at: string
}

export interface AuditLogListParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  userId?: number
  action?: string
  resourceType?: string
  status?: 'success' | 'fail'
  start?: string
  end?: string
}

export interface SystemLogFile {
  name: string
  size: number
  modifiedAt: string
}

export interface SystemLogContent {
  name: string
  lines: string[]
}

export const logsApi = {
  async getAuditLogs(params?: AuditLogListParams): Promise<PaginationResponse<AuditLog>> {
    const response: any = await request({
      url: '/admin/audit-logs',
      method: 'GET',
      params,
    })

    const result = response?.data || {}

    return {
      data: result.logs || [],
      total: result.total || 0,
      page: result.page || 1,
      limit: result.limit || params?.limit || 20,
      totalPages: result.totalPages || 0,
    }
  },

  async getAuditLog(id: number): Promise<ApiResponse<AuditLog>> {
    const response: any = await request({
      url: `/admin/audit-logs/${id}`,
      method: 'GET',
    })
    return response
  },

  async getSystemLogFiles(): Promise<ApiResponse<SystemLogFile[]>> {
    const response: any = await request({
      url: '/admin/logs',
      method: 'GET',
    })
    return response
  },

  async getSystemLog(name: string, lines?: number): Promise<ApiResponse<SystemLogContent>> {
    const response: any = await request({
      url: `/admin/logs/${encodeURIComponent(name)}`,
      method: 'GET',
      params: { lines },
    })
    return response
  },

  async clearSystemLog(name: string): Promise<ApiResponse<void>> {
    return request({
      url: `/admin/logs/${encodeURIComponent(name)}`,
      method: 'DELETE',
    })
  },

  buildSystemLogDownloadUrl(name: string): string {
    const base = (import.meta as any).env?.VITE_API_BASE_URL || '/api'
    return `${base}/admin/logs/${encodeURIComponent(name)}/download`
  },
}
