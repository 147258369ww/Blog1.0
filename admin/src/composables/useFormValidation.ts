/**
 * 表单验证组合式函数
 *
 * 提供表单验证相关的功能，包括：
 * 1. 表单验证
 * 2. 错误处理
 * 3. 提交状态管理
 *
 * @module composables/useFormValidation
 */

import { ref } from 'vue'
import type { FormInstance } from 'element-plus'
import { showError, showValidationErrors } from '@/utils/message'

/**
 * 表单验证组合式函数
 *
 * @returns 表单验证相关的状态和方法
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue'
 * import { useFormValidation } from '@/composables/useFormValidation'
 *
 * const formRef = ref<FormInstance>()
 * const { validate, resetValidation, submitting, handleSubmit } = useFormValidation()
 *
 * const onSubmit = handleSubmit(async () => {
 *   const valid = await validate(formRef.value)
 *   if (!valid) return
 *
 *   // 执行提交逻辑
 *   await api.submit(formData)
 * })
 * </script>
 * ```
 */
export function useFormValidation() {
  // 提交状态
  const submitting = ref(false)

  // 验证错误
  const errors = ref<Record<string, string>>({})

  /**
   * 验证表单
   *
   * @param formRef - 表单实例引用
   * @returns Promise<boolean> - 验证是否通过
   */
  const validate = async (formRef?: FormInstance): Promise<boolean> => {
    if (!formRef) {
      showError('表单引用不存在')
      return false
    }

    try {
      await formRef.validate()
      errors.value = {}
      return true
    } catch (error: unknown) {
      // Element Plus 表单验证失败时会抛出错误
      // 错误对象包含所有验证失败的字段
      if (error && typeof error === 'object') {
        const validationErrors: Record<string, string> = {}

        Object.keys(error as object).forEach(field => {
          const fieldErrors = (error as any)[field]
          if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
            validationErrors[field] = fieldErrors[0].message
          }
        })

        errors.value = validationErrors

        // 显示第一个验证错误
        const firstError = Object.values(validationErrors)[0]
        if (firstError) {
          showError(firstError)
        }
      }

      return false
    }
  }

  /**
   * 验证单个字段
   *
   * @param formRef - 表单实例引用
   * @param field - 字段名
   * @returns Promise<boolean> - 验证是否通过
   */
  const validateField = async (
    formRef: FormInstance | undefined,
    field: string
  ): Promise<boolean> => {
    if (!formRef) {
      return false
    }

    try {
      await formRef.validateField(field)
      // 清除该字段的错误
      if (errors.value[field]) {
        delete errors.value[field]
      }
      return true
    } catch (_error) {
      return false
    }
  }

  /**
   * 重置表单验证
   *
   * @param formRef - 表单实例引用
   */
  const resetValidation = (formRef?: FormInstance) => {
    if (formRef) {
      formRef.clearValidate()
    }
    errors.value = {}
  }

  /**
   * 重置表单
   *
   * @param formRef - 表单实例引用
   */
  const resetForm = (formRef?: FormInstance) => {
    if (formRef) {
      formRef.resetFields()
    }
    errors.value = {}
  }

  /**
   * 设置字段错误
   * 用于显示服务器返回的验证错误
   *
   * @param fieldErrors - 字段错误对象
   *
   * @example
   * ```typescript
   * try {
   *   await api.submit(formData)
   * } catch (error: any) {
   *   if (error.response?.status === 422) {
   *     setFieldErrors(error.response.data.errors)
   *   }
   * }
   * ```
   */
  const setFieldErrors = (fieldErrors: Record<string, string | string[]>) => {
    const normalizedErrors: Record<string, string> = {}

    Object.entries(fieldErrors).forEach(([field, messages]) => {
      if (Array.isArray(messages)) {
        normalizedErrors[field] = messages[0] || ''
      } else {
        normalizedErrors[field] = messages
      }
    })

    errors.value = normalizedErrors
    showValidationErrors(normalizedErrors)
  }

  /**
   * 清除字段错误
   *
   * @param field - 字段名，不传则清除所有错误
   */
  const clearFieldError = (field?: string) => {
    if (field) {
      delete errors.value[field]
    } else {
      errors.value = {}
    }
  }

  /**
   * 获取字段错误消息
   *
   * @param field - 字段名
   * @returns 错误消息
   */
  const getFieldError = (field: string): string | undefined => {
    return errors.value[field]
  }

  /**
   * 检查字段是否有错误
   *
   * @param field - 字段名
   * @returns 是否有错误
   */
  const hasFieldError = (field: string): boolean => {
    return !!errors.value[field]
  }

  /**
   * 包装提交处理函数
   * 自动管理提交状态和错误处理
   *
   * @param handler - 提交处理函数
   * @returns 包装后的提交函数
   *
   * @example
   * ```typescript
   * const onSubmit = handleSubmit(async () => {
   *   const valid = await validate(formRef.value)
   *   if (!valid) return
   *
   *   await api.submit(formData)
   *   showSuccess('提交成功')
   * })
   * ```
   */
  const handleSubmit = (handler: () => Promise<void>) => {
    return async () => {
      if (submitting.value) {
        return
      }

      submitting.value = true

      try {
        await handler()
      } catch (error: any) {
        console.error('表单提交失败:', error)

        // 处理验证错误
        if (error.response?.status === 422 && error.response?.data?.errors) {
          setFieldErrors(error.response.data.errors)
        }
        // 其他错误已在 HTTP 拦截器中处理
      } finally {
        submitting.value = false
      }
    }
  }

  return {
    // 状态
    submitting,
    errors,

    // 方法
    validate,
    validateField,
    resetValidation,
    resetForm,
    setFieldErrors,
    clearFieldError,
    getFieldError,
    hasFieldError,
    handleSubmit,
  }
}

/**
 * 表单提交组合式函数
 * 简化版本，只处理提交状态
 *
 * @returns 提交状态和处理函数
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useFormSubmit } from '@/composables/useFormValidation'
 *
 * const { submitting, handleSubmit } = useFormSubmit()
 *
 * const onSubmit = handleSubmit(async () => {
 *   await api.submit(formData)
 *   showSuccess('提交成功')
 * })
 * </script>
 *
 * <template>
 *   <el-button :loading="submitting" @click="onSubmit">
 *     提交
 *   </el-button>
 * </template>
 * ```
 */
export function useFormSubmit() {
  const submitting = ref(false)

  const handleSubmit = (handler: () => Promise<void>) => {
    return async () => {
      if (submitting.value) {
        return
      }

      submitting.value = true

      try {
        await handler()
      } catch (error) {
        console.error('提交失败:', error)
        // 错误已在 HTTP 拦截器中处理
      } finally {
        submitting.value = false
      }
    }
  }

  return {
    submitting,
    handleSubmit,
  }
}

export default useFormValidation
