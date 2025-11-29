/**
 * 防抖工具 Composable
 * 用于优化频繁触发的操作，如搜索输入、窗口调整等
 *
 * @module composables/useDebounce
 */

import { ref, watch, type Ref } from 'vue'

/**
 * 防抖值
 * 将响应式值的变化延迟指定时间后才更新
 *
 * @param value - 原始响应式值
 * @param delay - 延迟时间（毫秒），默认 300ms
 * @returns 防抖后的响应式值
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue'
 * import { useDebounce } from '@/composables/useDebounce'
 *
 * const searchKeyword = ref('')
 * const debouncedKeyword = useDebounce(searchKeyword, 500)
 *
 * // 监听防抖后的值
 * watch(debouncedKeyword, (keyword) => {
 *   // 执行搜索
 *   searchArticles(keyword)
 * })
 * </script>
 *
 * <template>
 *   <el-input v-model="searchKeyword" placeholder="搜索..." />
 * </template>
 * ```
 */
export function useDebounce<T>(value: Ref<T>, delay = 300): Ref<T> {
  const debouncedValue = ref(value.value) as Ref<T>
  let timeout: ReturnType<typeof setTimeout> | null = null

  watch(
    value,
    newValue => {
      if (timeout) {
        clearTimeout(timeout)
      }

      timeout = setTimeout(() => {
        debouncedValue.value = newValue
        timeout = null
      }, delay)
    },
    { immediate: false }
  )

  return debouncedValue
}

/**
 * 防抖函数
 * 将函数的执行延迟指定时间，如果在延迟期间再次调用，则重新计时
 *
 * @param fn - 要防抖的函数
 * @param delay - 延迟时间（毫秒），默认 300ms
 * @returns 防抖后的函数
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useDebounceFn } from '@/composables/useDebounce'
 *
 * const handleSearch = useDebounceFn((keyword: string) => {
 *   console.log('搜索:', keyword)
 *   // 执行搜索逻辑
 * }, 500)
 * </script>
 *
 * <template>
 *   <el-input @input="handleSearch" placeholder="搜索..." />
 * </template>
 * ```
 */
export function useDebounceFn<T extends (...args: any[]) => unknown>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      fn.apply(this, args)
      timeout = null
    }, delay)
  }
}

/**
 * 节流值
 * 限制响应式值的更新频率，在指定时间内最多更新一次
 *
 * @param value - 原始响应式值
 * @param delay - 节流时间（毫秒），默认 300ms
 * @returns 节流后的响应式值
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue'
 * import { useThrottle } from '@/composables/useDebounce'
 *
 * const scrollPosition = ref(0)
 * const throttledPosition = useThrottle(scrollPosition, 100)
 *
 * watch(throttledPosition, (position) => {
 *   console.log('滚动位置:', position)
 * })
 * </script>
 * ```
 */
export function useThrottle<T>(value: Ref<T>, delay = 300): Ref<T> {
  const throttledValue = ref(value.value) as Ref<T>
  let lastUpdate = 0

  watch(
    value,
    newValue => {
      const now = Date.now()
      if (now - lastUpdate >= delay) {
        throttledValue.value = newValue
        lastUpdate = now
      }
    },
    { immediate: false }
  )

  return throttledValue
}

/**
 * 节流函数
 * 限制函数的执行频率，在指定时间内最多执行一次
 *
 * @param fn - 要节流的函数
 * @param delay - 节流时间（毫秒），默认 300ms
 * @returns 节流后的函数
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useThrottleFn } from '@/composables/useDebounce'
 *
 * const handleScroll = useThrottleFn(() => {
 *   console.log('滚动事件')
 * }, 100)
 *
 * onMounted(() => {
 *   window.addEventListener('scroll', handleScroll)
 * })
 * </script>
 * ```
 */
export function useThrottleFn<T extends (...args: any[]) => unknown>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      fn.apply(this, args)
      lastCall = now
    }
  }
}

export default useDebounce
