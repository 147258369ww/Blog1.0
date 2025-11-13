<template>
  <button
    class="retry-button"
    :class="{ 'retry-button--loading': isLoading }"
    :disabled="isLoading"
    @click="handleRetry"
  >
    <svg
      v-if="isLoading"
      class="retry-button__spinner"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        class="retry-button__spinner-circle"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
    </svg>
    <svg
      v-else
      class="retry-button__icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
        fill="currentColor"
      />
    </svg>
    <span class="retry-button__text">{{ isLoading ? loadingText : text }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  text?: string
  loadingText?: string
  onRetry: () => Promise<void> | void
}

const props = withDefaults(defineProps<Props>(), {
  text: '重试',
  loadingText: '重试中...',
})

const isLoading = ref(false)

const handleRetry = async () => {
  if (isLoading.value) return

  isLoading.value = true
  try {
    await props.onRetry()
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: white;
  background-color: var(--color-primary-600, #7f56d9);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
}

.retry-button:hover:not(:disabled) {
  background-color: var(--color-primary-700, #6941c6);
  transform: translateY(-1px);
}

.retry-button:active:not(:disabled) {
  transform: translateY(0);
}

.retry-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.retry-button--loading {
  pointer-events: none;
}

.retry-button__icon,
.retry-button__spinner {
  flex-shrink: 0;
}

.retry-button__spinner {
  animation: spin 1s linear infinite;
}

.retry-button__spinner-circle {
  stroke-dasharray: 60;
  stroke-dashoffset: 45;
  stroke-linecap: round;
  fill: none;
}

.retry-button__text {
  white-space: nowrap;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 移动端适配 */
@media (max-width: 834px) {
  .retry-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
