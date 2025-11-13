import { onMounted, onUnmounted } from 'vue'

/**
 * 移动端优化组合式函数
 * 提供移动端特定的优化功能
 */

/**
 * 禁用双击缩放
 * 用于需要快速双击交互的组件
 */
export function useDisableDoubleTapZoom() {
  let lastTouchEnd = 0

  const preventDoubleTapZoom = (event: TouchEvent) => {
    const now = Date.now()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  }

  onMounted(() => {
    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false })
  })

  onUnmounted(() => {
    document.removeEventListener('touchend', preventDoubleTapZoom)
  })
}

/**
 * 优化滚动性能
 * 使用 passive 事件监听器
 */
export function usePassiveScroll(
  callback: (event: Event) => void,
  options: { throttle?: number } = {}
) {
  const { throttle = 100 } = options
  let lastCall = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const throttledCallback = (event: Event) => {
    const now = Date.now()
    if (now - lastCall >= throttle) {
      lastCall = now
      callback(event)
    } else {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        lastCall = Date.now()
        callback(event)
      }, throttle - (now - lastCall))
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', throttledCallback, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', throttledCallback)
    if (timeoutId) clearTimeout(timeoutId)
  })
}

/**
 * 检测设备类型
 */
export function useDeviceDetection() {
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  }

  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  }

  const isAndroid = () => {
    return /Android/.test(navigator.userAgent)
  }

  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }

  const getScreenSize = () => {
    const width = window.innerWidth
    if (width < 834) return 'mobile'
    if (width < 1440) return 'tablet'
    return 'desktop'
  }

  return {
    isMobile: isMobile(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    isTouchDevice: isTouchDevice(),
    screenSize: getScreenSize()
  }
}

/**
 * 优化触摸反馈
 * 添加触摸时的视觉反馈
 */
export function useTouchFeedback(elementRef: { value: HTMLElement | null }) {
  const handleTouchStart = () => {
    if (elementRef.value) {
      elementRef.value.style.opacity = '0.7'
      elementRef.value.style.transform = 'scale(0.98)'
    }
  }

  const handleTouchEnd = () => {
    if (elementRef.value) {
      elementRef.value.style.opacity = '1'
      elementRef.value.style.transform = 'scale(1)'
    }
  }

  onMounted(() => {
    if (elementRef.value) {
      elementRef.value.addEventListener('touchstart', handleTouchStart, { passive: true })
      elementRef.value.addEventListener('touchend', handleTouchEnd, { passive: true })
      elementRef.value.addEventListener('touchcancel', handleTouchEnd, { passive: true })
    }
  })

  onUnmounted(() => {
    if (elementRef.value) {
      elementRef.value.removeEventListener('touchstart', handleTouchStart)
      elementRef.value.removeEventListener('touchend', handleTouchEnd)
      elementRef.value.removeEventListener('touchcancel', handleTouchEnd)
    }
  })
}

/**
 * 防止滚动穿透
 * 用于模态框、抽屉等组件
 */
export function usePreventScrollThrough(isOpen: { value: boolean }) {
  const originalOverflow = document.body.style.overflow
  const originalPaddingRight = document.body.style.paddingRight

  const preventScroll = () => {
    // 获取滚动条宽度
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
  }

  const allowScroll = () => {
    document.body.style.overflow = originalOverflow
    document.body.style.paddingRight = originalPaddingRight
  }

  onMounted(() => {
    if (isOpen.value) {
      preventScroll()
    }
  })

  onUnmounted(() => {
    allowScroll()
  })

  return {
    preventScroll,
    allowScroll
  }
}

/**
 * 安全区域适配
 * 获取设备安全区域的内边距
 */
export function useSafeArea() {
  const getSafeAreaInsets = () => {
    const style = getComputedStyle(document.documentElement)
    
    return {
      top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
      right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
      bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
      left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0')
    }
  }

  return {
    safeAreaInsets: getSafeAreaInsets()
  }
}

/**
 * 长按手势识别
 */
export function useLongPress(
  callback: () => void,
  options: { duration?: number } = {}
) {
  const { duration = 500 } = options
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const onTouchStart = () => {
    timeoutId = setTimeout(() => {
      callback()
    }, duration)
  }

  const onTouchEnd = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  onUnmounted(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return {
    onTouchStart,
    onTouchEnd,
    onTouchMove: onTouchEnd, // 移动时取消长按
    onTouchCancel: onTouchEnd
  }
}
