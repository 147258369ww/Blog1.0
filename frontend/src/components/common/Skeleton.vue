<template>
  <div class="skeleton" :class="skeletonClasses" :style="skeletonStyles">
    <div class="skeleton__shimmer"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  animation: 'wave'
})

const skeletonClasses = computed(() => [
  'skeleton',
  `skeleton--${props.variant}`,
  `skeleton--${props.animation}`
])

const skeletonStyles = computed(() => {
  const styles: Record<string, string> = {}
  
  if (props.width) {
    styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  
  if (props.height) {
    styles.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  
  return styles
})
</script>

<style scoped>
.skeleton {
  position: relative;
  display: block;
  background-color: var(--color-gray-300, #D0D5DD);
  overflow: hidden;
}

.skeleton--text {
  height: 1em;
  border-radius: 4px;
  transform: scale(1, 0.6);
}

.skeleton--circular {
  border-radius: 50%;
}

.skeleton--rectangular {
  border-radius: 0;
}

.skeleton--rounded {
  border-radius: 8px;
}

/* Animation variants */
.skeleton--pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton--wave .skeleton__shimmer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: wave 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

@keyframes wave {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Dark theme */
[data-theme="dark"] .skeleton {
  background-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .skeleton--wave .skeleton__shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
}
</style>
