/**
 * HTTP 请求封装
 *
 * 功能特性:
 * 1. 基于 Axios 创建的 HTTP 客户端实例
 * 2. 自动添加 Authorization 头（从 auth store 获取 token）
 * 3. 统一的错误处理和用户提示
 * 4. 自动 Token 刷新机制（401 错误时）
 * 5. 请求队列管理（刷新 token 期间的请求）
 *
 * 使用示例:
 * ```typescript
 * import request from '@/utils/request'
 *
 * // GET 请求
 * const data = await request({ url: '/api/users', method: 'GET' })
 *
 * // POST 请求
 * const result = await request({
 *   url: '/api/users',
 *   method: 'POST',
 *   data: { name: 'John' }
 * })
 * ```
 *
 * @module utils/request
 */

import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'
import type { ApiResponse } from '@/types/api'
import { showError, showTokenExpired } from './message'
import { storage } from './storage'

/**
 * 创建 Axios 实例
 * - baseURL: 从环境变量读取 API 基础地址
 * - timeout: 请求超时时间 30 秒
 * - headers: 默认 Content-Type 为 application/json
 */
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 是否正在刷新 token
let isRefreshing = false
// 待重试的请求队列
let requestQueue: Array<(_token: string) => void> = []

/**
 * 刷新访问令牌
 */
const refreshAccessToken = async (): Promise<string> => {
  const authStore = useAuthStore()
  const refreshToken = authStore.refreshToken

  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await axios.post<ApiResponse<{ accessToken: string }>>(
    `${import.meta.env.VITE_API_BASE_URL}/admin/auth/refresh`,
    { refreshToken }
  )

  const newAccessToken = response.data.data?.accessToken

  if (!newAccessToken) {
    throw new Error('Failed to refresh token')
  }

  authStore.setToken(newAccessToken)

  return newAccessToken
}

/**
 * 请求拦截器
 * 在请求发送前添加 Authorization 头和其他安全头
 */
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore()
    const token = authStore.token

    // 如果存在 token，添加到请求头
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加安全相关的请求头
    if (config.headers) {
      // 防止 MIME 类型嗅探
      config.headers['X-Content-Type-Options'] = 'nosniff'
      // 添加请求时间戳（可用于防重放攻击）
      config.headers['X-Request-Time'] = Date.now().toString()
    }

    return config
  },
  (error: AxiosError) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

/**
 * 清理认证信息并跳转到登录页
 * 使用防抖机制，确保只执行一次
 */
const clearAuthAndRedirect = (() => {
  let isClearing = false

  return async () => {
    // 如果正在清理或已经在登录页，直接返回
    if (isClearing || router.currentRoute.value.path === '/login') {
      return
    }

    isClearing = true

    try {
      const authStore = useAuthStore()
      const currentPath = router.currentRoute.value.fullPath

      // 清除本地认证信息
      authStore.token = null
      authStore.refreshToken = null
      authStore.user = null
      storage.remove('token')
      storage.remove('refreshToken')
      storage.remove('user')

      // 显示提示
      showTokenExpired()

      // 跳转到登录页
      if (currentPath !== '/login') {
        await router.push({
          path: '/login',
          query: { redirect: currentPath },
        })
      }
    } finally {
      // 延迟重置标志，避免快速重复调用
      setTimeout(() => {
        isClearing = false
      }, 1000)
    }
  }
})()

/**
 * 响应拦截器
 * 统一处理响应和错误
 */
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 直接返回响应数据
    return response.data
  },
  async (error: AxiosError<ApiResponse>) => {
    const { config, response } = error

    // 处理 401 错误（Token 过期）
    if (response?.status === 401 && config) {
      // 检查是否是 logout 请求，如果是则直接拒绝，不进行重试
      if (config.url?.includes('/auth/logout')) {
        return Promise.reject(error)
      }

      // 如果正在刷新 token，将请求加入队列
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          requestQueue.push((token: string) => {
            if (!token) {
              // token 刷新失败，拒绝请求
              reject(error)
              return
            }
            if (config.headers) {
              config.headers.Authorization = `Bearer ${token}`
            }
            resolve(request(config))
          })
        })
      }

      // 开始刷新 token
      isRefreshing = true

      try {
        const newToken = await refreshAccessToken()

        // 重试队列中的所有请求
        requestQueue.forEach(callback => callback(newToken))
        requestQueue = []

        // 重试当前请求
        if (config.headers) {
          config.headers.Authorization = `Bearer ${newToken}`
        }
        return request(config)
      } catch (refreshError) {
        // 刷新失败，拒绝队列中的所有请求
        requestQueue.forEach(callback => callback(''))
        requestQueue = []

        // 清理认证信息并跳转
        await clearAuthAndRedirect()

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // 处理其他 HTTP 错误
    handleHttpError(error)
    return Promise.reject(error)
  }
)

