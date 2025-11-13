<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-boundary__content">
      <div class="error-boundary__icon">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
            fill="currentColor"
          />
        </svg>
      </div>
      <h2 class="error-boundary__title">{{ title }}</h2>
      <p class="error-boundary__message">{{ message }}</p>
      <div class="error-boundary__actions">
        <button class="error-boundary__button" @click="handleRetry">
          重试
        </button>
        <button class="error-boundary__button error-boundary__button--secondary" @click="handleGoHome">
          返回首页
        </button>
      </div>
      <details v-if="isDevelopment && errorDetails" class="error-boundary__details">
        <summary>错误详情</summary>
        <pre>{{ errorDetails }}</pre>
      </details>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { errorHandler, ErrorLevel } from '@/utils/errorHandler'

interface Props {
  title?: string
  message?: string
  onError?: (error: Error) => void
}

const props = withDefaults(defineProps<Props>(), {
  title: '出错了',
  message: '抱歉，页面加载出现问题。请尝试刷新页面或返回首页。',
})

const router = useRouter()
const hasError = ref(false)
const errorDetails = ref<string>('')
const isDevelopment = import.meta.env.DEV

// 捕获子组件错误
onErrorCaptured((err: Error, instance, info) => {
  hasError.value = true
  errorDetails.value = `${err.message}\n\nStack:\n${err.stack}\n\nInfo: ${info}`

  // 记录错误日志
  errorHandler.log(err, ErrorLevel.ERROR, {
    component: instance?.$options?.name || 'Unknown',
    info,
  })

  // 调用自定义错误处理
  if (props.onError) {
    props.onError(err)
  }

  // 阻止错误继续向上传播
  return false
})

// 重试
const handleRetry = () => {
  hasError.value = false
  errorDetails.value = ''
  // 刷新当前路由
  router.go(0)
}

// 返回首页
const handleGoHome = () => {
  hasError.value = false
  errorDetails.value = ''
  router.push('/')
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
}

.error-boundary__content {
  max-width: 600px;
  text-align: center;
}

.error-boundary__icon {
  color: var(--color-error-700, #c01048);
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.error-boundary__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
  margin-bottom: 0.5rem;
}

.error-boundary__message {
  font-size: 1rem;
  color: var(--text-secondary, #667085);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-boundary__actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.error-boundary__button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: var(--color-primary-600, #7f56d9);
  color: white;
}

.error-boundary__button:hover {
  background-color: var(--color-primary-700, #6941c6);
  transform: translateY(-1px);
}

.error-boundary__button--secondary {
  background-color: var(--color-gray-300, #d0d5dd);
  color: var(--text-primary, #1a1a1a);
}

.error-boundary__button--secondary:hover {
  background-color: var(--color-gray-500, #667085);
  color: white;
}

.error-boundary__details {
  margin-top: 2rem;
  text-align: left;
  background-color: var(--bg-secondary, #f9fafb);
  border-radius: 8px;
  padding: 1rem;
}

.error-boundary__details summary {
  cursor: pointer;
  font-weight: 500;
  color: var(--text-primary, #1a1a1a);
  margin-bottom: 0.5rem;
}

.error-boundary__details pre {
  font-size: 0.875rem;
  color: var(--text-secondary, #667085);
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 暗色主题 */
[data-theme='dark'] .error-boundary__title {
  color: var(--text-primary, #ffffff);
}

[data-theme='dark'] .error-boundary__details {
  background-color: var(--bg-secondary, #121212);
}

[data-theme='dark'] .error-boundary__details summary {
  color: var(--text-primary, #ffffff);
}

/* 移动端适配 */
@media (max-width: 834px) {
  .error-boundary {
    min-height: 300px;
    padding: 1rem;
  }

  .error-boundary__title {
    font-size: 1.25rem;
  }

  .error-boundary__message {
    font-size: 0.875rem;
  }

  .error-boundary__actions {
    flex-direction: column;
  }

  .error-boundary__button {
    width: 100%;
  }
}
</style>
