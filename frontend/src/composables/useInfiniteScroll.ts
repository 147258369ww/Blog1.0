import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 无限滚动组合式函数
 * 当用户滚动到页面底部时触发回调函数
 * 
 * @param callback - 滚动到底部时触发的回调函数
 * @param options - 配置选项
 * @param options.threshold - 距离底部的阈值（像素），默认 100px
 * @returns 加载状态和是否还有更多数据的标志
 */
export function useInfiniteScroll(
  callback: () => void,
  options: { threshold?: number } = {}
) {
  const { threshold = 100 } = options
  const isLoading = ref(false)
  const hasMore = ref(true)

  const handleScroll = () => {
    if (isLoading.value || !hasMore.value) return

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = document.documentElement.clientHeight

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      callback()
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return { isLoading, hasMore }
}
