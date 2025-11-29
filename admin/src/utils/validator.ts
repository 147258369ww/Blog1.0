/**
 * 输入验证工具
 * 提供常用的表单验证规则和验证函数
 */

/**
 * 验证规则类型
 */
export type ValidatorRule = (_value: unknown) => boolean | string
import { passwordPolicy } from '@/config/security'

/**
 * 邮箱验证
 *
 * @param value - 邮箱地址
 * @returns 验证通过返回 true，否则返回错误消息
 */
export const validateEmail = (value: string): boolean | string => {
  if (!value) {
    return '邮箱地址不能为空'
  }
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(value) || '请输入有效的邮箱地址'
}

/**
 * URL 验证
 *
 * @param value - URL 地址
 * @returns 验证通过返回 true，否则返回错误消息
 */
export const validateUrl = (value: string): boolean | string => {
  if (!value) {
    return 'URL 不能为空'
  }
  try {
    const url = new URL(value)
    // 只允许 http 和 https 协议
    if (!['http:', 'https:'].includes(url.protocol)) {
      return '只支持 HTTP 或 HTTPS 协议'
    }
    return true
  } catch {
    return '请输入有效的 URL 地址'
  }
}

/**
 * 必填验证
 *
 * @param value - 输入值
 * @returns 验证通过返回 true，否则返回错误消息
 */
export const validateRequired = (value: unknown): boolean | string => {
  if (value === null || value === undefined || value === '') {
    return '该字段不能为空'
  }
  if (Array.isArray(value) && value.length === 0) {
    return '该字段不能为空'
  }
  if (typeof value === 'string' && value.trim() === '') {
    return '该字段不能为空'
  }
  return true
}

/**
 * 最小长度验证
 *
 * @param min - 最小长度
 * @returns 验证函数
 */
export const validateMinLength =
  (min: number) =>
  (value: string): boolean | string => {
    if (!value) {
      return true // 空值由 required 验证处理
    }
    return value.length >= min || `最少需要 ${min} 个字符`
  }

/**
 * 最大长度验证
 *
 * @param max - 最大长度
 * @returns 验证函数
 */
export const validateMaxLength =
  (max: number) =>
  (value: string): boolean | string => {
    if (!value) {
      return true
    }
    return value.length <= max || `最多允许 ${max} 个字符`
  }

/**
 * 长度范围验证
 *
 * @param min - 最小长度
 * @param max - 最大长度
 * @returns 验证函数
 */
export const validateLengthRange =
  (min: number, max: number) =>
  (value: string): boolean | string => {
    if (!value) {
      return true
    }
    if (value.length < min) {
      return `最少需要 ${min} 个字符`
    }
    if (value.length > max) {
      return `最多允许 ${max} 个字符`
    }
    return true
  }

/**
 * 数字验证
 *
 * @param value - 输入值
 * @returns 验证通过返回 true，否则返回错误消息
 */
export const validateNumber = (value: unknown): boolean | string => {
  if (value === null || value === undefined || value === '') {
    return true
  }
  return !isNaN(Number(value)) || '请输入有效的数字'
}

/**
 * 整数验证
 *
 * @param value - 输入值
 * @returns 验证通过返回 true，否则返回错误消息
 */
export const validateInteger = (value: unknown): boolean | string => {
  if (value === null || value === undefined || value === '') {
    return true
  }
  return Number.isInteger(Number(value)) || '请输入有效的整数'
}

/**
 * 最小值验证
 *
 * @param min - 最小值
 * @returns 验证函数
 */
export const validateMin =
  (min: number) =>
  (value: number): boolean | string => {
    if (value === null || value === undefined) {
      return true
    }
    return value >= min || `值不能小于 ${min}`
  }

/**
 * 最大值验证
 *
 * @param max - 最大值
 * @returns 验证函数
 */
export const validateMax =
  (max: number) =>
  (value: number): boolean | string => {
    if (value === null || value === undefined) {
      return true
    }
    return value <= max || `值不能大于 ${max}`
  }

/**
 * 数值范围验证
 *
 * @param min - 最小值
 * @param max - 最大值
 * @returns 验证函数
 */
export const validateRange =
  (min: number, max: number) =>
  (value: number): boolean | string => {
    if (value === null || value === undefined) {
      return true
    }
    if (value < min) {
      return `值不能小于 ${min}`
    }
    if (value > max) {
      return `值不能大于 ${max}`
    }
    return true
  }

/**
 * 手机号验证（中国大陆）
 *
 * @param value - 手机号
 * @returns 验证通过返回 true，否则返回错误消息
 */
export const validatePhone = (value: string): boolean | string => {
  if (!value) {
    return true
  }
  const pattern = /^1[3-9]\d{9}$/
  return pattern.test(value) || '请输入有效的手机号码'
}

/**
 * 密码强度验证
 * 要求至少 8 位，包含大小写字母和数字
 *
 * @param value - 密码
 * @returns 验证通过返回 true，否则返回错误消息
 */
export const validatePassword = (value: string): boolean | string => {
  if (!value) {
    return '密码不能为空'
  }
  const min = passwordPolicy.minLength
  if (value.length < min) {
    return `密码长度至少为 ${min} 位`
  }
  if (passwordPolicy.requireLowercase && !/[a-z]/.test(value)) {
    return '密码必须包含小写字母'
  }
  if (passwordPolicy.requireUppercase && !/[A-Z]/.test(value)) {
    return '密码必须包含大写字母'
  }
  if (passwordPolicy.requireNumber && !/\d/.test(value)) {
    return '密码必须包含数字'
  }
  if (passwordPolicy.requireSpecialChar && !/[^a-zA-Z0-9]/.test(value)) {
    return '密码必须包含特殊字符'
  }
  return true
}

