/**
 * 错误处理工具
 * 提供全局错误处理、日志记录和错误报告功能
 */

import type { App } from 'vue'
import { useToast } from '@/composables/useToast'

/**
 * 错误级别
 */
export const ErrorLevel = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  FATAL: 'fatal',
} as const

export type ErrorLevel = (typeof ErrorLevel)[keyof typeof ErrorLevel]

/**
 * 错误日志接口
 */
export interface ErrorLog {
  level: ErrorLevel
  message: string
  stack?: string
  timestamp: number
  url: string
  userAgent: string
  context?: Record<string, unknown>
}

/**
 * 错误处理器类
 */
class ErrorHandler {
  private logs: ErrorLog[] = []
  private maxLogs = 100
  private isDevelopment = import.meta.env.DEV

  /**
   * 记录错误日志
   */
  log(error: Error | string, level: ErrorLevel = ErrorLevel.ERROR, context?: Record<string, unknown>) {
    const errorLog: ErrorLog = {
      level,
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context,
    }

    // 添加到日志队列
    this.logs.push(errorLog)

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // 开发环境下打印到控制台
    if (this.isDevelopment) {
      this.logToConsole(errorLog)
    }

    // 生产环境下可以发送到日志服务器
    if (!this.isDevelopment && level === ErrorLevel.ERROR || level === ErrorLevel.FATAL) {
      this.sendToServer(errorLog)
    }
  }

  /**
   * 打印到控制台
   */
  private logToConsole(errorLog: ErrorLog) {
    const style = this.getConsoleStyle(errorLog.level)
    console.group(`%c[${errorLog.level.toUpperCase()}] ${errorLog.message}`, style)
    console.log('Timestamp:', new Date(errorLog.timestamp).toISOString())
    console.log('URL:', errorLog.url)
    if (errorLog.stack) {
      console.log('Stack:', errorLog.stack)
    }
    if (errorLog.context) {
      console.log('Context:', errorLog.context)
    }
    console.groupEnd()
  }

  /**
   * 获取控制台样式
   */
  private getConsoleStyle(level: ErrorLevel): string {
    const styles = {
      [ErrorLevel.INFO]: 'color: #3538CD; font-weight: bold;',
      [ErrorLevel.WARNING]: 'color: #F79009; font-weight: bold;',
      [ErrorLevel.ERROR]: 'color: #C01048; font-weight: bold;',
      [ErrorLevel.FATAL]: 'color: #C01048; font-weight: bold; font-size: 14px;',
    }
    return styles[level]
  }

  /**
   * 发送到服务器
   */
  private async sendToServer(errorLog: ErrorLog) {
    try {
      // 这里可以实现发送到日志服务器的逻辑
      // 例如: Sentry, LogRocket, 自定义日志服务等
      // await fetch('/api/v1/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorLog),
      // })
      console.log('Error log would be sent to server:', errorLog)
    } catch (error) {
      console.error('Failed to send error log to server:', error)
    }
  }

  /**
   * 获取所有日志
   */
  getLogs(): ErrorLog[] {
    return [...this.logs]
  }

  /**
   * 清除日志
   */
  clearLogs() {
    this.logs = []
  }

  /**
   * 处理 Vue 错误
   */
  handleVueError(err: unknown, instance: unknown, info: string) {
    const error = err as Error
    this.log(error, ErrorLevel.ERROR, {
      component: instance ? (instance as { $options?: { name?: string } }).$options?.name : 'Unknown',
      info,
    })

    // 显示用户友好的错误提示
    const toast = useToast()
    toast.error('应用出现错误，请刷新页面重试')
  }

  /**
   * 处理未捕获的异常
   */
  handleUncaughtError(event: ErrorEvent) {
    event.preventDefault()
    this.log(event.error || event.message, ErrorLevel.FATAL, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })

    // 显示用户友好的错误提示
    const toast = useToast()
    toast.error('应用出现严重错误，请刷新页面')
  }

  /**
   * 处理未处理的 Promise 拒绝
   */
  handleUnhandledRejection(event: PromiseRejectionEvent) {
    event.preventDefault()
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
    this.log(error, ErrorLevel.ERROR, {
      type: 'unhandledRejection',
    })

    // 显示用户友好的错误提示
    const toast = useToast()
    toast.error('操作失败，请重试')
  }

  /**
   * 安装全局错误处理器
   */
  install(app: App) {
    // Vue 错误处理器
    app.config.errorHandler = (err, instance, info) => {
      this.handleVueError(err, instance, info)
    }

    // 未捕获的异常
    window.addEventListener('error', (event) => {
      this.handleUncaughtError(event)
    })

    // 未处理的 Promise 拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUnhandledRejection(event)
    })

    // 资源加载错误
    window.addEventListener(
      'error',
      (event) => {
        const target = event.target as HTMLElement
        if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
          const element = target as HTMLImageElement | HTMLScriptElement | HTMLLinkElement
          const url = 'src' in element ? element.src : (element as HTMLLinkElement).href
          this.log(`资源加载失败: ${url}`, ErrorLevel.WARNING)
        }
      },
      true
    )
  }
}

// 导出单例
export const errorHandler = new ErrorHandler()

// 默认导出
export default errorHandler
