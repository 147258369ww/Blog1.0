<template>
  <div ref="chartContainer" class="bar-chart-container">
    <div ref="chartRef" class="bar-chart" :style="{ height: height + 'px' }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsType } from 'echarts/core'
import type { ChartData, ChartOptions } from '@/types/chart'

// 注册必需的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer,
])

// 定义组件props
interface Props {
  data: ChartData
  options?: ChartOptions
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 400,
})

// 图表实例引用
const chartRef = ref<HTMLDivElement | null>(null)
const chartContainer = ref<HTMLDivElement | null>(null)
let chartInstance: EChartsType | null = null

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  // 销毁现有图表实例
  if (chartInstance) {
    chartInstance.dispose()
  }

  // 创建新的图表实例
  chartInstance = echarts.init(chartRef.value)

  // 渲染图表
  updateChart()
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance || !props.data) return

  // 构建图表配置项
  const option = {
    title: props.options?.title
      ? {
          text: props.options.title.text,
          left: 'center',
        }
      : undefined,
    tooltip: {
      trigger: 'axis',
    },
    legend:
      props.options?.legend?.display !== false
        ? {
            data: props.data.datasets.map(dataset => dataset.label),
            top: props.options?.title ? '10%' : '5%',
          }
        : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: props.options?.title ? '20%' : '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: props.data.labels,
    },
    yAxis: {
      type: 'value',
    },
    series: props.data.datasets.map(dataset => ({
      name: dataset.label,
      type: 'bar',
      data: dataset.data,
      barWidth: dataset.barWidth || '60%',
      stack: dataset.stack,
      itemStyle: {
        color: dataset.backgroundColor,
        borderColor: dataset.borderColor,
        borderWidth: dataset.borderWidth || 0,
      },
    })),
  }

  chartInstance.setOption(option)
}

// 响应式调整
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 监听数据变化
watch(
  [() => props.data, () => props.options],
  () => {
    updateChart()
  },
  { deep: true }
)

// 监听窗口大小变化
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  nextTick(() => {
    initChart()

    // 使用ResizeObserver监听容器大小变化
    if (window.ResizeObserver && chartContainer.value) {
      resizeObserver = new ResizeObserver(handleResize)
      resizeObserver.observe(chartContainer.value)
    } else {
      // 降级到监听窗口大小变化
      window.addEventListener('resize', handleResize)
    }
  })
})

onBeforeUnmount(() => {
  // 清理事件监听器
  if (resizeObserver && chartContainer.value) {
    resizeObserver.unobserve(chartContainer.value)
    resizeObserver.disconnect()
  } else {
    window.removeEventListener('resize', handleResize)
  }

  // 销毁图表实例
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.bar-chart-container {
  width: 100%;
}

.bar-chart {
  width: 100%;
}
</style>
