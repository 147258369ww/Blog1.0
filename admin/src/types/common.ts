// 路由元信息类型
export interface RouteMeta {
  title?: string
  requiresAuth?: boolean
  icon?: string
  roles?: string[] // 允许访问的角色列表
}

// 表单规则类型
export interface FormRule {
  required?: boolean
  message?: string
  trigger?: string | string[]
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (rule: any, value: any, callback: any) => void
}

// 表格列配置类型
export interface TableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  fixed?: boolean | 'left' | 'right'
}

// 选项类型
export interface Option {
  label: string
  value: string | number
  disabled?: boolean
}
