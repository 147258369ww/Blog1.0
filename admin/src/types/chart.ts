/**
 * 图表数据类型定义
 */

/**
 * 数据集接口
 */
export interface ChartDataset {
  /** 数据标签 */
  label: string
  /** 数据值数组 */
  data: number[]
  /** 背景颜色 */
  backgroundColor?: string | string[]
  /** 边框颜色 */
  borderColor?: string
  /** 边框宽度 */
  borderWidth?: number
  /** 柱状图宽度 */
  barWidth?: string | number
  /** 堆叠组 */
  stack?: string
}

/**
 * 图表数据接口
 */
export interface ChartData {
  /** 标签数组 */
  labels: string[]
  /** 数据集数组 */
  datasets: ChartDataset[]
}

/**
 * 图表配置选项接口
 */
export interface ChartOptions {
  /** 标题配置 */
  title?: {
    display?: boolean
    text?: string
    [key: string]: any
  }
  /** 图例配置 */
  legend?: {
    display?: boolean
    position?: 'top' | 'bottom' | 'left' | 'right'
    [key: string]: any
  }
  /** 提示框配置 */
  tooltip?: {
    enabled?: boolean
    [key: string]: any
  }
  /** 坐标轴配置 */
  scales?: {
    x?: {
      display?: boolean
      title?: {
        display: boolean
        text: string
      }
      [key: string]: any
    }
    y?: {
      display?: boolean
      title?: {
        display: boolean
        text: string
      }
      [key: string]: any
    }
  }
  /** 响应式配置 */
  responsive?: boolean
  /** 维持宽高比 */
  maintainAspectRatio?: boolean
  /** 其他 ECharts 配置项 */
  [key: string]: any
}
