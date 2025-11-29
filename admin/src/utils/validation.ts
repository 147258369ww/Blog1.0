/**
 * 表单验证工具
 *
 * 提供常用的表单验证规则和验证函数
 *
 * @module utils/validation
 */

import type { FormItemRule } from 'element-plus'

/**
 * 验证规则类型
 */
export type ValidationRule = FormItemRule

/**
 * 验证器函数类型
 */
export type ValidatorFunction = (rule: any, value: any, callback: (error?: Error) => void) => void

/**
 * 必填验证规则
 *
 * @param message - 错误提示消息
 * @param trigger - 触发方式，默认 'blur'
 * @returns 验证规则
 *
 * @example
 * ```typescript
 * const rules = {
 *   title: [required('请输入标题')]
 * }
 * ```
 */
export const required = (
  message: string = '该字段不能为空',
  trigger: 'blur' | 'change' = 'blur'
): ValidationRule => ({
  required: true,
  message,
  trigger,
})

/**
 * 邮箱验证规则
 *
 * @param message - 错误提示消息
 * @param trigger - 触发方式，默认 'blur'
 * @returns 验证规则
 *
 * @example
 * ```typescript
 * const rules = {
 *   email: [required('请输入邮箱'), email()]
 * }
 * ```
 */
export const email = (
  message: string = '请输入有效的邮箱地址',
  trigger: 'blur' | 'change' = 'blur'
): ValidationRule => ({
  type: 'email',
  message,
  trigger,
})

/**
 * URL 验证规则
 *
 * @param message - 错误提示消息
 * @param trigger - 触发方式，默认 'blur'
 * @returns 验证规则
 *
 * @example
 * ```typescript
 * const rules = {
 *   website: [url()]
 * }
 * ```
 */
export const url = (
  message: string = '请输入有效的 URL',
  trigger: 'blur' | 'change' = 'blur'
): ValidationRule => ({
  type: 'url',
  message,
  trigger,
})

/**
 * 最小长度验证规则
 *
 * @param min - 最小长度
 * @param message - 错误提示消息
 * @param trigger - 触发方式，默认 'blur'
 * @returns 验证规则
 *
 * @example
 * ```typescript
 * const rules = {
 *   password: [minLength(6, '密码至少需要 6 个字符')]
 * }
 * ```
 */
export const minLength = (
  min: number,
  message?: string,
  trigger: 'blur' | 'change' = 'blur'
): ValidationRule => ({
  min,
  message: message || `至少需要 ${min} 个字符`,
  trigger,
})

/**
 * 最大长度验证规则
 *
 * @param max - 最大长度
 * @param message - 错误提示消息
 * @param trigger - 触发方式，默认 'blur'
 * @returns 验证规则
 *
 * @example
 * ```typescript
 * const rules = {
 *   title: [maxLength(200, '标题最多 200 个字符')]
 * }
 * ```
 */
export const maxLength = (
  max: number,
  message?: string,
  trigger: 'blur' | 'change' = 'blur'
): ValidationRule => ({
  max,
  message: message || `最多允许 ${max} 个字符`,
  trigger,
})

/**
 * 长度范围验证规则
 *
 * @param min - 最小长度
 * @param max - 最大长度
 * @param message - 错误提示消息
 * @param trigger - 触发方式，默认 'blur'
 * @returns 验证规则
 *
 * @example
 * ```typescript
 * const rules = {
 *   username: [lengthRange(3, 20)]
 * }
 * ```
 */
export const lengthRange = (
  min: number,
  max: number,
  message?: string,
  trigger: 'blur' | 'change' = 'blur'
): ValidationRule => ({
  min,
  max,
  message: message || `长度在 ${min} 到 ${max} 个字符之间`,
  trigger,
})

/**
 * 数字验证规则
 *
 * @param message - 错误提示消息
 * @param trigger - 触发方式，默认 'blur'
 * @returns 验证规则
 *
 * @example
 * ```typescript
 * const rules = {
 *   age: [number()]
 * }
 * ```
 */
export const number = (
  message: string = '请输入数字',
  trigger: 'blur' | 'change' = 'blur'
): ValidationRule => ({
  type: 'number',
  message,
  trigger,
})

/**
 * 整数验证规则
 *
 * @param message - 错误提示消息
 * @param trigger - 触发方式，默认 'blur'
 * @returns 验证规则
 *
 * @example
 * ```typescript
 * const rules = {
 *   count: [integer()]
 * }
 * ```
 */
export const integer = (
  message: string = '请输入整数',
  trigger: 'blur' | 'change' = 'blur'
): ValidationRule => ({
  type: 'integer',
  message,
  trigger,
})

/**
 * 数值范围验证规则
 *
 * @param min - 最小值
 * @param max - 最大值
 * @param message - 错误提示消息
 * @param trigger - 触发方式，默认 'blur'
 * @returns 验证规则
 *
 * @example
 * ```typescript
 * const rules = {
 *   age: [numberRange(0, 150)]
 * }
 * ```
 */
export const numberRange = (
  min: number,
  max: number,
  message?: string,
  trigger: 'blur' | 'change' = 'blur'
): ValidationRule => ({
  type: 'number',
  min,
  max,
  message: message || `数值在 ${min} 到 ${max} 之间`,
  trigger,
})

