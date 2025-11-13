<template>
  <Transition name="slide-down">
    <div v-if="!isOnline" class="network-status">
      <div class="network-status__content">
        <svg
          class="network-status__icon"
          width="20"
          height="20"
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
        <span class="network-status__text">网络连接已断开</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { errorHandler, ErrorLevel } from '@/utils/errorHandler'

const isOnline = ref(navigator.onLine)

const handleOnline = () => {
  isOnline.value = true
  errorHandler.log('网络连接已恢复', ErrorLevel.INFO)
}

const handleOffline = () => {
  isOnline.value = false
  errorHandler.log('网络连接已断开', ErrorLevel.WARNING)
}

onMounted(() => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>

<style scoped>
.network-status {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background-color: #f79009;
  color: white;
  padding: 0.75rem 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.network-status__content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.network-status__icon {
  flex-shrink: 0;
}

.network-status__text {
  font-size: 0.875rem;
  font-weight: 500;
}

/* 动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* 移动端适配 */
@media (max-width: 834px) {
  .network-status {
    padding: 0.5rem 1rem;
  }

  .network-status__text {
    font-size: 0.8125rem;
  }
}
</style>
