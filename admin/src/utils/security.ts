/**
 * 安全工具集
 * 提供各种安全相关的实用函数
 */

/**
 * 生成随机字符串
 * 用于生成 CSRF Token、随机 ID 等
 *
 * @param length - 字符串长度
 * @returns 随机字符串
 */
export function generateRandomString(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i]! % chars.length]
  }

  return result
}

/**
 * 生成 UUID v4
 *
 * @returns UUID 字符串
 */
export function generateUUID(): string {
  return crypto.randomUUID()
}

/**
 * 检查密码强度
 *
 * @param password - 密码
 * @returns 强度等级: weak, medium, strong
 */
export function checkPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (!password || password.length < 6) {
    return 'weak'
  }

  let strength = 0

  // 长度检查
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++

  // 包含小写字母
  if (/[a-z]/.test(password)) strength++

  // 包含大写字母
  if (/[A-Z]/.test(password)) strength++

  // 包含数字
  if (/\d/.test(password)) strength++

  // 包含特殊字符
  if (/[^a-zA-Z0-9]/.test(password)) strength++

  if (strength <= 2) return 'weak'
  if (strength <= 4) return 'medium'
  return 'strong'
}

/**
 * 防抖函数
 * 用于限制函数执行频率，防止暴力攻击
 *
 * @param func - 要执行的函数
 * @param wait - 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (this: unknown, ...args: Parameters<T>) {
    const context = this

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

/**
 * 节流函数
 * 用于限制函数执行频率
 *
 * @param func - 要执行的函数
 * @param limit - 时间限制（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return function (this: unknown, ...args: Parameters<T>) {
    const context = this

    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 检查是否是安全的重定向 URL
 * 防止开放重定向漏洞
 *
 * @param url - 要检查的 URL
 * @param allowedDomains - 允许的域名列表
 * @returns 是否安全
 */
export function isSafeRedirectUrl(url: string, allowedDomains: string[] = []): boolean {
  try {
    // 相对路径是安全的
    if (url.startsWith('/') && !url.startsWith('//')) {
      return true
    }

    const urlObj = new URL(url, window.location.origin)

    // 检查协议
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false
    }

    // 检查域名
    if (allowedDomains.length > 0) {
      return allowedDomains.some(
        domain => urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      )
    }

    // 默认只允许同域名
    return urlObj.hostname === window.location.hostname
  } catch {
    return false
  }
}

/**
 * 清理对象中的敏感字段
 * 用于日志记录时移除敏感信息
 *
 * @param obj - 原始对象
 * @param sensitiveFields - 敏感字段列表
 * @returns 清理后的对象
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  sensitiveFields: string[] = [
    'password',
    'token',
    'secret',
    'apiKey',
    'accessToken',
    'refreshToken',
  ]
): Partial<T> {
  const result: any = {}

  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveFields.includes(key)) {
      result[key] = '***REDACTED***'
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeObject(value, sensitiveFields)
    } else {
      result[key] = value
    }
  }

  return result
}

/**
 * 检测潜在的 XSS 攻击
 *
 * @param input - 输入字符串
 * @returns 是否包含潜在的 XSS 攻击代码
 */
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ]

  return xssPatterns.some(pattern => pattern.test(input))
}

/**
 * 检测潜在的 SQL 注入
 *
 * @param input - 输入字符串
 * @returns 是否包含潜在的 SQL 注入代码
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|#|\/\*|\*\/)/g,
    /(\bOR\b|\bAND\b).*=.*=/gi,
    /'\s*(OR|AND)\s*'?\d/gi,
  ]

  return sqlPatterns.some(pattern => pattern.test(input))
}

/**
 * 限制请求频率
 * 用于防止暴力攻击
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private limit: number
  private window: number

  /**
   * @param limit - 时间窗口内允许的最大请求数
   * @param window - 时间窗口（毫秒）
   */
  constructor(limit: number, window: number) {
    this.limit = limit
    this.window = window
  }

  /**
   * 检查是否允许请求
   *
   * @param key - 请求标识（如用户 ID、IP 地址等）
   * @returns 是否允许请求
   */
  check(key: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(key) || []

    // 移除过期的请求记录
    const validRequests = requests.filter(time => now - time < this.window)

    if (validRequests.length >= this.limit) {
      return false
    }

    validRequests.push(now)
    this.requests.set(key, validRequests)

    return true
  }

  /**
   * 重置指定 key 的请求记录
   *
   * @param key - 请求标识
   */
  reset(key: string): void {
    this.requests.delete(key)
  }

  /**
   * 清理所有过期的请求记录
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => now - time < this.window)
      if (validRequests.length === 0) {
        this.requests.delete(key)
      } else {
        this.requests.set(key, validRequests)
      }
    }
  }
}

/**
 * 创建内容安全策略（CSP）头
 *
 * @returns CSP 配置对象
 */
export function createCSPConfig() {
  return {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", import.meta.env.VITE_API_BASE_URL],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  }
}