/**
 * 简单密码验证
 * 只要求最小长度
 *
 * @param minLength - 最小长度，默认 6
 * @returns 验证函数
 */
export const validateSimplePassword =
  (minLength = passwordPolicy.minLength) =>
  (value: string): boolean | string => {
    if (!value) {
      return '密码不能为空'
    }
    return value.length >= minLength || `密码长度至少为 ${minLength} 位`
  }

/**
 * 确认密码验证
 *
 * @param password - 原密码
 * @returns 验证函数
 */
export const validatePasswordConfirm =
  (password: string) =>
  (value: string): boolean | string => {
    if (!value) {
      return '请确认密码'
    }
    return value === password || '两次输入的密码不一致'
  }

/**
 * 用户名验证
 * 只允许字母、数字、下划线和连字符，长度 3-20
 *
 * @param value - 用户名
 * @returns 验证通过返回 true，否则返回错误消息
 */
export const validateUsername = (value: string): boolean | string => {
  if (!value) {
    return '用户名不能为空'
  }
  if (value.length < 3 || value.length > 20) {
    return '用户名长度为 3-20 个字符'
  }
  const pattern = /^[a-zA-Z0-9_-]+$/
  return pattern.test(value) || '用户名只能包含字母、数字、下划线和连字符'
}

/**
 * Slug 验证
 * 只允许小写字母、数字和连字符
 *
 * @param value - Slug
 * @returns 验证通过返回 true，否则返回错误消息
 */
export const validateSlug = (value: string): boolean | string => {
  if (!value) {
    return 'Slug 不能为空'
  }
  const pattern = /^[a-z0-9-]+$/
  return pattern.test(value) || 'Slug 只能包含小写字母、数字和连字符'
}

/**
 * 颜色值验证（十六进制）
 *
 * @param value - 颜色值
 * @returns 验证通过返回 true，否则返回错误消息
 */
export const validateColor = (value: string): boolean | string => {
  if (!value) {
    return true
  }
  const pattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return pattern.test(value) || '请输入有效的颜色值（如 #FF0000）'
}

/**
 * 文件大小验证
 *
 * @param maxSize - 最大文件大小（MB）
 * @returns 验证函数
 */
export const validateFileSize =
  (maxSize: number) =>
  (file: File): boolean | string => {
    if (!file) {
      return true
    }
    const sizeMB = file.size / 1024 / 1024
    return sizeMB <= maxSize || `文件大小不能超过 ${maxSize}MB`
  }

/**
 * 文件类型验证
 *
 * @param allowedTypes - 允许的文件类型数组（MIME 类型）
 * @returns 验证函数
 */
export const validateFileType =
  (allowedTypes: string[]) =>
  (file: File): boolean | string => {
    if (!file) {
      return true
    }
    return allowedTypes.includes(file.type) || `只允许上传 ${allowedTypes.join(', ')} 类型的文件`
  }

/**
 * 图片文件验证
 *
 * @param file - 文件对象
 * @returns 验证通过返回 true，否则返回错误消息
 */
export const validateImageFile = (file: File): boolean | string => {
  if (!file) {
    return true
  }
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  return allowedTypes.includes(file.type) || '只允许上传 JPEG、PNG、GIF 或 WebP 格式的图片'
}

/**
 * 日期验证
 *
 * @param value - 日期字符串或日期对象
 * @returns 验证通过返回 true，否则返回错误消息
 */
export const validateDate = (value: string | Date): boolean | string => {
  if (!value) {
    return true
  }
  const date = new Date(value)
  return !isNaN(date.getTime()) || '请输入有效的日期'
}

/**
 * 日期范围验证
 *
 * @param minDate - 最小日期
 * @param maxDate - 最大日期
 * @returns 验证函数
 */
export const validateDateRange =
  (minDate?: Date, maxDate?: Date) =>
  (value: string | Date): boolean | string => {
    if (!value) {
      return true
    }
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      return '请输入有效的日期'
    }
    if (minDate && date < minDate) {
      return `日期不能早于 ${minDate.toLocaleDateString()}`
    }
    if (maxDate && date > maxDate) {
      return `日期不能晚于 ${maxDate.toLocaleDateString()}`
    }
    return true
  }

/**
 * 组合多个验证规则
 *
 * @param rules - 验证规则数组
 * @returns 组合后的验证函数
 */
export const combineValidators =
  (...rules: ValidatorRule[]) =>
  (value: unknown): boolean | string => {
    for (const rule of rules) {
      const result = rule(value)
      if (result !== true) {
        return result
      }
    }
    return true
  }

/**
 * Element Plus 表单验证规则生成器
 */
export const formRules = {
  /**
   * 必填规则
   */
  required: (message = '该字段不能为空') => ({
    required: true,
    message,
    trigger: 'blur',
  }),

  /**
   * 邮箱规则
   */
  email: () => ({
    validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
      const result = validateEmail(value)
      if (result === true) {
        callback()
      } else {
        callback(new Error(typeof result === 'string' ? result : '验证失败'))
      }
    },
    trigger: 'blur',
  }),

  /**
   * URL 规则
   */
  url: () => ({
    validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
      const result = validateUrl(value)
      if (result === true) {
        callback()
      } else {
        callback(new Error(typeof result === 'string' ? result : '验证失败'))
      }
    },
    trigger: 'blur',
  }),

  /**
   * 长度范围规则
   */
  length: (min: number, max: number) => ({
    min,
    max,
    message: `长度在 ${min} 到 ${max} 个字符`,
    trigger: 'blur',
  }),

  /**
   * 数值范围规则
   */
  range: (min: number, max: number) => ({
    type: 'number' as const,
    min,
    max,
    message: `值在 ${min} 到 ${max} 之间`,
    trigger: 'blur',
  }),
}
