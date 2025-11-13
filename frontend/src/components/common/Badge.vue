<template>
  <span :class="badgeClasses">
    {{ text }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  text: string
  variant?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md'
})

const badgeClasses = computed(() => [
  'badge',
  `badge--${props.variant}`,
  `badge--${props.size}`
])
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: 16px;
  white-space: nowrap;
  transition: all 0.2s ease;
}

/* Size variants */
.badge--sm {
  padding: 2px 8px;
  font-size: 12px;
  line-height: 18px;
}

.badge--md {
  padding: 4px 12px;
  font-size: 14px;
  line-height: 20px;
}

.badge--lg {
  padding: 6px 16px;
  font-size: 16px;
  line-height: 24px;
}

/* Color variants - Light theme */
.badge--primary {
  background-color: #F9F5FF;
  color: #6941C6;
}

.badge--secondary {
  background-color: #EEF4FF;
  color: #3538CD;
}

.badge--success {
  background-color: #ECFDF3;
  color: #027A48;
}

.badge--info {
  background-color: #FDF2FA;
  color: #C11574;
}

.badge--warning {
  background-color: #FFFAEB;
  color: #B54708;
}

.badge--error {
  background-color: #FEF3F2;
  color: #C01048;
}

/* Dark theme support */
[data-theme="dark"] .badge--primary {
  background-color: rgba(127, 86, 217, 0.2);
  color: #D6BBFB;
}

[data-theme="dark"] .badge--secondary {
  background-color: rgba(53, 56, 205, 0.2);
  color: #B2CCFF;
}

[data-theme="dark"] .badge--success {
  background-color: rgba(2, 122, 72, 0.2);
  color: #6CE9A6;
}

[data-theme="dark"] .badge--info {
  background-color: rgba(193, 21, 116, 0.2);
  color: #FCCEEE;
}

[data-theme="dark"] .badge--warning {
  background-color: rgba(181, 71, 8, 0.2);
  color: #FEC84B;
}

[data-theme="dark"] .badge--error {
  background-color: rgba(192, 16, 72, 0.2);
  color: #FDA29B;
}

/* Responsive adjustments */
@media (max-width: 834px) {
  .badge--sm {
    font-size: 11px;
    padding: 2px 6px;
  }
  
  .badge--md {
    font-size: 13px;
    padding: 3px 10px;
  }
  
  .badge--lg {
    font-size: 15px;
    padding: 5px 14px;
  }
}
</style>