/**
 * 处理 HTTP 错误
 * 根据不同的错误状态码显示相应的错误提示
 *
 * @param error - Axios 错误对象
 */
const handleHttpError = (error: AxiosError<ApiResponse>) => {
  const { response } = error

  if (response) {
    // 服务器返回错误响应
    const { status, data } = response

    switch (status) {
      case 400:
        // 请求参数错误
        showError(data.message || data.error || '请求参数错误')
        break

      case 401:
        // 未授权（已在上面的拦截器中处理 Token 刷新）
        // 这里不再重复处理，避免重复跳转
        // 401 错误已经在响应拦截器中统一处理了
        break

      case 403:
        // 禁止访问
        showError(data.message || '没有权限访问该资源')
        break

      case 404:
        // 资源不存在
        showError(data.message || '请求的资源不存在')
        break

      case 422:
        // 验证错误（表单验证失败）
        handleValidationError(data)
        break

      case 429:
        {
          const headerVal =
            response.headers?.['retry-after'] ||
            response.headers?.['ratelimit-reset'] ||
            response.headers?.['x-ratelimit-reset']

          let retryAfterSec = 30
          if (typeof headerVal === 'string') {
            const n = Number(headerVal)
            if (Number.isFinite(n) && n > 0) {
              retryAfterSec = n
            } else {
              const dateMs = Date.parse(headerVal)
              if (!Number.isNaN(dateMs)) {
                const diff = Math.ceil((dateMs - Date.now()) / 1000)
                if (diff > 0) retryAfterSec = diff
              }
            }
          }

          showError(`请求过于频繁，请${retryAfterSec}秒后再试`)

          const method = error.config?.method?.toUpperCase()
          if (method && ['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            const configToRetry = error.config
            setTimeout(() => {
              if (configToRetry) {
                request(configToRetry)
              }
            }, retryAfterSec * 1000)
          }
        }
        break

      case 500:
        // 服务器内部错误
        showError(data.message || '服务器错误，请稍后重试')
        break

      case 502:
        // 网关错误
        showError('网关错误，请稍后重试')
        break

      case 503:
        // 服务不可用
        showError('服务暂时不可用，请稍后重试')
        break

      case 504:
        // 网关超时
        showError('请求超时，请稍后重试')
        break

      default:
        // 其他错误
        showError(data.message || data.error || `请求失败 (${status})`)
    }
  } else if (error.request) {
    // 请求已发送但没有收到响应（网络错误）
    if (error.code === 'ECONNABORTED') {
      showError('请求超时，请检查网络连接')
    } else if (error.code === 'ERR_NETWORK') {
      showError('网络连接失败，请检查网络设置')
    } else {
      showError('网络连接失败，请检查网络设置')
    }
  } else {
    // 请求配置错误
    showError(error.message || '请求配置错误')
  }
}

/**
 * 处理表单验证错误
 * 422 状态码通常表示表单验证失败
 *
 * @param data - 响应数据
 */
const handleValidationError = (data: ApiResponse) => {
  if (data.error && typeof data.error === 'object') {
    // 错误是对象形式，包含多个字段的验证错误
    const errors = data.error as Record<string, string | string[]>
    const errorMessages: string[] = []

    Object.entries(errors).forEach(([, messages]) => {
      if (Array.isArray(messages)) {
        errorMessages.push(...messages)
      } else {
        errorMessages.push(messages)
      }
    })

    // 显示第一个验证错误
    if (errorMessages.length > 0 && errorMessages[0]) {
      showError(errorMessages[0])
    } else {
      showError('表单验证失败，请检查输入')
    }
  } else if (data.error && typeof data.error === 'string') {
    // 错误是字符串形式
    showError(data.error)
  } else if (data.message) {
    // 使用 message 字段
    showError(data.message)
  } else {
    // 默认错误消息
    showError('表单验证失败，请检查输入')
  }
}

export default request
