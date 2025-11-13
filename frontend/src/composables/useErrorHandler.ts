/**
 * 错误处理组合式函数
 * 提供友好的错误提示和重试功能
 */

import { ref } from 'vue'
import type { AxiosError } from 'axios'
import { useToast } from './useToast'
import { errorHandler, ErrorLevel } from '@/utils/errorHandler'
import { isNetworkError, isTimeoutError, isServerError } from '@/utils/retry'

/**
 * 错误类型
 */
export const ErrorType = {
  NETWORK: 'network',
  TIMEOUT: 'timeout',
  SERVER: 'server',
  CLIENT: 'client',
  UNKNOWN: 'unknown',
} as const

export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType]

/**
 * 错误信息映射
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: '网络连接失败，请检查您的网络设置',
  [ErrorType.TIMEOUT]: '请求超时，请稍后重试',
  [ErrorType.SERVER]: '服务器错误，请稍后重试',
  [ErrorType.CLIENT]: '请求失败，请检查输入信息',
  [ErrorType.UNKNOWN]: '未知错误，请稍后重试',
}

/**
 * HTTP 状态码错误消息
 */
const STATUS_MESSAGES: Record<number, string> = {
  400: '请求参数错误',
  401: '未授权，请先登录',
  403: '没有权限访问',
  404: '请求的资源不存在',
  405: '请求方法不允许',
  408: '请求超时',
  409: '请求冲突',
  422: '请求参数验证失败',
  429: '请求过于频繁，请稍后重试',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务暂时不可用',
  504: '网关超时',
}

/**
 * 错误处理组合式函数
 */
export function useErrorHandler() {
  const toast = useToast()
  const isRetrying = ref(false)
  const retryCount = ref(0)
  const maxRetries = 3

  /**
   * 获取错误类型
   */
  const getErrorType = (error: AxiosError): ErrorType => {
    if (isNetworkError(error)) {
      return ErrorType.NETWORK
    }
    if (isTimeoutError(error)) {
      return ErrorType.TIMEOUT
    }
    if (isServerError(error)) {
      return ErrorType.SERVER
    }
    if (error.response && error.response.status >= 400 && error.response.status < 500) {
      return ErrorType.CLIENT
    }
    return ErrorType.UNKNOWN
  }

  /**
   * 获取友好的错误消息
   */
  const getErrorMessage = (error: AxiosError): string => {
    // 优先使用服务器返回的错误消息
    if (error.response?.data) {
      const data = error.response.data as { message?: string; error?: string }
      if (data.message) return data.message
      if (data.error) return data.error
    }

    // 使用状态码对应的消息
    if (error.response?.status) {
      const statusMessage = STATUS_MESSAGES[error.response.status]
      if (statusMessage) return statusMessage
    }

    // 使用错误类型对应的消息
    const errorType = getErrorType(error)
    return ERROR_MESSAGES[errorType]
  }

  /**
   * 处理错误
   */
  const handleError = (error: unknown, showToast = true): string => {
    const axiosError = error as AxiosError
    const message = getErrorMessage(axiosError)
    const errorType = getErrorType(axiosError)

    // 记录错误日志
    errorHandler.log(axiosError, ErrorLevel.ERROR, {
      type: errorType,
      url: axiosError.config?.url,
      method: axiosError.config?.method,
      status: axiosError.response?.status,
    })

    // 显示错误提示
    if (showToast) {
      toast.error(message)
    }

    return message
  }

  /**
   * 处理错误并提供重试选项
   */
  const handleErrorWithRetry = async (
    error: unknown,
    retryFn: () => Promise<unknown>
  ): Promise<{ success: boolean; data?: unknown; error?: string }> => {
    const axiosError = error as AxiosError
    const errorType = getErrorType(axiosError)
    const message = getErrorMessage(axiosError)

    // 记录错误日志
    errorHandler.log(axiosError, ErrorLevel.ERROR, {
      type: errorType,
      url: axiosError.config?.url,
      method: axiosError.config?.method,
      status: axiosError.response?.status,
      retryCount: retryCount.value,
    })

    // 判断是否可以重试
    const canRetry =
      (errorType === ErrorType.NETWORK ||
        errorType === ErrorType.TIMEOUT ||
        errorType === ErrorType.SERVER) &&
      retryCount.value < maxRetries

    if (canRetry) {
      // 显示重试提示
      toast.warning(`${message}，正在重试...`)
      isRetrying.value = true
      retryCount.value++

      try {
        // 延迟后重试
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount.value))
        const result = await retryFn()
        
        // 重试成功
        isRetrying.value = false
        retryCount.value = 0
        toast.success('操作成功')
        
        return { success: true, data: result }
      } catch (retryError) {
        // 重试失败，递归处理
        return handleErrorWithRetry(retryError, retryFn)
      }
    } else {
      // 无法重试或达到最大重试次数
      isRetrying.value = false
      retryCount.value = 0
      toast.error(message)
      
      return { success: false, error: message }
    }
  }

  /**
   * 包装异步函数，自动处理错误
   */
  const withErrorHandling = async <T>(
    fn: () => Promise<T>,
    options: {
      showToast?: boolean
      onError?: (error: unknown) => void
    } = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    const { showToast = true, onError } = options

    try {
      const data = await fn()
      return { success: true, data }
    } catch (error) {
      const message = handleError(error, showToast)
      
      if (onError) {
        onError(error)
      }
      
      return { success: false, error: message }
    }
  }

  /**
   * 重置重试状态
   */
  const resetRetry = () => {
    isRetrying.value = false
    retryCount.value = 0
  }

  return {
    isRetrying,
    retryCount,
    maxRetries,
    handleError,
    handleErrorWithRetry,
    withErrorHandling,
    getErrorMessage,
    getErrorType,
    resetRetry,
  }
}
