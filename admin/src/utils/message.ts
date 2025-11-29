/**
 * 消息提示工具
 *
 * 统一封装 Element Plus 的消息提示功能，提供一致的用户反馈体验
 *
 * 功能特性:
 * 1. 成功提示（3秒后自动消失）
 * 2. 错误提示（可配置持续时间）
 * 3. 警告提示
 * 4. 信息提示
 * 5. 加载提示
 * 6. 确认对话框
 *
 * @module utils/message
 */

import { ElMessage, ElMessageBox, ElLoading, type LoadingInstance } from 'element-plus'

/**
 * 确认对话框配置
 */
interface ConfirmConfig {
  /** 标题 */
  title?: string
  /** 消息内容 */
  message: string
  /** 确认按钮文本 */
  confirmButtonText?: string
  /** 取消按钮文本 */
  cancelButtonText?: string
  /** 类型 */
  type?: 'success' | 'warning' | 'info' | 'error'
}

/**
 * 显示成功提示
 * 默认 3 秒后自动消失
 *
 * @param message - 提示消息
 * @param duration - 持续时间（毫秒），默认 3000
 *
 * @example
 * ```typescript
 * showSuccess('操作成功')
 * showSuccess('保存成功', 2000)
 * ```
 */
export const showSuccess = (message: string, duration: number = 3000) => {
  ElMessage({
    message,
    type: 'success',
    duration,
    showClose: true,
  })
}

/**
 * 显示错误提示
 * 默认 5 秒后自动消失
 *
 * @param message - 错误消息
 * @param duration - 持续时间（毫秒），默认 5000
 *
 * @example
 * ```typescript
 * showError('操作失败')
 * showError('网络错误，请稍后重试', 0) // 不自动关闭
 * ```
 */
export const showError = (message: string, duration: number = 5000) => {
  ElMessage({
    message,
    type: 'error',
    duration,
    showClose: true,
  })
}

/**
 * 显示警告提示
 * 默认 4 秒后自动消失
 *
 * @param message - 警告消息
 * @param duration - 持续时间（毫秒），默认 4000
 *
 * @example
 * ```typescript
 * showWarning('请先选择要删除的项目')
 * ```
 */
export const showWarning = (message: string, duration: number = 4000) => {
  ElMessage({
    message,
    type: 'warning',
    duration,
    showClose: true,
  })
}

/**
 * 显示信息提示
 * 默认 3 秒后自动消失
 *
 * @param message - 信息消息
 * @param duration - 持续时间（毫秒），默认 3000
 *
 * @example
 * ```typescript
 * showInfo('数据已加载')
 * ```
 */
export const showInfo = (message: string, duration: number = 3000) => {
  ElMessage({
    message,
    type: 'info',
    duration,
    showClose: true,
  })
}

/**
 * 显示加载提示
 * 返回加载实例，需要手动关闭
 *
 * @param message - 加载消息，默认 '加载中...'
 * @returns 加载实例
 *
 * @example
 * ```typescript
 * const loading = showLoading('正在保存...')
 * try {
 *   await saveData()
 * } finally {
 *   loading.close()
 * }
 * ```
 */
export const showLoading = (message: string = '加载中...'): LoadingInstance => {
  return ElLoading.service({
    lock: true,
    text: message,
    background: 'rgba(0, 0, 0, 0.7)',
  })
}

/**
 * 显示确认对话框
 *
 * @param config - 确认对话框配置
 * @returns Promise，确认返回 true，取消返回 false
 *
 * @example
 * ```typescript
 * const confirmed = await showConfirm({
 *   title: '删除确认',
 *   message: '确定要删除这条记录吗？',
 *   type: 'warning'
 * })
 *
 * if (confirmed) {
 *   // 执行删除操作
 * }
 * ```
 */
export const showConfirm = async (config: ConfirmConfig): Promise<boolean> => {
  try {
    await ElMessageBox.confirm(config.message, config.title || '提示', {
      confirmButtonText: config.confirmButtonText || '确定',
      cancelButtonText: config.cancelButtonText || '取消',
      type: config.type || 'warning',
      closeOnClickModal: false,
    })
    return true
  } catch (_error) {
    // 用户取消
    return false
  }
}

