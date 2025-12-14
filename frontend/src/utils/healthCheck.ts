import { http } from '@/services/http'

/**
 * 后端健康状态接口
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'error'
  timestamp: string
  uptime: number
  services?: {
    database?: {
      status: string
      responseTime?: string
      message?: string
    }
    redis?: {
      status: string
      responseTime?: string
      message?: string
    }
  }
  system?: {
    platform?: string
    nodeVersion?: string
    uptime?: string
    pid?: number
    environment?: string
  }
  memory?: {
    rss?: string
    heapTotal?: string
    heapUsed?: string
    external?: string
  }
}

/**
 * 健康检查工具类
 */
class HealthCheckService {
  private healthCheckInterval: number | null = null
  private lastHealthStatus: HealthStatus | null = null
  private healthCheckCallbacks: Array<(status: HealthStatus) => void> = []

  /**
   * 检查后端健康状态
   * @returns 健康状态
   */
  async checkHealth(): Promise<HealthStatus> {
    try {
      const response = await http.get<HealthStatus>('/health')
      this.lastHealthStatus = response
      this.notifyCallbacks(response)
      return response
    } catch (error) {
      const errorStatus: HealthStatus = {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: 0,
      }
      this.lastHealthStatus = errorStatus
      this.notifyCallbacks(errorStatus)
      throw error
    }
  }

  /**
   * 简单的存活检查（不检查依赖）
   * @returns 是否存活
   */
  async ping(): Promise<boolean> {
    try {
      await http.get('/ping')
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 获取最后一次健康检查结果
   * @returns 健康状态或 null
   */
  getLastHealthStatus(): HealthStatus | null {
    return this.lastHealthStatus
  }

  /**
   * 启动定期健康检查
   * @param intervalMs 检查间隔（毫秒），默认 30 秒
   */
  startPeriodicCheck(intervalMs: number = 30000): void {
    if (this.healthCheckInterval !== null) {
      console.warn('健康检查已在运行中')
      return
    }

    // 立即执行一次
    this.checkHealth().catch((error) => {
      console.error('健康检查失败:', error)
    })

    // 定期执行
    this.healthCheckInterval = window.setInterval(() => {
      this.checkHealth().catch((error) => {
        console.error('健康检查失败:', error)
      })
    }, intervalMs)

    console.log(`健康检查已启动，间隔: ${intervalMs}ms`)
  }

  /**
   * 停止定期健康检查
   */
  stopPeriodicCheck(): void {
    if (this.healthCheckInterval !== null) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
      console.log('健康检查已停止')
    }
  }

  /**
   * 订阅健康状态变化
   * @param callback 回调函数
   * @returns 取消订阅函数
   */
  onHealthChange(callback: (status: HealthStatus) => void): () => void {
    this.healthCheckCallbacks.push(callback)

    // 如果有最后的健康状态，立即通知
    if (this.lastHealthStatus) {
      callback(this.lastHealthStatus)
    }

    // 返回取消订阅函数
    return () => {
      const index = this.healthCheckCallbacks.indexOf(callback)
      if (index > -1) {
        this.healthCheckCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * 通知所有订阅者
   */
  private notifyCallbacks(status: HealthStatus): void {
    this.healthCheckCallbacks.forEach((callback) => {
      try {
        callback(status)
      } catch (error) {
        console.error('健康检查回调执行失败:', error)
      }
    })
  }

  /**
   * 判断后端是否健康
   * @returns 是否健康
   */
  isHealthy(): boolean {
    return this.lastHealthStatus?.status === 'healthy'
  }

  /**
   * 判断后端是否降级
   * @returns 是否降级
   */
  isDegraded(): boolean {
    return this.lastHealthStatus?.status === 'degraded'
  }

  /**
   * 判断后端是否错误
   * @returns 是否错误
   */
  isError(): boolean {
    return this.lastHealthStatus?.status === 'error' || this.lastHealthStatus === null
  }
}

// 导出单例
export const healthCheckService = new HealthCheckService()

// 默认导出
export default healthCheckService
