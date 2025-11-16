<template>
  <RouterLink 
    :to="`/categories/${category.id}`"
    class="category-badge"
    :style="badgeStyle"
  >
    {{ category.name }}
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Category } from '@/types/models'

interface Props {
  category: Category
}

const props = defineProps<Props>()

// Generate dynamic styles based on category color
const badgeStyle = computed(() => {
  const color = props.category.color || '#7F56D9'
  
  // Convert hex to RGB for alpha transparency
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1]!, 16),
      g: parseInt(result[2]!, 16),
      b: parseInt(result[3]!, 16)
    } : { r: 127, g: 86, b: 217 }
  }
  
  const rgb = hexToRgb(color)
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  
  return {
    '--badge-bg': isDark 
      ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` 
      : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
    '--badge-color': color,
    '--badge-hover-bg': isDark
      ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
      : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`
  }
})
</script>

<style scoped>
.category-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  border-radius: 16px;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.2s ease;
  background-color: var(--badge-bg);
  color: var(--badge-color);
  cursor: pointer;
}

.category-badge:hover {
  background-color: var(--badge-hover-bg);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-badge:active {
  transform: translateY(0);
}

/* Focus state for accessibility */
.category-badge:focus {
  outline: 2px solid var(--badge-color);
  outline-offset: 2px;
}

/* Dark theme adjustments */
[data-theme="dark"] .category-badge:hover {
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
}

/* Responsive adjustments */
@media (max-width: 834px) {
  .category-badge {
    font-size: 13px;
    padding: 3px 10px;
  }
}

@media (max-width: 390px) {
  .category-badge {
    font-size: 12px;
    padding: 2px 8px;
  }
}
</style>