/**
 * 显示提示对话框（只有确定按钮）
 *
 * @param message - 提示消息
 * @param title - 标题，默认 '提示'
 * @param type - 类型，默认 'info'
 *
 * @example
 * ```typescript
 * await showAlert('操作成功完成', '成功', 'success')
 * ```
 */
export const showAlert = async (
  message: string,
  title: string = '提示',
  type: 'success' | 'warning' | 'info' | 'error' = 'info'
): Promise<void> => {
  try {
    await ElMessageBox.alert(message, title, {
      confirmButtonText: '确定',
      type,
    })
  } catch (_error) {
    // 用户关闭对话框
  }
}

/**
 * 显示输入对话框
 *
 * @param message - 提示消息
 * @param title - 标题，默认 '请输入'
 * @param inputValue - 默认输入值
 * @returns Promise，返回用户输入的值，取消返回 null
 *
 * @example
 * ```typescript
 * const name = await showPrompt('请输入名称', '新建分类')
 * if (name) {
 *   // 使用输入的名称
 * }
 * ```
 */
export const showPrompt = async (
  message: string,
  title: string = '请输入',
  inputValue: string = ''
): Promise<string | null> => {
  try {
    const { value } = await ElMessageBox.prompt(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue,
    })
    return value
  } catch (error) {
    // 用户取消
    return null
  }
}

/**
 * 处理 API 错误并显示友好的错误消息
 *
 * @param error - 错误对象
 * @param defaultMessage - 默认错误消息
 *
 * @example
 * ```typescript
 * try {
 *   await api.deleteArticle(id)
 * } catch (error) {
 *   handleApiError(error, '删除文章失败')
 * }
 * ```
 */
export const handleApiError = (error: any, defaultMessage: string = '操作失败') => {
  console.error('API Error:', error)

  // 如果错误已经在拦截器中处理过，不再重复显示
  if (error?.response?.status) {
    // 拦截器已处理
    return
  }

  // 显示默认错误消息
  const message: string = error?.message || error?.error || defaultMessage
  showError(message)
}

/**
 * 显示表单验证错误
 *
 * @param errors - 验证错误对象
 *
 * @example
 * ```typescript
 * const errors = {
 *   title: '标题不能为空',
 *   content: '内容不能为空'
 * }
 * showValidationErrors(errors)
 * ```
 */
export const showValidationErrors = (errors: Record<string, string>) => {
  const messages = Object.values(errors).filter(Boolean)
  if (messages.length > 0) {
    // 只显示第一个错误
    showError(messages[0] || '表单验证失败')
  }
}

/**
 * 显示网络错误提示
 *
 * @param retry - 重试回调函数（可选）
 *
 * @example
 * ```typescript
 * showNetworkError(() => {
 *   // 重新加载数据
 *   loadData()
 * })
 * ```
 */
export const showNetworkError = async (retry?: () => void) => {
  if (retry) {
    const confirmed = await showConfirm({
      title: '网络错误',
      message: '网络连接失败，是否重试？',
      type: 'error',
      confirmButtonText: '重试',
      cancelButtonText: '取消',
    })

    if (confirmed) {
      retry()
    }
  } else {
    showError('网络连接失败，请检查网络设置')
  }
}

// Token 过期提示的防抖标志
let tokenExpiredShown = false

/**
 * 显示 Token 过期提示
 * 使用防抖机制，确保同一时间只显示一次
 *
 * @example
 * ```typescript
 * showTokenExpired()
 * ```
 */
export const showTokenExpired = () => {
  // 如果已经显示过，不再重复显示
  if (tokenExpiredShown) {
    return
  }

  tokenExpiredShown = true
  showError('登录已过期，请重新登录', 3000)

  // 3秒后重置标志
  setTimeout(() => {
    tokenExpiredShown = false
  }, 3000)
}

// 导出默认对象
export default {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading,
  confirm: showConfirm,
  alert: showAlert,
  prompt: showPrompt,
  handleApiError,
  showValidationErrors,
  showNetworkError,
  showTokenExpired,
}
