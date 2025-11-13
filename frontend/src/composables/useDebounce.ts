import { ref, watch, type Ref } from 'vue'

/**
 * 防抖组合式函数
 * 用于延迟执行频繁触发的操作，如搜索输入
 * 
 * @param value - 需要防抖的响应式值
 * @param delay - 延迟时间（毫秒），默认 500ms
 * @returns 防抖后的响应式值
 */
export function useDebounce<T>(value: Ref<T>, delay = 500) {
  const debouncedValue = ref<T>(value.value) as Ref<T>
  let timeout: ReturnType<typeof setTimeout> | null = null

  watch(value, (newValue) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  return debouncedValue
}
