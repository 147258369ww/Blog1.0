import type Quill from 'quill'

/**
 * 富文本编辑器组件 Props
 */
export interface RichTextEditorProps {
  /** 编辑器内容 (v-model) */
  modelValue?: string
  /** 占位符文本 */
  placeholder?: string
  /** 编辑器高度 */
  height?: number | string
  /** 是否只读 */
  readonly?: boolean
}

/**
 * 富文本编辑器组件 Emits
 */
export interface RichTextEditorEmits {
  /** 更新 modelValue */
  (e: 'update:modelValue', value: string): void
  /** 内容变化 */
  (e: 'change', value: string): void
}

/**
 * 富文本编辑器组件暴露的方法
 */
export interface RichTextEditorExpose {
  /** 获取 Quill 实例 */
  getQuill: () => Quill | null
  /** 聚焦编辑器 */
  focus: () => void
  /** 失焦编辑器 */
  blur: () => void
}
