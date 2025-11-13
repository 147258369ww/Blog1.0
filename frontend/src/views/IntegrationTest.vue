<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { integrationTester, type IntegrationTestResult } from '@/utils/integration-test'

/**
 * 集成测试页面
 * 用于开发环境验证所有功能模块的集成状态
 */

const results = ref<IntegrationTestResult[]>([])
const isRunning = ref(false)
const summary = ref({
  total: 0,
  success: 0,
  warning: 0,
  error: 0,
  passed: false
})

const runTests = async () => {
  isRunning.value = true
  results.value = []
  
  try {
    results.value = await integrationTester.runAllTests()
    summary.value = integrationTester.getSummary()
  } catch (error) {
    console.error('集成测试失败:', error)
  } finally {
    isRunning.value = false
  }
}

onMounted(() => {
  // 自动运行测试
  runTests()
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
</script>

<template>
  <div class="integration-test-page">
    <div class="container">
      <header class="page-header">
        <h1>🧪 集成测试</h1>
        <p>验证所有功能模块的集成状态</p>
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
              🎉 所有集成测试通过!
            </span>
            <span v-else-if="summary.error === 0">
              ✨ 集成测试完成，有一些警告需要注意
            </span>
            <span v-else>
              ⚠️ 集成测试发现错误，请检查并修复
            </span>
          </div>
        </div>

        <!-- 测试结果列表 -->
        <div class="results-list">
          <h2>测试详情</h2>
          <div 
            v-for="(result, index) in results" 
            :key="index"
            class="result-item"
            :class="getStatusClass(result.status)"
          >
            <div class="result-header">
              <span class="result-icon">{{ getStatusIcon(result.status) }}</span>
              <span class="result-module">{{ result.module }}</span>
              <span class="result-status">{{ result.status }}</span>
            </div>
            <div class="result-message">{{ result.message }}</div>
            <div v-if="result.details" class="result-details">
              <pre>{{ JSON.stringify(result.details, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="isRunning" class="loading">
        <div class="spinner"></div>
        <p>正在运行集成测试...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.integration-test-page {
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

.results-list {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.results-list h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.result-item {
  padding: 1rem;
  margin-bottom: 1rem;
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
}

.result-icon {
  font-size: 1.25rem;
}

.result-module {
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.result-status {
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  text-transform: uppercase;
}

.result-message {
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.result-details {
  margin-top: 0.75rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 4px;
  overflow-x: auto;
}

.result-details pre {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
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
[data-theme='dark'] .results-list {
  background: var(--bg-primary);
}

[data-theme='dark'] .stat,
[data-theme='dark'] .summary-message,
[data-theme='dark'] .result-item {
  background: var(--bg-secondary);
}

[data-theme='dark'] .result-details {
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
    flex-wrap: wrap;
  }
}
</style>
