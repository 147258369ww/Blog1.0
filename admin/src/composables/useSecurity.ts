/**
 * 安全相关的组合式函数
 */

import { ref } from 'vue'
import { sanitizeHtml, sanitizeText, sanitizeUrl } from '@/utils/sanitize'
import { RateLimiter, checkPasswordStrength, isSafeRedirectUrl } from '@/utils/security'

/**
 * 使用 XSS 防护
 */
export function useXSSProtection() {
  /**
   * 清理 HTML 内容
   */
  const cleanHtml = (html: string): string => {
    return sanitizeHtml(html)
  }

  /**
   * 清理文本内容
   */
  const cleanText = (text: string): string => {
    return sanitizeText(text)
  }

  /**
   * 清理 URL
   */
  const cleanUrl = (url: string): string => {
    return sanitizeUrl(url)
  }

  return {
    cleanHtml,
    cleanText,
    cleanUrl,
  }
}

/**
 * 使用密码强度检查
 */
export function usePasswordStrength() {
  const strength = ref<'weak' | 'medium' | 'strong'>('weak')
  const strengthText = ref('弱')
  const strengthColor = ref('#F56C6C')

  /**
   * 检查密码强度
   */
  const check = (password: string) => {
    strength.value = checkPasswordStrength(password)

    switch (strength.value) {
      case 'weak':
        strengthText.value = '弱'
        strengthColor.value = '#F56C6C'
        break
      case 'medium':
        strengthText.value = '中'
        strengthColor.value = '#E6A23C'
        break
      case 'strong':
        strengthText.value = '强'
        strengthColor.value = '#67C23A'
        break
    }
  }

  return {
    strength,
    strengthText,
    strengthColor,
    check,
  }
}

/**
 * 使用请求频率限制
 */
export function useRateLimit(limit: number, window: number) {
  const limiter = new RateLimiter(limit, window)
  const isBlocked = ref(false)

  /**
   * 检查是否允许请求
   */
  const checkLimit = (key: string): boolean => {
    const allowed = limiter.check(key)
    isBlocked.value = !allowed
    return allowed
  }

  /**
   * 重置限制
   */
  const reset = (key: string) => {
    limiter.reset(key)
    isBlocked.value = false
  }

  return {
    isBlocked,
    checkLimit,
    reset,
  }
}

/**
 * 使用安全重定向
 */
export function useSafeRedirect() {
  /**
   * 安全重定向
   */
  const safeRedirect = (url: string, allowedDomains: string[] = []): boolean => {
    if (isSafeRedirectUrl(url, allowedDomains)) {
      window.location.href = url
      return true
    }
    console.warn('不安全的重定向 URL:', url)
    return false
  }

  return {
    safeRedirect,
  }
}
