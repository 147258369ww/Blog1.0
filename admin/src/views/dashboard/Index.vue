<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { dashboardApi } from '@/api/dashboard'
import { categoryApi } from '@/api/category'
import type { ChartData } from '@/types/chart'
import BarChart from '@/components/chart/BarChart.vue'

// 加载状态
const loading = ref(false)

// 统计数据
const blogStats = ref({
  totalPosts: 0,
  totalTags: 0,
  totalViews: 0,
})

const postStats = ref({
  draft: 0,
  published: 0,
  archived: 0,
})

const totalCategories = ref(0)

// 数据卡片配置
const statCards = computed(() => [
  {
    title: '总访问量',
    value: blogStats.value.totalViews,
    color: '#409EFF',
    icon: '👁️',
  },
  {
    title: '已发布文章',
    value: postStats.value.published,
    color: '#67C23A',
    icon: '📝',
  },
  {
    title: '文章分类',
    value: totalCategories.value,
    color: '#E6A23C',
    icon: '📁',
  },
  {
    title: '文章标签',
    value: blogStats.value.totalTags,
    color: '#F56C6C',
    icon: '🏷️',
  },
])

// 文章状态图表数据
const postStatsChartData = computed<ChartData>(() => ({
  labels: ['草稿', '已发布', '已归档'],
  datasets: [
    {
      label: '文章数量',
      data: [postStats.value.draft, postStats.value.published, postStats.value.archived],
      backgroundColor: ['#E6A23C', '#67C23A', '#909399'],
    },
  ],
}))

// 获取博客统计数据
const fetchBlogStats = async () => {
  try {
    const response = await dashboardApi.getStats()
    if (response.success && response.data) {
      blogStats.value = response.data
    }
  } catch (error) {
    console.error('获取博客统计数据失败:', error)
    ElMessage.error('获取博客统计数据失败')
  }
}

// 获取文章状态统计
const fetchPostStats = async () => {
  try {
    const response = await dashboardApi.getPostStats()
    if (response.success && response.data) {
      postStats.value = response.data
    }
  } catch (error) {
    console.error('获取文章统计数据失败:', error)
    ElMessage.error('获取文章统计数据失败')
  }
}

// 获取分类总数
const fetchCategories = async () => {
  try {
    const response = await categoryApi.getList()
    if (response.success && response.data) {
      totalCategories.value = response.data.length
    }
  } catch (error) {
    console.error('获取分类数据失败:', error)
  }
}

// 初始化数据
const initData = async () => {
  loading.value = true
  try {
    await Promise.all([fetchBlogStats(), fetchPostStats(), fetchCategories()])
  } catch (error) {
    console.error('初始化数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 简单节流实现，避免高频刷新触发限流
const throttle = <T extends (...args: any[]) => any>(fn: T, wait: number) => {
  let last = 0
  let timeout: number | undefined
  return (...args: Parameters<T>) => {
    const now = Date.now()
    const remaining = wait - (now - last)
    if (remaining <= 0) {
      last = now
      fn(...args)
    } else if (!timeout) {
      timeout = window.setTimeout(() => {
        last = Date.now()
        timeout = undefined
        fn(...args)
      }, remaining)
    }
  }
}

const throttledInitData = throttle(initData, 30000)
const intervalId = ref<number | null>(null)

onMounted(() => {
  throttledInitData()
  intervalId.value = window.setInterval(throttledInitData, 30000)
})

onUnmounted(() => {
  if (intervalId.value) {
    window.clearInterval(intervalId.value)
    intervalId.value = null
  }
})
</script>

<template>
  <div v-loading="loading" class="dashboard">
    <!-- 数据卡片区域 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col v-for="card in statCards" :key="card.title" :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-card-content">
            <div class="stat-info">
              <div class="stat-title">{{ card.title }}</div>
              <div class="stat-value">{{ formatNumber(card.value) }}</div>
            </div>
            <div
              class="stat-icon"
              :style="{ backgroundColor: card.color + '20', color: card.color }"
            >
              <div class="icon-placeholder">{{ card.icon }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-section">
      <!-- 文章状态统计图 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>文章状态统计</span>
            </div>
          </template>
          <BarChart :data="postStatsChartData" :height="300" />
        </el-card>
      </el-col>

      <!-- 统计信息卡片 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>统计概览</span>
            </div>
          </template>
          <div class="stats-overview">
            <div class="stats-item">
              <div class="stats-label">文章总数</div>
              <div class="stats-value">{{ blogStats.totalPosts }}</div>
            </div>
            <div class="stats-item">
              <div class="stats-label">草稿</div>
              <div class="stats-value" style="color: #e6a23c">{{ postStats.draft }}</div>
            </div>
            <div class="stats-item">
              <div class="stats-label">已发布</div>
              <div class="stats-value" style="color: #67c23a">{{ postStats.published }}</div>
            </div>
            <div class="stats-item">
              <div class="stats-label">已归档</div>
              <div class="stats-value" style="color: #909399">{{ postStats.archived }}</div>
            </div>
            <div class="stats-item">
              <div class="stats-label">标签总数</div>
              <div class="stats-value">{{ blogStats.totalTags }}</div>
            </div>
            <div class="stats-item">
              <div class="stats-label">分类总数</div>
              <div class="stats-value">{{ totalCategories }}</div>
            </div>
            <div class="stats-item">
              <div class="stats-label">总访问量</div>
              <div class="stats-value" style="color: #409eff">
                {{ formatNumber(blogStats.totalViews) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;

  // 数据卡片区域
  .stat-cards {
    margin-bottom: 20px;

    .stat-card {
      .stat-card-content {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .stat-info {
          flex: 1;

          .stat-title {
            font-size: 14px;
            color: #909399;
            margin-bottom: 8px;
          }

          .stat-value {
            font-size: 28px;
            font-weight: 600;
            color: #303133;
          }
        }

        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;

          .icon-placeholder {
            font-size: 32px;
          }
        }
      }
    }
  }

  // 图表区域
  .chart-section {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }

    // 统计概览
    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      padding: 20px 0;

      .stats-item {
        text-align: center;
        padding: 20px;
        background: #f5f7fa;
        border-radius: 8px;

        .stats-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .stats-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .dashboard {
    padding: 10px;

    .stat-cards,
    .chart-section {
      margin-bottom: 10px;
    }

    .stats-overview {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 10px !important;

      .stats-item {
        padding: 15px !important;
      }
    }
  }
}
</style>
