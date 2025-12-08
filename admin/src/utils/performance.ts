/**
 * 性能监控工具
 * 用于监控和优化应用性能
 */

/**
 * 性能指标接口
 */
interface PerformanceMetrics {
  // 页面加载时间
  loadTime: number
  // DOM 就绪时间
  domReadyTime: number
  // 首次内容绘制时间
  firstContentfulPaint?: number
  // 最大内容绘制时间
  largestContentfulPaint?: number
  // 首次输入延迟
  firstInputDelay?: number
  // 累积布局偏移
  cumulativeLayoutShift?: number
}

/**
 * 获取性能指标
 */
export function getPerformanceMetrics(): PerformanceMetrics | null {
  if (!window.performance || !window.performance.timing) {
    return null
  }

  const timing = window.performance.timing

  // 计算基本指标
  const loadTime = timing.loadEventEnd - timing.navigationStart
  const domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart

  const metrics: PerformanceMetrics = {
    loadTime,
    domReadyTime,
  }

  // 获取 Web Vitals 指标
  if ('PerformanceObserver' in window) {
    try {
      // FCP - First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint')
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
      if (fcpEntry) {
        metrics.firstContentfulPaint = fcpEntry.startTime
      }

      // LCP - Largest Contentful Paint
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
      if (lcpEntries.length > 0) {
        const lastEntry = lcpEntries[lcpEntries.length - 1] as PerformanceEntry & {
          renderTime?: number
          loadTime?: number
        }
        metrics.largestContentfulPaint = lastEntry.renderTime || lastEntry.loadTime
      }
    } catch (error) {
      console.warn('获取性能指标失败:', error)
    }
  }

  return metrics
}

/**
 * 报告性能指标
 */
export function reportPerformance(): void {
  // 等待页面完全加载
  if (document.readyState !== 'complete') {
    window.addEventListener('load', reportPerformance, { once: true })
    return
  }

  const metrics = getPerformanceMetrics()
  if (!metrics) {
    return
  }

  console.group('📊 性能指标')
  console.log('页面加载时间:', `${metrics.loadTime}ms`)
  console.log('DOM 就绪时间:', `${metrics.domReadyTime}ms`)

  if (metrics.firstContentfulPaint) {
    console.log('首次内容绘制 (FCP):', `${metrics.firstContentfulPaint.toFixed(2)}ms`)
  }

  if (metrics.largestContentfulPaint) {
    console.log('最大内容绘制 (LCP):', `${metrics.largestContentfulPaint.toFixed(2)}ms`)
  }

  console.groupEnd()

  // 在开发环境下显示性能警告
  if (import.meta.env.DEV) {
    if (metrics.loadTime > 3000) {
      console.warn('⚠️ 页面加载时间超过 3 秒，建议优化')
    }

    if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > 2500) {
      console.warn('⚠️ LCP 超过 2.5 秒，建议优化')
    }
  }

  // 在生产环境下可以上报到监控服务
  // if (import.meta.env.PROD) {
  //   reportToMonitoring(metrics)
  // }
}

/**
 * 监控 Web Vitals
 */
export function observeWebVitals(): void {
  if (!('PerformanceObserver' in window)) {
    return
  }

  try {
    // 监控 LCP
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        renderTime?: number
        loadTime?: number
      }
      const lcp = lastEntry.renderTime ?? lastEntry.loadTime

      if (import.meta.env.DEV && typeof lcp === 'number') {
        console.log('LCP:', `${lcp.toFixed(2)}ms`)
      }
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // 监控 FID
    const fidObserver = new PerformanceObserver(list => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        const fid = entry.processingStart - entry.startTime

        if (import.meta.env.DEV) {
          console.log('FID:', `${fid.toFixed(2)}ms`)
        }
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    // 监控 CLS
    let clsValue = 0
    const clsObserver = new PerformanceObserver(list => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })

      if (import.meta.env.DEV) {
        console.log('CLS:', clsValue.toFixed(4))
      }
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
  } catch (error) {
    console.warn('Web Vitals 监控失败:', error)
  }
}

/**
 * 测量函数执行时间
 */
export function measureTime<T extends (...args: any[]) => any>(
  fn: T,
  label?: string
): (...args: Parameters<T>) => ReturnType<T> {
  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const start = performance.now()
    const result = fn.apply(this, args)
    const end = performance.now()
    const duration = end - start

    const fnLabel = label || fn.name || '匿名函数'
    console.log(`⏱️ ${fnLabel} 执行时间: ${duration.toFixed(2)}ms`)

    return result
  }
}

/**
 * 测量异步函数执行时间
 */
