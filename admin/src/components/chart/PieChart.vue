<template>
  <div ref="chartContainer" class="pie-chart-container">
    <div ref="chartRef" class="pie-chart" :style="{ height: height + 'px' }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsType } from 'echarts/core'
import type { ChartData, ChartOptions } from '@/types/chart'

// 注册必需的组件
echarts.use([TitleComponent, TooltipComponent, LegendComponent, PieChart, CanvasRenderer])

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
  if (!chartInstance || !props.data || !props.data.datasets[0]) return

  const dataset = props.data.datasets[0]

  // 构建图表配置项
  const option = {
    title: props.options?.title
      ? {
          text: props.options.title.text,
          left: 'center',
        }
      : undefined,
    tooltip: {
      trigger: 'item',
    },
    legend:
      props.options?.legend?.display !== false
        ? {
            data: props.data.labels,
            top: props.options?.title ? '10%' : '5%',
          }
        : undefined,
    series: [
      {
        name: dataset.label,
        type: 'pie',
        radius: '50%',
        data: props.data.labels.map((label, index) => ({
          name: label,
          value: dataset.data[index],
        })),
        itemStyle: {
          color: (params: any) => {
            // 如果数据集提供了背景颜色数组，则使用对应的颜色
            if (Array.isArray(dataset.backgroundColor)) {
              return dataset.backgroundColor[params.dataIndex]
            }
            // 否则使用默认颜色
            return dataset.backgroundColor
          },
          borderColor: dataset.borderColor,
          borderWidth: dataset.borderWidth || 0,
        },
      },
    ],
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
.pie-chart-container {
  width: 100%;
}

.pie-chart {
  width: 100%;
}
</style>
