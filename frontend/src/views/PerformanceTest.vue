<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { performanceTester, type PerformanceTestResult } from '@/utils/performance-test'

/**
 * 性能测试页面
 * 用于测试页面加载速度、资源加载、代码分割和缓存策略
 */

const results = ref<PerformanceTestResult[]>([])
const isRunning = ref(false)
const summary = ref({
  total: 0,
  success: 0,
  warning: 0,
  error: 0,
  passed: false
})

// 按类别分组结果
const groupedResults = computed(() => {
  const groups: Record<string, PerformanceTestResult[]> = {}
  results.value.forEach(result => {
    if (!groups[result.category]) {
      groups[result.category] = []
    }
    groups[result.category]!.push(result)
  })
  return groups
})

const runTests = async () => {
  isRunning.value = true
  results.value = []
  
  try {
    results.value = await performanceTester.runAllTests()
    summary.value = performanceTester.getSummary()
  } catch (error) {
    console.error('性能测试失败:', error)
  } finally {
    isRunning.value = false
  }
}

onMounted(() => {
  // 等待页面完全加载后再运行测试
  if (document.readyState === 'complete') {
    runTests()
  } else {
    window.addEventListener('load', runTests)
  }
})

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return '✅'
    case 'warning':
      return '⚠️'
    case 'error':
      return '❌'
    default:
      return '❓'
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'success':
      return 'status-success'
    case 'warning':
      return 'status-warning'
    case 'error':
      return 'status-error'
    default:
      return ''
  }
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case '页面加载':
      return '⚡'
    case '资源加载':
      return '📦'
    case '代码分割':
      return '✂️'
    case '缓存策略':
      return '💾'
    case '图片懒加载':
      return '🖼️'
    default:
      return '📊'
  }
}
</script>

<template>
  <div class="performance-test-page">
    <div class="container">
      <header class="page-header">
        <h1>⚡ 性能测试</h1>
        <p>测试页面加载速度、资源加载、代码分割和缓存策略</p>
      </header>

      <div class="test-controls">
        <button 
          @click="runTests" 
          :disabled="isRunning"
          class="btn-primary"
        >
          {{ isRunning ? '测试中...' : '重新运行测试' }}
        </button>
      </div>

      <div v-if="results.length > 0" class="test-results">
        <!-- 测试摘要 -->
        <div class="summary-card" :class="{ 'summary-passed': summary.passed }">
          <h2>测试摘要</h2>
          <div class="summary-stats">
            <div class="stat">
              <span class="stat-label">总计</span>
              <span class="stat-value">{{ summary.total }}</span>
            </div>
            <div class="stat stat-success">
              <span class="stat-label">成功</span>
              <span class="stat-value">{{ summary.success }}</span>
            </div>
            <div class="stat stat-warning">
              <span class="stat-label">警告</span>
              <span class="stat-value">{{ summary.warning }}</span>
            </div>
            <div class="stat stat-error">
              <span class="stat-label">错误</span>
              <span class="stat-value">{{ summary.error }}</span>
            </div>
          </div>
          <div class="summary-message">
            <span v-if="summary.error === 0 && summary.warning === 0">
              🎉 所有性能测试通过!
            </span>
            <span v-else-if="summary.error === 0">
              ✨ 性能测试完成，有一些警告需要注意
            </span>
            <span v-else>
              ⚠️ 性能测试发现问题，请优化
            </span>
          </div>
        </div>

        <!-- 分类测试结果 -->
        <div 
          v-for="(categoryResults, category) in groupedResults" 
          :key="category"
          class="results-category"
        >
          <h2>
            <span class="category-icon">{{ getCategoryIcon(category) }}</span>
            {{ category }}
          </h2>
          <div class="results-list">
            <div 
              v-for="(result, index) in categoryResults" 
              :key="index"
              class="result-item"
              :class="getStatusClass(result.status)"
            >
              <div class="result-header">
                <span class="result-icon">{{ getStatusIcon(result.status) }}</span>
                <span class="result-metric">{{ result.metric }}</span>
                <span class="result-value">{{ result.value }}</span>
                <span v-if="result.threshold" class="result-threshold">
                  阈值: {{ result.threshold }}
                </span>
              </div>
              <div class="result-message">{{ result.message }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="isRunning" class="loading">
        <div class="spinner"></div>
        <p>正在运行性能测试...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.performance-test-page {
  min-height: 100vh;
  padding: 2rem 1rem;
  background: var(--bg-secondary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-header p {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

.test-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.btn-primary {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: var(--color-primary-600);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-700);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(127, 86, 217, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-results {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid var(--color-error-700);
}

.summary-card.summary-passed {
  border-color: var(--color-success-700);
}

.summary-card h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-success .stat-value {
  color: var(--color-success-700);
}

.stat-warning .stat-value {
  color: #F59E0B;
}

.stat-error .stat-value {
  color: var(--color-error-700);
}

.summary-message {
  text-align: center;
  font-size: 1.125rem;
  font-weight: 600;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.results-category {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.results-category h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-icon {
  font-size: 1.75rem;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-item {
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid var(--color-gray-300);
  background: var(--bg-secondary);
}

.result-item.status-success {
  border-left-color: var(--color-success-700);
  background: var(--color-success-50);
}

.result-item.status-warning {
  border-left-color: #F59E0B;
  background: #FEF3C7;
}

.result-item.status-error {
  border-left-color: var(--color-error-700);
  background: var(--color-error-50);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.result-icon {
  font-size: 1.25rem;
}

.result-metric {
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.result-value {
  font-family: monospace;
  font-weight: 600;
  color: var(--text-primary);
  background: var(--bg-primary);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
}

.result-threshold {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-family: monospace;
}

.result-message {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-gray-300);
  border-top-color: var(--color-primary-600);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading p {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

/* 暗色主题适配 */
[data-theme='dark'] .summary-card,
[data-theme='dark'] .results-category {
  background: var(--bg-primary);
}

[data-theme='dark'] .stat,
[data-theme='dark'] .summary-message,
[data-theme='dark'] .result-item {
  background: var(--bg-secondary);
}

[data-theme='dark'] .result-value {
  background: rgba(255, 255, 255, 0.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }

  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .result-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .result-metric {
    flex: none;
  }
}
</style>
