import { ref } from 'vue'

export type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null

/**
 * 触摸手势识别组合式函数
 * 识别左右上下滑动手势，优化移动端交互体验
 * 
 * @param options - 配置选项
 * @param options.minSwipeDistance - 最小滑动距离（像素），默认 50px
 * @returns 触摸事件处理函数和滑动方向
 */
export function useTouch(options: { minSwipeDistance?: number } = {}) {
  const { minSwipeDistance = 50 } = options

  const startX = ref(0)
  const startY = ref(0)
  const endX = ref(0)
  const endY = ref(0)
  const direction = ref<SwipeDirection>(null)

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches[0]) {
      startX.value = e.touches[0].clientX
      startY.value = e.touches[0].clientY
      direction.value = null
    }
  }

  const onTouchEnd = (e: TouchEvent) => {
    if (e.changedTouches[0]) {
      endX.value = e.changedTouches[0].clientX
      endY.value = e.changedTouches[0].clientY
      direction.value = handleSwipe()
    }
  }

  const handleSwipe = (): SwipeDirection => {
    const diffX = endX.value - startX.value
    const diffY = endY.value - startY.value

    // 水平滑动
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
      return diffX > 0 ? 'right' : 'left'
    }

    // 垂直滑动
    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > minSwipeDistance) {
      return diffY > 0 ? 'down' : 'up'
    }

    return null
  }

  return {
    direction,
    onTouchStart,
    onTouchEnd,
  }
}
