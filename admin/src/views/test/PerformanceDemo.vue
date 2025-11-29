<template>
  <div class="performance-demo">
    <el-page-header title="性能优化演示" @back="$router.back()" />

    <el-card class="demo-section">
      <template #header>
        <h3>1. API 响应缓存</h3>
      </template>
      <el-space direction="vertical" style="width: 100%">
        <el-button @click="fetchWithCache">使用缓存获取数据</el-button>
        <el-button @click="fetchWithoutCache">强制刷新数据</el-button>
        <div v-loading="cacheLoading">
          <div v-if="cacheData">
            <p>数据: {{ cacheData }}</p>
            <p class="tip">第一次点击会请求 API，后续点击会从缓存返回（60秒内）</p>
          </div>
        </div>
      </el-space>
    </el-card>

    <el-card class="demo-section">
      <template #header>
        <h3>2. 搜索防抖</h3>
      </template>
      <el-space direction="vertical" style="width: 100%">
        <el-input v-model="searchKeyword" placeholder="输入搜索关键词（500ms 防抖）" clearable />
        <div v-if="debouncedKeyword">
          <p>防抖后的值: {{ debouncedKeyword }}</p>
          <p class="tip">输入停止 500ms 后才会更新</p>
        </div>
      </el-space>
    </el-card>

    <el-card class="demo-section">
      <template #header>
        <h3>3. 骨架屏加载</h3>
      </template>
      <el-space direction="vertical" style="width: 100%">
        <el-button @click="toggleSkeleton">切换加载状态</el-button>
        <SkeletonCard v-if="showSkeleton" :rows="5" />
        <el-card v-else>
          <h4>实际内容</h4>
          <p>这是加载完成后显示的内容</p>
        </el-card>
      </el-space>
    </el-card>

    <el-card class="demo-section">
      <template #header>
        <h3>4. 本地存储缓存</h3>
      </template>
      <el-space direction="vertical" style="width: 100%">
        <el-input v-model="storageValue" placeholder="输入要缓存的值" />
        <el-space>
          <el-button @click="saveToCache">保存到缓存（5分钟）</el-button>
          <el-button @click="loadFromCache">从缓存读取</el-button>
          <el-button @click="clearCache">清除缓存</el-button>
        </el-space>
        <div v-if="cachedValue">
          <p>缓存的值: {{ cachedValue }}</p>
        </div>
      </el-space>
    </el-card>

    <el-card class="demo-section">
      <template #header>
        <h3>5. 组件懒加载</h3>
      </template>
      <el-space direction="vertical" style="width: 100%">
        <el-button @click="showLazyComponent = !showLazyComponent">
          {{ showLazyComponent ? '隐藏' : '显示' }}懒加载组件
        </el-button>
        <Suspense v-if="showLazyComponent">
          <template #default>
            <LazyComponent />
          </template>
          <template #fallback>
            <el-skeleton :rows="3" animated />
          </template>
        </Suspense>
      </el-space>
    </el-card>

    <el-card class="demo-section">
      <template #header>
        <h3>6. 性能监控</h3>
      </template>
      <el-space direction="vertical" style="width: 100%">
        <el-button @click="measurePerformance">测量函数执行时间</el-button>
        <el-button @click="showPerformanceMetrics">查看性能指标</el-button>
        <div v-if="performanceResult">
          <p>{{ performanceResult }}</p>
        </div>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useCache } from '@/composables/useCache'
import { useDebounce } from '@/composables/useDebounce'
import { useLazyComponent } from '@/composables/useLazyComponent'
import { storage } from '@/utils/storage'
import { measureTime, getPerformanceMetrics } from '@/utils/performance'
import SkeletonCard from '@/components/common/SkeletonCard.vue'

// 1. API 响应缓存演示
const {
  data: cacheData,
  loading: cacheLoading,
  fetch,
  refresh,
} = useCache(
  'demo-data',
  async () => {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { message: '这是从 API 获取的数据', timestamp: new Date().toISOString() }
  },
  { ttl: 60000 }
)

const fetchWithCache = () => fetch()
const fetchWithoutCache = () => refresh()

// 2. 搜索防抖演示
const searchKeyword = ref('')
const debouncedKeyword = useDebounce(searchKeyword, 500)

watch(debouncedKeyword, value => {
  if (value) {
    console.log('执行搜索:', value)
  }
})

// 3. 骨架屏演示
const showSkeleton = ref(true)
const toggleSkeleton = () => {
  showSkeleton.value = !showSkeleton.value
}

// 4. 本地存储缓存演示
const storageValue = ref('')
const cachedValue = ref('')

const saveToCache = () => {
  storage.setCache('demo-cache', storageValue.value, 5 * 60 * 1000)
  ElMessage.success('已保存到缓存（5分钟）')
}

const loadFromCache = () => {
  const value = storage.getCache<string>('demo-cache')
  if (value) {
    cachedValue.value = value
    ElMessage.success('从缓存读取成功')
  } else {
    ElMessage.warning('缓存不存在或已过期')
  }
}

const clearCache = () => {
  storage.removeCache('demo-cache')
  cachedValue.value = ''
  ElMessage.success('缓存已清除')
}

// 5. 组件懒加载演示
const showLazyComponent = ref(false)
const LazyComponent = useLazyComponent(
  () =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve({
          template: '<div><h4>懒加载组件</h4><p>这个组件是动态加载的</p></div>',
        })
      }, 1000)
    }),
  {
    delay: 200,
    showLoading: true,
    loadingText: '加载组件中...',
  }
)

// 6. 性能监控演示
const performanceResult = ref('')

const measurePerformance = () => {
  const heavyTask = measureTime(() => {
    // 模拟耗时操作
    let sum = 0
    for (let i = 0; i < 1000000; i++) {
      sum += i
    }
    return sum
  }, '重型计算任务')

  const result = heavyTask()
  performanceResult.value = `计算结果: ${result}`
}

const showPerformanceMetrics = () => {
  const metrics = getPerformanceMetrics()
  if (metrics) {
    performanceResult.value = `
      页面加载时间: ${metrics.loadTime}ms
      DOM 就绪时间: ${metrics.domReadyTime}ms
      ${metrics.firstContentfulPaint ? `FCP: ${metrics.firstContentfulPaint.toFixed(2)}ms` : ''}
      ${metrics.largestContentfulPaint ? `LCP: ${metrics.largestContentfulPaint.toFixed(2)}ms` : ''}
    `
  } else {
    performanceResult.value = '无法获取性能指标'
  }
}
</script>

<style scoped lang="scss">
.performance-demo {
  padding: 20px;
}

.demo-section {
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
}

.tip {
  color: var(--el-color-info);
  font-size: 12px;
  margin-top: 8px;
}
</style>
