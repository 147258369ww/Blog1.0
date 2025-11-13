<template>
  <div class="error-state">
    <div class="error-state__content">
      <!-- 错误图标 -->
      <div class="error-state__icon">
        <svg
          v-if="type === 'network'"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"
            fill="currentColor"
          />
          <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" />
        </svg>
        <svg
          v-else-if="type === 'server'"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
            fill="currentColor"
          />
        </svg>
        <svg
          v-else
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

      <!-- 错误标题 -->
      <h3 class="error-state__title">{{ title }}</h3>

      <!-- 错误消息 -->
      <p class="error-state__message">{{ message }}</p>

      <!-- 操作按钮 -->
      <div class="error-state__actions">
        <RetryButton v-if="showRetry" :on-retry="handleRetry" />
        <button
          v-if="showGoBack"
          class="error-state__button error-state__button--secondary"
          @click="handleGoBack"
        >
          返回
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import RetryButton from './RetryButton.vue'

interface Props {
  type?: 'network' | 'server' | 'general'
  title?: string
  message?: string
  showRetry?: boolean
  showGoBack?: boolean
  onRetry?: () => Promise<void> | void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'general',
  title: '出错了',
  message: '抱歉，加载失败。请稍后重试。',
  showRetry: true,
  showGoBack: false,
})

const router = useRouter()

const handleRetry = async () => {
  if (props.onRetry) {
    await props.onRetry()
  } else {
    // 默认刷新页面
    window.location.reload()
  }
}

const handleGoBack = () => {
  router.back()
}
</script>

<style scoped>
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
}

.error-state__content {
  max-width: 500px;
  text-align: center;
}

.error-state__icon {
  color: var(--color-error-700, #c01048);
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.error-state__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
  margin-bottom: 0.5rem;
}

.error-state__message {
  font-size: 1rem;
  color: var(--text-secondary, #667085);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-state__actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.error-state__button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
}

.error-state__button--secondary {
  background-color: var(--color-gray-300, #d0d5dd);
  color: var(--text-primary, #1a1a1a);
}

.error-state__button--secondary:hover {
  background-color: var(--color-gray-500, #667085);
  color: white;
}

/* 暗色主题 */
[data-theme='dark'] .error-state__title {
  color: var(--text-primary, #ffffff);
}

/* 移动端适配 */
@media (max-width: 834px) {
  .error-state {
    min-height: 300px;
    padding: 1rem;
  }

  .error-state__title {
    font-size: 1.25rem;
  }

  .error-state__message {
    font-size: 0.875rem;
  }

  .error-state__actions {
    flex-direction: column;
    width: 100%;
  }

  .error-state__button {
    width: 100%;
  }
}
</style>
