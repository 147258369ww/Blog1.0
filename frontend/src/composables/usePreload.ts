import { onMounted, onUnmounted, type Ref } from 'vue'
import { useRouter, type RouteLocationRaw } from 'vue-router'

/**
 * 预加载策略组合式函数
 * 
 * 功能:
 * - 预加载路由组件
 * - 预加载关键资源
 * - 优化首屏加载性能
 */

/**
 * 预加载路由组件
 * @param routeName 路由名称或路由配置
 */
export function usePrefetchRoute(routeName: string | RouteLocationRaw) {
  const router = useRouter()

  onMounted(() => {
    // 使用 requestIdleCallback 在浏览器空闲时预加载
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        prefetchRoute(router, routeName)
      })
    } else {
      // 降级方案: 使用 setTimeout
      setTimeout(() => {
        prefetchRoute(router, routeName)
      }, 1000)
    }
  })
}

/**
 * 预加载多个路由
 * @param routeNames 路由名称数组
 */
export function usePrefetchRoutes(routeNames: string[]) {
  const router = useRouter()

  onMounted(() => {
    if ('requestIdleCallback' in window) {
      routeNames.forEach((routeName, index) => {
        requestIdleCallback(() => {
          prefetchRoute(router, routeName)
        }, { timeout: 2000 + index * 500 })
      })
    } else {
      routeNames.forEach((routeName, index) => {
        setTimeout(() => {
          prefetchRoute(router, routeName)
        }, 1000 + index * 500)
      })
    }
  })
}

/**
 * 预加载图片
 * @param imageUrls 图片URL数组
 */
export function usePreloadImages(imageUrls: string[]) {
  onMounted(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        preloadImages(imageUrls)
      })
    } else {
      setTimeout(() => {
        preloadImages(imageUrls)
      }, 1000)
    }
  })
}

/**
 * 预加载字体
 * @param fontUrls 字体URL数组
 */
export function usePreloadFonts(fontUrls: string[]) {
  onMounted(() => {
    preloadFonts(fontUrls)
  })
}

// 辅助函数

function prefetchRoute(router: any, routeName: string | RouteLocationRaw) {
  try {
    const route = typeof routeName === 'string' 
      ? router.resolve({ name: routeName })
      : router.resolve(routeName)
    
    if (route.matched.length > 0) {
      route.matched.forEach((record: any) => {
        if (record.components) {
          Object.values(record.components).forEach((component: any) => {
            if (typeof component === 'function') {
              component()
            }
          })
        }
      })
    }
  } catch (error) {
    console.warn('Failed to prefetch route:', routeName, error)
  }
}

function preloadImages(imageUrls: string[]) {
  imageUrls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = url
    document.head.appendChild(link)
  })
}

function preloadFonts(fontUrls: string[]) {
  fontUrls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.type = 'font/woff2'
    link.href = url
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

/**
 * 预连接到外部域名
 * @param domains 域名数组
 */
export function usePreconnect(domains: string[]) {
  onMounted(() => {
    domains.forEach(domain => {
      // DNS预解析
      const dnsPrefetch = document.createElement('link')
      dnsPrefetch.rel = 'dns-prefetch'
      dnsPrefetch.href = domain
      document.head.appendChild(dnsPrefetch)

      // 预连接
      const preconnect = document.createElement('link')
      preconnect.rel = 'preconnect'
      preconnect.href = domain
      preconnect.crossOrigin = 'anonymous'
      document.head.appendChild(preconnect)
    })
  })
}

/**
 * 智能预加载: 根据用户行为预测并预加载
 * @param targetElement 目标元素引用
 * @param routeName 要预加载的路由
 */
export function useSmartPrefetch(
  targetElement: Ref<HTMLElement | null>,
  routeName: string
) {
  const router = useRouter()
  let prefetched = false

  onMounted(() => {
    if (!targetElement.value) return

    // 鼠标悬停时预加载
    const handleMouseEnter = () => {
      if (!prefetched) {
        prefetchRoute(router, routeName)
        prefetched = true
      }
    }

    // 触摸开始时预加载 (移动端)
    const handleTouchStart = () => {
      if (!prefetched) {
        prefetchRoute(router, routeName)
        prefetched = true
      }
    }

    targetElement.value.addEventListener('mouseenter', handleMouseEnter)
    targetElement.value.addEventListener('touchstart', handleTouchStart, { passive: true })

    // 清理
    onUnmounted(() => {
      targetElement.value?.removeEventListener('mouseenter', handleMouseEnter)
      targetElement.value?.removeEventListener('touchstart', handleTouchStart)
    })
  })
}
