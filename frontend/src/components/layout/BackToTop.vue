<template>
  <Transition name="back-to-top">
    <button
      v-if="isVisible"
      class="back-to-top"
      @click="scrollToTop"
      aria-label="Back to top"
      :title="title"
    >
      <svg class="back-to-top__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface BackToTopProps {
  threshold?: number
  title?: string
}

const props = withDefaults(defineProps<BackToTopProps>(), {
  threshold: 300,
  title: 'Back to top'
})

const isVisible = ref(false)

const handleScroll = () => {
  isVisible.value = window.scrollY > props.threshold
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary-600, #7F56D9);
  color: #FFFFFF;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(127, 86, 217, 0.3);
  transition: all 0.3s ease;
  z-index: 999;
}

.back-to-top:hover {
  background-color: var(--color-primary-700, #6941C6);
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(127, 86, 217, 0.4);
}

.back-to-top:active {
  transform: translateY(-2px);
}

.back-to-top:focus-visible {
  outline: 2px solid var(--color-primary-600, #7F56D9);
  outline-offset: 4px;
}

.back-to-top__icon {
  width: 24px;
  height: 24px;
}

/* 动画 */
.back-to-top-enter-active,
.back-to-top-leave-active {
  transition: all 0.3s ease;
}

.back-to-top-enter-from,
.back-to-top-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

/* 移动端适配 */
@media (max-width: 834px) {
  .back-to-top {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 44px;
    height: 44px;
  }

  .back-to-top__icon {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 390px) {
  .back-to-top {
    bottom: 1rem;
    right: 1rem;
  }
}

/* Dark theme support */
[data-theme='dark'] .back-to-top {
  box-shadow: 0 4px 12px rgba(127, 86, 217, 0.5);
}

[data-theme='dark'] .back-to-top:hover {
  box-shadow: 0 6px 16px rgba(127, 86, 217, 0.6);
}
</style>
