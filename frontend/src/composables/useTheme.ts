import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'
import type { Theme } from '@/stores/theme'

/**
 * 主题组合式函数
 * 
 * 提供便捷的主题访问和操作方法
 * 
 * @example
 * ```ts
 * const { theme, isDark, toggleTheme } = useTheme()
 * ```
 */
export function useTheme() {
  const themeStore = useThemeStore()
  const { theme, systemPreference } = storeToRefs(themeStore)

  /**
   * 是否为暗色主题
   */
  const isDark = computed(() => theme.value === 'dark')

  /**
   * 是否为亮色主题
   */
  const isLight = computed(() => theme.value === 'light')

  /**
   * 切换主题
   */
  const toggleTheme = () => {
    themeStore.toggleTheme()
  }

  /**
   * 设置主题
   */
  const setTheme = (newTheme: Theme) => {
    themeStore.setTheme(newTheme)
  }

  /**
   * 重置为系统主题
   */
  const resetToSystemTheme = () => {
    themeStore.resetToSystemTheme()
  }

  return {
    // State
    theme,
    systemPreference,
    isDark,
    isLight,

    // Actions
    toggleTheme,
    setTheme,
    resetToSystemTheme,
  }
}
