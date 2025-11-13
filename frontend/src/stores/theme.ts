import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

/**
 * 主题类型
 */
export type Theme = 'light' | 'dark'

/**
 * 主题状态管理 Store
 * 
 * 功能:
 * - 主题状态管理 (light/dark)
 * - 主题切换功能
 * - localStorage 持久化
 * - 系统主题偏好检测
 */
export const useThemeStore = defineStore('theme', () => {
  // State
  const theme = ref<Theme>('light')
  const systemPreference = ref<Theme>('light')

  /**
   * 检测系统主题偏好
   */
  const detectSystemPreference = (): Theme => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  /**
   * 应用主题到 DOM
   * @param newTheme 要应用的主题
   */
  const applyTheme = (newTheme: Theme) => {
    document.documentElement.setAttribute('data-theme', newTheme)
    
    // 更新 meta theme-color 标签以适配移动端浏览器
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        newTheme === 'dark' ? '#090D1F' : '#FFFFFF'
      )
    }
  }

  /**
   * 切换主题
   */
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  /**
   * 设置主题
   * @param newTheme 要设置的主题
   */
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
  }

  /**
   * 初始化主题
   * 优先级: localStorage > 系统偏好 > 默认(light)
   */
  const initTheme = () => {
    // 检测系统偏好
    systemPreference.value = detectSystemPreference()

    // 从 localStorage 读取保存的主题
    const savedTheme = localStorage.getItem('theme') as Theme | null

    // 确定要使用的主题
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      theme.value = savedTheme
    } else {
      theme.value = systemPreference.value
    }

    // 应用主题
    applyTheme(theme.value)

    // 监听系统主题变化
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      // 使用现代 API
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', (e) => {
          systemPreference.value = e.matches ? 'dark' : 'light'
          
          // 如果用户没有手动设置过主题，跟随系统
          if (!localStorage.getItem('theme')) {
            theme.value = systemPreference.value
          }
        })
      } else {
        // 兼容旧版浏览器
        mediaQuery.addListener((e) => {
          systemPreference.value = e.matches ? 'dark' : 'light'
          
          if (!localStorage.getItem('theme')) {
            theme.value = systemPreference.value
          }
        })
      }
    }
  }

  /**
   * 重置为系统主题
   */
  const resetToSystemTheme = () => {
    localStorage.removeItem('theme')
    theme.value = systemPreference.value
  }

  // 监听主题变化，自动保存到 localStorage 并应用到 DOM
  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  })

  return {
    // State
    theme,
    systemPreference,

    // Actions
    toggleTheme,
    setTheme,
    initTheme,
    resetToSystemTheme,
  }
})
