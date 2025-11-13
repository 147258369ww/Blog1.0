<template>
  <div class="loading" :class="loadingClasses">
    <div class="loading__spinner">
      <svg 
        class="loading__svg" 
        viewBox="0 0 50 50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          class="loading__circle"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke-width="4"
        />
      </svg>
    </div>
    <p v-if="text" class="loading__text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  fullscreen: false
})

const loadingClasses = computed(() => [
  `loading--${props.size}`,
  {
    'loading--fullscreen': props.fullscreen
  }
])
</script>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.loading--fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 9998;
}

[data-theme="dark"] .loading--fullscreen {
  background-color: rgba(9, 13, 31, 0.9);
}

.loading__spinner {
  display: inline-block;
}

.loading__svg {
  animation: rotate 2s linear infinite;
}

.loading--sm .loading__svg {
  width: 24px;
  height: 24px;
}

.loading--md .loading__svg {
  width: 40px;
  height: 40px;
}

.loading--lg .loading__svg {
  width: 64px;
  height: 64px;
}

.loading__circle {
  stroke: var(--color-primary-600, #7F56D9);
  stroke-linecap: round;
  stroke-dasharray: 1, 150;
  stroke-dashoffset: 0;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

.loading__text {
  margin: 0;
  color: var(--text-secondary, #667085);
  font-size: 14px;
  font-weight: 500;
}

[data-theme="dark"] .loading__text {
  color: var(--text-secondary, #C0C5D0);
}
</style>
