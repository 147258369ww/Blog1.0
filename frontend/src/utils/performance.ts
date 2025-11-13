/**
 * 性能优化工具函数
 * 
 * 功能:
 * - 资源预加载
 * - 性能监控
 * - 优化建议
 */

/**
 * 图片优化配置
 */
export interface ImageOptimizationOptions {
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
  width?: number
  height?: number
}

/**
 * 获取优化后的图片URL
 * @param url 原始图片URL
 * @param options 优化选项
 * @returns 优化后的URL
 */
export function getOptimizedImageUrl(
  url: string,
  options: ImageOptimizationOptions = {}
): string {
  if (!url) return ''

  const { quality = 80, format, width, height } = options
  const params = new URLSearchParams()

  if (quality) params.append('q', quality.toString())
  if (format) params.append('fm', format)
  if (width) params.append('w', width.toString())
  if (height) params.append('h', height.toString())

  const separator = url.includes('?') ? '&' : '?'
  return params.toString() ? `${url}${separator}${params.toString()}` : url
}

/**
 * 获取响应式图片srcset
 * @param url 原始图片URL
 * @param widths 宽度数组
 * @returns srcset字符串
 */
export function getResponsiveImageSrcset(
  url: string,
  widths: number[] = [390, 834, 1440, 1920]
): string {
  return widths
    .map(width => `${getOptimizedImageUrl(url, { width })} ${width}w`)
    .join(', ')
}

/**
 * 性能监控: 测量首次内容绘制 (FCP)
 */
export function measureFCP(): Promise<number> {
  return new Promise((resolve) => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
        if (fcpEntry) {
          resolve(fcpEntry.startTime)
          observer.disconnect()
        }
      })
      observer.observe({ entryTypes: ['paint'] })
    } else {
      resolve(0)
    }
  })
}

/**
 * 性能监控: 测量最大内容绘制 (LCP)
 */
export function measureLCP(): Promise<number> {
  return new Promise((resolve) => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        if (lastEntry) {
          resolve(lastEntry.startTime)
        }
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })

      // 10秒后停止观察
      setTimeout(() => {
        observer.disconnect()
      }, 10000)
    } else {
      resolve(0)
    }
  })
}

/**
 * 性能监控: 测量首次输入延迟 (FID)
 */
export function measureFID(): Promise<number> {
  return new Promise((resolve) => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const firstInput = entries[0] as any
        if (firstInput && firstInput.processingStart) {
          const fid = firstInput.processingStart - firstInput.startTime
          resolve(fid)
          observer.disconnect()
        }
      })
      observer.observe({ entryTypes: ['first-input'] })
    } else {
      resolve(0)
    }
  })
}

/**
 * 性能监控: 测量累积布局偏移 (CLS)
 */
export function measureCLS(): Promise<number> {
  return new Promise((resolve) => {
    if ('PerformanceObserver' in window) {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
      })
      observer.observe({ entryTypes: ['layout-shift'] })

      // 10秒后返回结果
      setTimeout(() => {
        observer.disconnect()
        resolve(clsValue)
      }, 10000)
    } else {
      resolve(0)
    }
  })
}

/**
 * 获取所有核心Web指标
 */
export async function getCoreWebVitals() {
  const [fcp, lcp, fid, cls] = await Promise.all([
    measureFCP(),
    measureLCP(),
    measureFID(),
    measureCLS()
  ])

  return {
    fcp: Math.round(fcp),
    lcp: Math.round(lcp),
    fid: Math.round(fid),
    cls: Math.round(cls * 1000) / 1000
  }
}

/**
 * 检测网络连接质量
 */
export function getNetworkQuality(): 'slow' | 'medium' | 'fast' {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    const effectiveType = connection?.effectiveType

    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      return 'slow'
    } else if (effectiveType === '3g') {
      return 'medium'
    } else {
      return 'fast'
    }
  }

  return 'fast' // 默认假设快速网络
}

/**
 * 检测是否为低端设备
 */
export function isLowEndDevice(): boolean {
  if ('deviceMemory' in navigator) {
    // 设备内存小于4GB视为低端设备
    return (navigator as any).deviceMemory < 4
  }

  if ('hardwareConcurrency' in navigator) {
    // CPU核心数小于4视为低端设备
    return navigator.hardwareConcurrency < 4
  }

  return false
}

/**
 * 根据设备和网络条件调整图片质量
 */
export function getAdaptiveImageQuality(): number {
  const networkQuality = getNetworkQuality()
  const isLowEnd = isLowEndDevice()

  if (networkQuality === 'slow' || isLowEnd) {
    return 60 // 低质量
  } else if (networkQuality === 'medium') {
    return 75 // 中等质量
  } else {
    return 85 // 高质量
  }
}

/**
 * 延迟执行函数 (使用 requestIdleCallback)
 */
export function runWhenIdle(callback: () => void, timeout = 2000) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout })
  } else {
    setTimeout(callback, 1)
  }
}

/**
 * 批量执行任务 (避免阻塞主线程)
 */
export async function batchExecute<T>(
  items: T[],
  callback: (item: T) => void | Promise<void>,
  batchSize = 10
) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    
    await Promise.all(batch.map(item => callback(item)))
    
    // 让出主线程
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}

/**
 * 记录性能指标到控制台 (仅开发环境)
 */
export function logPerformanceMetrics() {
  if (import.meta.env.DEV) {
    getCoreWebVitals().then(metrics => {
      console.group('📊 Core Web Vitals')
      console.log('FCP (First Contentful Paint):', metrics.fcp, 'ms')
      console.log('LCP (Largest Contentful Paint):', metrics.lcp, 'ms')
      console.log('FID (First Input Delay):', metrics.fid, 'ms')
      console.log('CLS (Cumulative Layout Shift):', metrics.cls)
      console.groupEnd()

      console.group('🌐 Network & Device')
      console.log('Network Quality:', getNetworkQuality())
      console.log('Low-end Device:', isLowEndDevice())
      console.log('Adaptive Image Quality:', getAdaptiveImageQuality())
      console.groupEnd()
    })
  }
}
