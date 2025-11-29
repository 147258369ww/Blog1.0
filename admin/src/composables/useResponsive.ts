import { ref, computed, onMounted, onUnmounted } from 'vue'

// 断点定义
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1200,
  desktop: 1600,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * 响应式工具 Composable
 * 提供响应式断点检测和窗口尺寸监听
 */
export function useResponsive() {
  const windowWidth = ref(window.innerWidth)
  const windowHeight = ref(window.innerHeight)

  // 计算当前断点
  const currentBreakpoint = computed<Breakpoint>(() => {
    if (windowWidth.value < BREAKPOINTS.mobile) {
      return 'mobile'
    } else if (windowWidth.value < BREAKPOINTS.tablet) {
      return 'tablet'
    } else {
      return 'desktop'
    }
  })

  // 是否为移动设备
  const isMobile = computed(() => windowWidth.value < BREAKPOINTS.mobile)

  // 是否为平板设备
  const isTablet = computed(
    () => windowWidth.value >= BREAKPOINTS.mobile && windowWidth.value < BREAKPOINTS.tablet
  )

  // 是否为桌面设备
  const isDesktop = computed(() => windowWidth.value >= BREAKPOINTS.tablet)

  // 是否为宽屏设备
  const isWide = computed(() => windowWidth.value >= BREAKPOINTS.desktop)

  // 是否为触摸设备
  const isTouchDevice = computed(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })

  // 窗口尺寸变化处理
  const handleResize = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
  }

  // 生命周期
  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    windowWidth,
    windowHeight,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    isTouchDevice,
  }
}

/**
 * 媒体查询 Composable
 * 提供自定义媒体查询监听
 */
export function useMediaQuery(query: string) {
  const matches = ref(false)
  let mediaQuery: MediaQueryList | null = null

  const updateMatches = (e: MediaQueryListEvent | MediaQueryList) => {
    matches.value = e.matches
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(query)
    matches.value = mediaQuery.matches

    // 监听变化
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateMatches)
    } else {
      // 兼容旧版浏览器
      mediaQuery.addListener(updateMatches)
    }
  })

  onUnmounted(() => {
    if (mediaQuery) {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateMatches)
      } else {
        // 兼容旧版浏览器
        mediaQuery.removeListener(updateMatches)
      }
    }
  })

  return matches
}

/**
 * 屏幕方向 Composable
 */
export function useOrientation() {
  const isPortrait = ref(window.innerHeight > window.innerWidth)
  const isLandscape = computed(() => !isPortrait.value)

  const handleOrientationChange = () => {
    isPortrait.value = window.innerHeight > window.innerWidth
  }

  onMounted(() => {
    window.addEventListener('resize', handleOrientationChange)
    window.addEventListener('orientationchange', handleOrientationChange)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleOrientationChange)
    window.removeEventListener('orientationchange', handleOrientationChange)
  })

  return {
    isPortrait,
    isLandscape,
  }
}
