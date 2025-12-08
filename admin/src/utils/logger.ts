/**
 * 日志工具
 * 提供安全的日志记录功能，自动过滤敏感信息
 */

import { loggingConfig } from '@/config/security'
import { sanitizeObject } from '@/utils/security'

/**
 * 日志级别
 */
const LOG_LEVEL = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const
type LogLevel = (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL]

/**
 * 日志级别映射
 */
const logLevelMap: Record<string, LogLevel> = {
  debug: LOG_LEVEL.DEBUG,
  info: LOG_LEVEL.INFO,
  warn: LOG_LEVEL.WARN,
  error: LOG_LEVEL.ERROR,
}

/**
 * 日志记录器类
 */
class Logger {
  private level: LogLevel
  private enabled: boolean

  constructor() {
    this.level = logLevelMap[loggingConfig.level] || LOG_LEVEL.INFO
    this.enabled = loggingConfig.enabled
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel | string) {
    if (typeof level === 'string') {
      this.level = logLevelMap[level] || LOG_LEVEL.INFO
    } else {
      this.level = level
    }
  }

  /**
   * 启用或禁用日志
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  /**
   * 清理日志数据，移除敏感信息
   */
  private sanitizeData(data: any): any {
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      return sanitizeObject(data, loggingConfig.sensitiveFields)
    }
    return data
  }

  /**
   * 格式化日志消息
   */
  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const sanitizedData = data ? this.sanitizeData(data) : undefined
    const dataStr = sanitizedData ? `\n${JSON.stringify(sanitizedData, null, 2)}` : ''
    return `[${timestamp}] [${level}] ${message}${dataStr}`
  }

  /**
   * 调试日志
   */
  debug(message: string, data?: any) {
    if (!this.enabled || this.level > LOG_LEVEL.DEBUG) {
      return
    }
    console.debug(this.formatMessage('DEBUG', message, data))
  }

  /**
   * 信息日志
   */
  info(message: string, data?: any) {
    if (!this.enabled || this.level > LOG_LEVEL.INFO) {
      return
    }
    console.info(this.formatMessage('INFO', message, data))
  }

  /**
   * 警告日志
   */
  warn(message: string, data?: any) {
    if (!this.enabled || this.level > LOG_LEVEL.WARN) {
      return
    }
    console.warn(this.formatMessage('WARN', message, data))
  }

  /**
   * 错误日志
   */
  error(message: string, error?: any) {
    if (!this.enabled || this.level > LOG_LEVEL.ERROR) {
      return
    }
    const errorData =
      error instanceof Error ? { message: error.message, stack: error.stack } : error
    console.error(this.formatMessage('ERROR', message, errorData))
  }

  /**
   * 记录安全事件
   */
  security(event: string, data?: any) {
    if (!this.enabled) {
      return
    }
    console.warn(this.formatMessage('SECURITY', event, data))
  }

  /**
   * 记录认证事件
   */
  auth(event: string, data?: any) {
    if (!this.enabled) {
      return
    }
    console.info(this.formatMessage('AUTH', event, data))
  }

  /**
   * 记录 API 请求
   */
  api(method: string, url: string, status?: number, duration?: number) {
    if (!this.enabled || this.level > LOG_LEVEL.DEBUG) {
      return
    }
    const message = `${method} ${url}`
    const data = { status, duration: duration ? `${duration}ms` : undefined }
    console.debug(this.formatMessage('API', message, data))
  }
}

/**
 * 导出日志记录器实例
 */
export const logger = new Logger()

/**
 * 开发环境使用 DEBUG 级别
 * 生产环境使用 ERROR 级别
 */
if (import.meta.env.DEV) {
  logger.setLevel(LOG_LEVEL.DEBUG)
} else {
  logger.setLevel(LOG_LEVEL.ERROR)
}
