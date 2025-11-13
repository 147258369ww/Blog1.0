<template>
  <button
    @click="handleToggle"
    :aria-label="theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'"
    class="theme-toggle"
    type="button"
  >
    <!-- 太阳图标 (亮色模式) -->
    <svg
      v-if="theme === 'light'"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon"
    >
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>

    <!-- 月亮图标 (暗色模式) -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  </button>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'

/**
 * 主题切换按钮组件
 * 
 * 功能:
 * - 显示当前主题图标 (太阳/月亮)
 * - 点击切换主题
 * - 无障碍支持 (aria-label)
 */

const themeStore = useThemeStore()
const { theme } = storeToRefs(themeStore)

const handleToggle = () => {
  themeStore.toggleTheme()
}
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: var(--spacing-sm);
  background-color: transparent;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-primary);
}

.theme-toggle:hover {
  background-color: var(--bg-secondary);
  border-color: var(--border-secondary);
}

.theme-toggle:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(127, 86, 217, 0.1);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.icon {
  width: 20px;
  height: 20px;
  transition: transform var(--transition-fast);
}

.theme-toggle:hover .icon {
  transform: rotate(15deg);
}

/* 暗色模式下的特殊样式 */
[data-theme="dark"] .theme-toggle {
  border-color: var(--border-primary);
}

[data-theme="dark"] .theme-toggle:hover {
  background-color: var(--bg-tertiary);
}

/* 移动端优化 - 确保触摸目标足够大 */
@media (max-width: 834px) {
  .theme-toggle {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>