/**
 * 手机号验证规则（中国大陆）
 *
 * @param message - 错误提示消息
 * @param trigger - 触发方式，默认 'blur'
 * @returns 验证规则
 *
 * @example
 * ```typescript
 * const rules = {
 *   phone: [phone()]
 * }
 * ```
 */
export const phone = (
  message: string = '请输入有效的手机号',
  trigger: 'blur' | 'change' = 'blur'
): ValidationRule => ({
  pattern: /^1[3-9]\d{9}$/,
  message,
  trigger,
})

/**
 * 自定义正则验证规则
 *
 * @param pattern - 正则表达式
 * @param message - 错误提示消息
 * @param trigger - 触发方式，默认 'blur'
 * @returns 验证规则
 *
 * @example
 * ```typescript
 * const rules = {
 *   code: [pattern(/^[A-Z0-9]{6}$/, '请输入 6 位大写字母或数字')]
 * }
 * ```
 */
export const pattern = (
  pattern: RegExp,
  message: string,
  trigger: 'blur' | 'change' = 'blur'
): ValidationRule => ({
  pattern,
  message,
  trigger,
})

/**
 * 自定义验证器
 *
 * @param validator - 验证函数
 * @param trigger - 触发方式，默认 'blur'
 * @returns 验证规则
 *
 * @example
 * ```typescript
 * const rules = {
 *   password: [
 *     custom((rule, value, callback) => {
 *       if (value.length < 6) {
 *         callback(new Error('密码至少 6 位'))
 *       } else {
 *         callback()
 *       }
 *     })
 *   ]
 * }
 * ```
 */
export const custom = (
  validator: ValidatorFunction,
  trigger: 'blur' | 'change' = 'blur'
): ValidationRule => ({
  validator,
  trigger,
})

/**
 * 密码强度验证器
 * 要求至少包含字母和数字
 *
 * @param message - 错误提示消息
 * @param trigger - 触发方式，默认 'blur'
 * @returns 验证规则
 *
 * @example
 * ```typescript
 * const rules = {
 *   password: [required('请输入密码'), passwordStrength()]
 * }
 * ```
 */
export const passwordStrength = (
  message: string = '密码必须包含字母和数字',
  trigger: 'blur' | 'change' = 'blur'
): ValidationRule => ({
  validator: (_rule: any, value: any, callback: (error?: Error) => void) => {
    if (!value) {
      callback()
      return
    }

    const hasLetter = /[a-zA-Z]/.test(value)
    const hasNumber = /\d/.test(value)

    if (!hasLetter || !hasNumber) {
      callback(new Error(message))
    } else {
      callback()
    }
  },
  trigger,
})

/**
 * 确认密码验证器
 * 注意：这个验证器需要在组件中配合使用，通过闭包访问表单数据
 *
 * @param getPassword - 获取密码值的函数
 * @param message - 错误提示消息
 * @param trigger - 触发方式，默认 'blur'
 * @returns 验证规则
 *
 * @example
 * ```typescript
 * const formData = reactive({ password: '', confirmPassword: '' })
 * const rules = {
 *   password: [required('请输入密码')],
 *   confirmPassword: [
 *     required('请确认密码'),
 *     confirmPassword(() => formData.password)
 *   ]
 * }
 * ```
 */
export const confirmPassword = (
  getPassword: () => string,
  message: string = '两次输入的密码不一致',
  trigger: 'blur' | 'change' = 'blur'
): ValidationRule => ({
  validator: (_rule: any, value: any, callback: (error?: Error) => void) => {
    if (!value) {
      callback()
      return
    }

    const password = getPassword()
    if (value !== password) {
      callback(new Error(message))
    } else {
      callback()
    }
  },
  trigger,
})

/**
 * Slug 验证规则（URL 友好的字符串）
 * 只允许小写字母、数字和连字符
 *
 * @param message - 错误提示消息
 * @param trigger - 触发方式，默认 'blur'
 * @returns 验证规则
 *
 * @example
 * ```typescript
 * const rules = {
 *   slug: [slug()]
 * }
 * ```
 */
export const slug = (
  message: string = '只能包含小写字母、数字和连字符',
  trigger: 'blur' | 'change' = 'blur'
): ValidationRule => ({
  pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  message,
  trigger,
})

/**
 * 颜色值验证规则（十六进制）
 *
 * @param message - 错误提示消息
 * @param trigger - 触发方式，默认 'blur'
 * @returns 验证规则
 *
 * @example
 * ```typescript
 * const rules = {
 *   color: [hexColor()]
 * }
 * ```
 */
export const hexColor = (
  message: string = '请输入有效的颜色值（如 #FF0000）',
  trigger: 'blur' | 'change' = 'blur'
): ValidationRule => ({
  pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  message,
  trigger,
})

/**
 * 组合多个验证规则
 *
 * @param rules - 验证规则数组
 * @returns 验证规则数组
 *
 * @example
 * ```typescript
 * const rules = {
 *   email: combine([
 *     required('请输入邮箱'),
 *     email(),
 *     maxLength(100)
 *   ])
 * }
 * ```
 */
export const combine = (...rules: ValidationRule[]): ValidationRule[] => {
  return rules
}

// 导出默认对象
export default {
  required,
  email,
  url,
  minLength,
  maxLength,
  lengthRange,
  number,
  integer,
  numberRange,
  phone,
  pattern,
  custom,
  passwordStrength,
  confirmPassword,
  slug,
  hexColor,
  combine,
}
