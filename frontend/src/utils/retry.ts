/**
 * 网络请求重试工具
 * 提供自动重试、指数退避等功能
 */

import type { AxiosError, AxiosRequestConfig } from 'axios'
import { errorHandler, ErrorLevel } from './errorHandler'

/**
 * 重试配置接口
 */
export interface RetryConfig {
  /** 最大重试次数 */
  maxRetries?: number
  /** 初始延迟时间(毫秒) */
  initialDelay?: number
  /** 最大延迟时间(毫秒) */
  maxDelay?: number
  /** 退避倍数 */
  backoffMultiplier?: number
  /** 是否应该重试的判断函数 */
  shouldRetry?: (error: AxiosError) => boolean
  /** 重试前的回调 */
  onRetry?: (error: AxiosError, retryCount: number) => void
}

/**
 * 默认重试配置
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  shouldRetry: (error: AxiosError) => {
    // 只重试网络错误和 5xx 服务器错误
    if (!error.response) {
      return true // 网络错误
    }
    const status = error.response.status
    return status >= 500 && status < 600 // 5xx 错误
  },
  onRetry: () => {},
}

/**
 * 计算延迟时间(指数退避)
 */
function calculateDelay(retryCount: number, config: Required<RetryConfig>): number {
  const delay = config.initialDelay * Math.pow(config.backoffMultiplier, retryCount - 1)
  return Math.min(delay, config.maxDelay)
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 重试包装器
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  let lastError: Error | null = null
  let retryCount = 0

  while (retryCount <= retryConfig.maxRetries) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      const axiosError = error as AxiosError

      // 检查是否应该重试
      if (retryCount >= retryConfig.maxRetries || !retryConfig.shouldRetry(axiosError)) {
        break
      }

      retryCount++

      // 记录重试日志
      errorHandler.log(
        `网络请求失败，正在进行第 ${retryCount} 次重试...`,
        ErrorLevel.WARNING,
        {
          url: axiosError.config?.url,
          method: axiosError.config?.method,
          status: axiosError.response?.status,
        }
      )

      // 调用重试回调
      retryConfig.onRetry(axiosError, retryCount)

      // 等待延迟时间
      const delayTime = calculateDelay(retryCount, retryConfig)
      await delay(delayTime)
    }
  }

  // 所有重试都失败，抛出最后一个错误
  throw lastError
}

/**
 * Axios 请求配置扩展(用于在拦截器中识别重试配置)
 */
declare module 'axios' {
  export interface AxiosRequestConfig {
    retry?: RetryConfig
    __retryCount?: number
  }
  export interface InternalAxiosRequestConfig {
    __retryCount?: number
  }
}

/**
 * 为 Axios 请求添加重试功能
 */
export function createRetryInterceptor() {
  return {
    onFulfilled: (config: AxiosRequestConfig) => config,
    onRejected: async (error: AxiosError) => {
      const config = error.config
      if (!config) {
        return Promise.reject(error)
      }

      // 获取重试配置
      const retryConfig = config.retry || {}
      const mergedConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig }

      // 初始化重试计数
      if (!config.__retryCount) {
        config.__retryCount = 0
      }

      const retryCount = config.__retryCount

      // 检查是否应该重试
      if (retryCount >= mergedConfig.maxRetries || !mergedConfig.shouldRetry(error)) {
        return Promise.reject(error)
      }

      // 增加重试计数
      config.__retryCount = retryCount + 1

      // 记录重试日志
      errorHandler.log(
        `网络请求失败，正在进行第 ${retryCount + 1} 次重试...`,
        ErrorLevel.WARNING,
        {
          url: config.url,
          method: config.method,
          status: error.response?.status,
        }
      )

      // 调用重试回调
      mergedConfig.onRetry(error, retryCount + 1)

      // 等待延迟时间
      const delayTime = calculateDelay(retryCount + 1, mergedConfig)
      await delay(delayTime)

      // 重试请求
      return Promise.resolve(config)
    },
  }
}

/**
 * 判断错误是否为网络错误
 */
export function isNetworkError(error: AxiosError): boolean {
  return !error.response && error.code !== 'ECONNABORTED'
}

/**
 * 判断错误是否为超时错误
 */
export function isTimeoutError(error: AxiosError): boolean {
  return error.code === 'ECONNABORTED' || error.message.includes('timeout')
}

/**
 * 判断错误是否为服务器错误
 */
export function isServerError(error: AxiosError): boolean {
  return !!error.response && error.response.status >= 500 && error.response.status < 600
}

/**
 * 判断错误是否可重试
 */
export function isRetryableError(error: AxiosError): boolean {
  return isNetworkError(error) || isTimeoutError(error) || isServerError(error)
}
