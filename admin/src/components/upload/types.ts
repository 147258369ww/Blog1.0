import type { UploadFile } from 'element-plus'

/**
 * 图片上传组件 Props
 */
export interface ImageUploadProps {
  modelValue?: string | string[]
  multiple?: boolean
  limit?: number
  maxSize?: number
  disabled?: boolean
}

/**
 * 图片上传组件 Emits
 */
export interface ImageUploadEmits {
  (e: 'update:modelValue', value: string | string[]): void
  (e: 'success', file: UploadFile, url: string): void
  (e: 'error', error: Error): void
}

/**
 * 文件上传组件 Props
 */
export interface FileUploadProps {
  modelValue?: string | string[]
  accept?: string
  multiple?: boolean
  limit?: number
  maxSize?: number
  disabled?: boolean
}

/**
 * 文件上传组件 Emits
 */
export interface FileUploadEmits {
  (e: 'update:modelValue', value: string | string[]): void
  (e: 'success', file: UploadFile, url: string): void
  (e: 'error', error: Error): void
}