export function measureAsyncTime<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  label?: string
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  return async function (this: any, ...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
    const start = performance.now()
    const result = await fn.apply(this, args)
    const end = performance.now()
    const duration = end - start

    const fnLabel = label || fn.name || '匿名函数'
    console.log(`⏱️ ${fnLabel} 执行时间: ${duration.toFixed(2)}ms`)

    return result
  }
}

/**
 * 标记性能时间点
 */
export function mark(name: string): void {
  if (window.performance && typeof window.performance.mark === 'function') {
    performance.mark(name)
  }
}

/**
 * 测量两个时间点之间的时间
 */
export function measure(name: string, startMark: string, endMark: string): number | null {
  if (window.performance && typeof window.performance.measure === 'function') {
    try {
      performance.measure(name, startMark, endMark)
      const measures = performance.getEntriesByName(name, 'measure')
      if (measures && measures.length > 0 && measures[0]) {
        const duration = measures[0].duration
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
        return duration
      }
    } catch (error) {
      console.warn('性能测量失败:', error)
    }
  }
  return null
}

/**
 * 清除性能标记
 */
export function clearMarks(name?: string): void {
  if (window.performance && typeof window.performance.clearMarks === 'function') {
    performance.clearMarks(name)
  }
}

/**
 * 清除性能测量
 */
export function clearMeasures(name?: string): void {
  if (window.performance && typeof window.performance.clearMeasures === 'function') {
    performance.clearMeasures(name)
  }
}

/**
 * 获取资源加载性能
 */
export function getResourceTiming(): PerformanceResourceTiming[] {
  if (window.performance && typeof window.performance.getEntriesByType === 'function') {
    return performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  }
  return []
}

/**
 * 分析资源加载性能
 */
export function analyzeResourceTiming(): void {
  const resources = getResourceTiming()

  if (resources.length === 0) {
    return
  }

  console.group('📦 资源加载分析')

  // 按类型分组
  const resourcesByType = resources.reduce(
    (acc, resource) => {
      const type = resource.initiatorType
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(resource)
      return acc
    },
    {} as Record<string, PerformanceResourceTiming[]>
  )

  // 输出每种类型的统计
  Object.entries(resourcesByType).forEach(([type, items]) => {
    const totalDuration = items.reduce((sum, item) => sum + item.duration, 0)
    const avgDuration = totalDuration / items.length

    console.log(`${type}:`, {
      数量: items.length,
      总时间: `${totalDuration.toFixed(2)}ms`,
      平均时间: `${avgDuration.toFixed(2)}ms`,
    })
  })

  // 找出加载最慢的资源
  const slowestResources = resources
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5)
    .map(resource => ({
      名称: resource.name.split('/').pop(),
      类型: resource.initiatorType,
      时间: `${resource.duration.toFixed(2)}ms`,
    }))

  console.log('加载最慢的 5 个资源:', slowestResources)

  console.groupEnd()
}

/**
 * 检查首屏加载时间是否符合要求
 */
export function checkFirstScreenLoadTime(): void {
  const metrics = getPerformanceMetrics()
  if (!metrics) return

  const firstScreenTime = metrics.largestContentfulPaint || metrics.domReadyTime

  console.group('🚀 首屏加载性能检查')
  console.log('首屏加载时间:', `${firstScreenTime.toFixed(2)}ms`)

  if (firstScreenTime < 3000) {
    console.log('✅ 首屏加载时间符合要求 (< 3秒)')
  } else {
    console.warn('⚠️ 首屏加载时间超过 3 秒，需要优化')
    console.log('优化建议:')
    console.log('1. 检查是否有大文件未压缩')
    console.log('2. 确认图片是否使用懒加载')
    console.log('3. 检查是否有阻塞渲染的资源')
    console.log('4. 考虑使用 CDN 加速静态资源')
  }

  console.groupEnd()
}

/**
 * 初始化性能监控
 */
export function initPerformanceMonitoring(): void {
  // 只在开发环境启用详细监控
  if (import.meta.env.DEV) {
    // 页面加载完成后报告性能
    if (document.readyState === 'complete') {
      reportPerformance()
      checkFirstScreenLoadTime()
    } else {
      window.addEventListener(
        'load',
        () => {
          reportPerformance()
          checkFirstScreenLoadTime()
        },
        { once: true }
      )
    }

    // 监控 Web Vitals
    observeWebVitals()

    // 5 秒后分析资源加载
    setTimeout(() => {
      analyzeResourceTiming()
    }, 5000)
  }
}

export default {
  getPerformanceMetrics,
  reportPerformance,
  observeWebVitals,
  measureTime,
  measureAsyncTime,
  mark,
  measure,
  clearMarks,
  clearMeasures,
  getResourceTiming,
  analyzeResourceTiming,
  initPerformanceMonitoring,
}
