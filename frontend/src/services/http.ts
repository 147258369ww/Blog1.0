import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { errorHandler, ErrorLevel } from '@/utils/errorHandler'
import { isRetryableError } from '@/utils/retry'
import { cacheManager } from '@/utils/cache'

// 扩展 Axios 配置类型以支持重试计数
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  __retryCount?: number
}

/**
 * HTTP 客户端类
 * 封装 Axios 实例，提供统一的请求方法和拦截器
 */
class HttpClient {
  private instance: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: unknown) => void
    reject: (reason?: unknown) => void
  }> = []
  private retryConfig = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  }

  constructor() {
    // 子任务 3.1: 实现 Axios 基础配置
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors() {
    // 子任务 3.2: 实现请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        const authStore = useAuthStore()
        // 自动添加 JWT 访问令牌到 Authorization 请求头
        if (authStore.accessToken) {
          config.headers.Authorization = `Bearer ${authStore.accessToken}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 子任务 3.3: 实现响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 自动解析响应数据并提取 data 字段，并转换字段名
        const data = response.data
        if (data && typeof data === 'object') {
          return this.convertKeysToCamelCase(data)
        }
        return data
      },
      async (error: AxiosError) => {
        const authStore = useAuthStore()
        const toast = useToast()

        // 记录错误日志
        errorHandler.log(error, ErrorLevel.ERROR, {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
        })

        // 实现网络请求失败重试
        if (isRetryableError(error) && this.shouldRetry(error)) {
          return this.retryRequest(error)
        }

        // 处理 401 错误并自动刷新令牌
        if (error.response?.status === 401 && authStore.refreshToken) {
          const originalRequest = error.config

          if (!originalRequest) {
            return Promise.reject(error)
          }

          // 如果正在刷新令牌，将请求加入队列
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            })
              .then(() => {
                return this.instance.request(originalRequest)
              })
              .catch((err) => {
                return Promise.reject(err)
              })
          }

          this.isRefreshing = true

          try {
            // 调用刷新令牌接口
            const response = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
              {
                refreshToken: authStore.refreshToken,
              }
            )

            const { accessToken, refreshToken } = response.data.data

            // 更新令牌
            authStore.setTokens(accessToken, refreshToken)

            // 处理队列中的请求
            this.failedQueue.forEach((promise) => {
              promise.resolve()
            })
            this.failedQueue = []

            // 重试原请求
            return this.instance.request(originalRequest)
          } catch (refreshError) {
            // 刷新令牌失败，清除认证信息并跳转到登录页
            this.failedQueue.forEach((promise) => {
              promise.reject(refreshError)
            })
            this.failedQueue = []

            authStore.logout()
            toast.error('登录已过期，请重新登录')

            // 跳转到登录页
            if (window.location.pathname !== '/login') {
              window.location.href = '/login'
            }

            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        // 实现统一错误处理和 Toast 通知
        const message = this.getErrorMessage(error)
        if (error.response?.status === 429) {
          toast.warning(message, 5000)
        } else {
          toast.error(message)
        }

        return Promise.reject(error)
      }
    )
  }

  /**
   * 将对象的键从 snake_case 转换为 camelCase
   */
  private convertKeysToCamelCase(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.convertKeysToCamelCase(item))
    }

    if (typeof obj === 'object' && obj.constructor === Object) {
      const converted: any = {}
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
          converted[camelKey] = this.convertKeysToCamelCase(obj[key])
        }
      }
      return converted
    }

    return obj
  }

  /**
   * 获取错误消息
   */
  private getErrorMessage(error: AxiosError): string {
    if (error.response) {
      const prod = import.meta.env.PROD
      const data = error.response.data as { error?: { message?: string } }
      if (error.response.status === 429) {
        const headers = error.response.headers || {}
        const retryAfter = (headers['retry-after'] as string | undefined) || undefined
        let waitSeconds = 0
        if (retryAfter) {
          const n = Number(retryAfter)
          if (!Number.isNaN(n)) {
            waitSeconds = Math.max(0, Math.round(n))
          } else {
            const target = Date.parse(retryAfter)
            if (!Number.isNaN(target)) {
              waitSeconds = Math.max(0, Math.round((target - Date.now()) / 1000))
            }
          }
        }
        if (!waitSeconds) {
          const resetHeader = headers['x-ratelimit-reset'] as string | undefined
          if (resetHeader) {
            const reset = Number(resetHeader)
            if (!Number.isNaN(reset)) {
              const resetMs = reset > 10000000000 ? reset : reset * 1000
              const delta = resetMs - Date.now()
              waitSeconds = Math.max(0, Math.round(delta / 1000))
            }
          }
        }
        if (!waitSeconds) {
          const body = error.response.data as any
          const bodyWait = body?.retryAfter ?? body?.data?.retryAfter ?? body?.waitSeconds
          if (typeof bodyWait === 'number') {
            waitSeconds = Math.max(0, Math.round(bodyWait))
          }
        }
        if (!waitSeconds) {
          waitSeconds = 30
        }
        return `请求过于频繁，请在 ${waitSeconds} 秒后再试`
      }
      if (prod) {
        return '请求失败，请稍后重试'
      }
      return data?.error?.message || `请求失败: ${error.response.status}`
    } else if (error.request) {
      // 请求已发送但没有收到响应
      return '网络错误，请检查您的网络连接'
    } else {
      // 请求配置出错
      return error.message || '请求失败'
    }
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(error: AxiosError): boolean {
    const config = error.config as ExtendedAxiosRequestConfig | undefined
    if (!config) return false

    // 初始化重试计数
    if (!config.__retryCount) {
      config.__retryCount = 0
    }

    const retryCount = config.__retryCount
    return retryCount < this.retryConfig.maxRetries
  }

  /**
   * 重试请求
   */
  private async retryRequest(error: AxiosError): Promise<unknown> {
    const config = error.config as ExtendedAxiosRequestConfig | undefined
    if (!config) {
      return Promise.reject(error)
    }

    // 增加重试计数
    const retryCount = config.__retryCount || 0
    config.__retryCount = retryCount + 1

    // 计算延迟时间(指数退避)
    const delay =
      this.retryConfig.initialDelay *
      Math.pow(this.retryConfig.backoffMultiplier, retryCount)
    const delayTime = Math.min(delay, this.retryConfig.maxDelay)

    // 记录重试日志
    errorHandler.log(
      `网络请求失败，将在 ${delayTime}ms 后进行第 ${retryCount + 1} 次重试...`,
      ErrorLevel.WARNING,
      {
        url: config.url,
        method: config.method,
        retryCount: retryCount + 1,
      }
    )

    // 等待延迟时间
    await new Promise((resolve) => setTimeout(resolve, delayTime))

    // 重试请求
    return this.instance.request(config)
  }

  /**
   * GET 请求
   */
  public get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const ttl = this.getTTLForUrl(url)
    if (ttl > 0) {
      const key = this.buildCacheKey(url, config)
      const cached = cacheManager.get<T>(key)
      if (cached !== null) {
        return Promise.resolve(cached)
      }
      return (this.instance.get<T>(url, config) as unknown as Promise<T>).then((data: T) => {
        cacheManager.set<T>(key, data, ttl)
        return data
      })
    }
    return this.instance.get(url, config) as unknown as Promise<T>
  }

  /**
   * POST 请求
   */
  public post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config)
  }

  /**
   * PUT 请求
   */
  public put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config)
  }

  /**
   * DELETE 请求
   */
  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config)
  }

  /**
   * PATCH 请求
   */
  public patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.patch(url, data, config)
  }

  private buildCacheKey(url: string, config?: AxiosRequestConfig): string {
    const base = import.meta.env.VITE_API_BASE_URL || ''
    const params = config?.params ? JSON.stringify(config.params) : ''
    return `${base}|${url}|${params}`
  }

  private getTTLForUrl(url: string): number {
    const idx = url.indexOf('?')
    const u = idx === -1 ? url : url.slice(0, idx)
    if (u.startsWith('/tags') || u.startsWith('/categories') || u.startsWith('/links') || u.startsWith('/settings')) {
      return 5 * 60 * 1000
    }
    if (u.startsWith('/posts/search') || u.startsWith('/posts') || u.startsWith('/stats')) {
      return 60 * 1000
    }
    return 0
  }
}

// 导出 HTTP 客户端实例
export const http = new HttpClient()

// 默认导出（保持向后兼容）
export default http
