/**
 * 性能测试工具
 * 用于测试页面加载速度、图片懒加载、代码分割和缓存策略
 */

export interface PerformanceTestResult {
  category: string
  metric: string
  value: number | string
  status: 'success' | 'warning' | 'error'
  message: string
  threshold?: number
}

export class PerformanceTester {
  private results: PerformanceTestResult[] = []

  /**
   * 运行所有性能测试
   */
  async runAllTests(): Promise<PerformanceTestResult[]> {
    this.results = []

    console.log('⚡ 开始性能测试...')

    // 测试页面加载性能
    await this.testPageLoadPerformance()

    // 测试资源加载
    await this.testResourceLoading()

    // 测试代码分割
    await this.testCodeSplitting()

    // 测试缓存策略
    await this.testCacheStrategy()

    // 测试图片懒加载
    await this.testImageLazyLoading()

    // 生成报告
    this.generateReport()

    return this.results
  }

  /**
   * 测试页面加载性能
   */
  private async testPageLoadPerformance() {
    try {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

      if (!perfData) {
        this.addResult(
          '页面加载',
          'Navigation Timing',
          0,
          'warning',
          'Navigation Timing API 不可用'
        )
        return
      }

      // DNS 查询时间
      const dnsTime = perfData.domainLookupEnd - perfData.domainLookupStart
      this.addResult(
        '页面加载',
        'DNS 查询时间',
        Math.round(dnsTime),
        dnsTime < 100 ? 'success' : 'warning',
        `DNS 查询耗时 ${Math.round(dnsTime)}ms`,
        100
      )

      // TCP 连接时间
      const tcpTime = perfData.connectEnd - perfData.connectStart
      this.addResult(
        '页面加载',
        'TCP 连接时间',
        Math.round(tcpTime),
        tcpTime < 200 ? 'success' : 'warning',
        `TCP 连接耗时 ${Math.round(tcpTime)}ms`,
        200
      )

      // 请求响应时间
      const requestTime = perfData.responseEnd - perfData.requestStart
      this.addResult(
        '页面加载',
        '请求响应时间',
        Math.round(requestTime),
        requestTime < 500 ? 'success' : 'warning',
        `请求响应耗时 ${Math.round(requestTime)}ms`,
        500
      )

      // DOM 解析时间
      const domParseTime = perfData.domInteractive - perfData.fetchStart
      this.addResult(
        '页面加载',
        'DOM 解析时间',
        Math.round(domParseTime),
        domParseTime < 1000 ? 'success' : 'warning',
        `DOM 解析耗时 ${Math.round(domParseTime)}ms`,
        1000
      )

      // DOM 内容加载完成时间
      const domContentLoadedTime = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart
      this.addResult(
        '页面加载',
        'DOMContentLoaded',
        Math.round(domContentLoadedTime),
        domContentLoadedTime < 100 ? 'success' : 'warning',
        `DOMContentLoaded 耗时 ${Math.round(domContentLoadedTime)}ms`,
        100
      )

      // 页面完全加载时间
      const loadTime = perfData.loadEventEnd - perfData.loadEventStart
      this.addResult(
        '页面加载',
        'Load Event',
        Math.round(loadTime),
        loadTime < 200 ? 'success' : 'warning',
        `Load Event 耗时 ${Math.round(loadTime)}ms`,
        200
      )

      // 总加载时间
      const totalTime = perfData.loadEventEnd - perfData.fetchStart
      this.addResult(
        '页面加载',
        '总加载时间',
        Math.round(totalTime),
        totalTime < 3000 ? 'success' : totalTime < 5000 ? 'warning' : 'error',
        `页面总加载时间 ${Math.round(totalTime)}ms`,
        3000
      )

      // First Paint (FP)
      const fpEntry = performance.getEntriesByName('first-paint')[0]
      if (fpEntry) {
        const fp = fpEntry.startTime
        this.addResult(
          '页面加载',
          'First Paint (FP)',
          Math.round(fp),
          fp < 1000 ? 'success' : fp < 2000 ? 'warning' : 'error',
          `首次绘制时间 ${Math.round(fp)}ms`,
          1000
        )
      }

      // First Contentful Paint (FCP)
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0]
      if (fcpEntry) {
        const fcp = fcpEntry.startTime
        this.addResult(
          '页面加载',
          'First Contentful Paint (FCP)',
          Math.round(fcp),
          fcp < 1800 ? 'success' : fcp < 3000 ? 'warning' : 'error',
          `首次内容绘制时间 ${Math.round(fcp)}ms`,
          1800
        )
      }

      // Largest Contentful Paint (LCP)
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
      if (lcpEntries.length > 0) {
        const lcpEntry = lcpEntries[lcpEntries.length - 1]
        if (lcpEntry && lcpEntry.startTime !== undefined) {
          const lcp = lcpEntry.startTime
          this.addResult(
            '页面加载',
            'Largest Contentful Paint (LCP)',
            Math.round(lcp),
            lcp < 2500 ? 'success' : lcp < 4000 ? 'warning' : 'error',
            `最大内容绘制时间 ${Math.round(lcp)}ms`,
            2500
          )
        }
      }
    } catch (error) {
      this.addResult(
        '页面加载',
        'Performance API',
        0,
        'error',
        `性能测试失败: ${error}`
      )
    }
  }

  /**
   * 测试资源加载
   */
  private async testResourceLoading() {
    try {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

      // 统计资源类型
      const resourceTypes: Record<string, number> = {}
      const resourceSizes: Record<string, number> = {}
      
      resources.forEach(resource => {
        const type = this.getResourceType(resource.name)
        resourceTypes[type] = (resourceTypes[type] || 0) + 1
        resourceSizes[type] = (resourceSizes[type] || 0) + (resource.transferSize || 0)
      })

      // 总资源数量
      this.addResult(
        '资源加载',
        '总资源数量',
        resources.length,
        resources.length < 50 ? 'success' : resources.length < 100 ? 'warning' : 'error',
        `加载了 ${resources.length} 个资源`,
        50
      )

      // JavaScript 资源
      const jsCount = resourceTypes['script'] || 0
      const jsSize = Math.round((resourceSizes['script'] || 0) / 1024)
      this.addResult(
        '资源加载',
        'JavaScript 文件',
        `${jsCount} 个 (${jsSize}KB)`,
        jsCount < 10 ? 'success' : 'warning',
        `加载了 ${jsCount} 个 JS 文件，总大小 ${jsSize}KB`,
        10
      )

      // CSS 资源
      const cssCount = resourceTypes['stylesheet'] || 0
      const cssSize = Math.round((resourceSizes['stylesheet'] || 0) / 1024)
      this.addResult(
        '资源加载',
        'CSS 文件',
        `${cssCount} 个 (${cssSize}KB)`,
        cssCount < 5 ? 'success' : 'warning',
        `加载了 ${cssCount} 个 CSS 文件，总大小 ${cssSize}KB`,
        5
      )

      // 图片资源
      const imgCount = resourceTypes['image'] || 0
      const imgSize = Math.round((resourceSizes['image'] || 0) / 1024)
      this.addResult(
        '资源加载',
        '图片文件',
        `${imgCount} 个 (${imgSize}KB)`,
        imgSize < 500 ? 'success' : imgSize < 1000 ? 'warning' : 'error',
        `加载了 ${imgCount} 个图片，总大小 ${imgSize}KB`,
        500
      )

      // 总传输大小
      const totalSize = Math.round(
        Object.values(resourceSizes).reduce((sum, size) => sum + size, 0) / 1024
      )
      this.addResult(
        '资源加载',
        '总传输大小',
        `${totalSize}KB`,
        totalSize < 1000 ? 'success' : totalSize < 2000 ? 'warning' : 'error',
        `总传输大小 ${totalSize}KB`,
        1000
      )

      // 检查是否有压缩
      const compressedResources = resources.filter(
        r => r.encodedBodySize && r.decodedBodySize && r.encodedBodySize < r.decodedBodySize
      )
      const compressionRate = resources.length > 0 
        ? Math.round((compressedResources.length / resources.length) * 100)
        : 0
      this.addResult(
        '资源加载',
        '资源压缩率',
        `${compressionRate}%`,
        compressionRate > 80 ? 'success' : compressionRate > 50 ? 'warning' : 'error',
        `${compressionRate}% 的资源启用了压缩`,
        80
      )
    } catch (error) {
      this.addResult(
        '资源加载',
        'Resource Timing',
        0,
        'error',
        `资源加载测试失败: ${error}`
      )
    }
  }

  /**
   * 测试代码分割
   */
  private async testCodeSplitting() {
    try {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      const jsResources = resources.filter(r => r.name.includes('.js'))

      // 检查是否有分块文件
      const chunkFiles = jsResources.filter(r => 
        r.name.includes('chunk') || r.name.includes('-')
      )

      if (chunkFiles.length > 0) {
        this.addResult(
          '代码分割',
          '分块文件数量',
          chunkFiles.length,
          'success',
          `检测到 ${chunkFiles.length} 个代码分块文件`,
          1
        )
      } else {
        this.addResult(
          '代码分割',
          '分块文件数量',
          0,
          'warning',
          '未检测到代码分块，可能影响首屏加载性能'
        )
      }

      // 检查主包大小
      const mainBundle = jsResources.find(r => r.name.includes('index') || r.name.includes('main'))
      if (mainBundle && mainBundle.transferSize) {
        const mainSize = Math.round(mainBundle.transferSize / 1024)
        this.addResult(
          '代码分割',
          '主包大小',
          `${mainSize}KB`,
          mainSize < 200 ? 'success' : mainSize < 500 ? 'warning' : 'error',
          `主包大小 ${mainSize}KB`,
          200
        )
      }

      // 检查 vendor 包
      const vendorBundle = jsResources.find(r => r.name.includes('vendor'))
      if (vendorBundle) {
        const vendorSize = Math.round((vendorBundle.transferSize || 0) / 1024)
        this.addResult(
          '代码分割',
          'Vendor 包大小',
          `${vendorSize}KB`,
          vendorSize < 300 ? 'success' : vendorSize < 500 ? 'warning' : 'error',
          `Vendor 包大小 ${vendorSize}KB`,
          300
        )
      } else {
        this.addResult(
          '代码分割',
          'Vendor 包',
          '未分离',
          'warning',
          '未检测到独立的 vendor 包'
        )
      }
    } catch (error) {
      this.addResult(
        '代码分割',
        'Code Splitting',
        0,
        'error',
        `代码分割测试失败: ${error}`
      )
    }
  }

  /**
   * 测试缓存策略
   */
  private async testCacheStrategy() {
    try {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

      // 检查缓存命中
      const cachedResources = resources.filter(r => r.transferSize === 0 && r.decodedBodySize > 0)
      const cacheHitRate = resources.length > 0
        ? Math.round((cachedResources.length / resources.length) * 100)
        : 0

      this.addResult(
        '缓存策略',
        '缓存命中率',
        `${cacheHitRate}%`,
        cacheHitRate > 50 ? 'success' : cacheHitRate > 20 ? 'warning' : 'error',
        `${cacheHitRate}% 的资源从缓存加载`,
        50
      )

      // 检查 localStorage 使用
      const localStorageSize = new Blob(Object.values(localStorage)).size
      this.addResult(
        '缓存策略',
        'LocalStorage 使用',
        `${Math.round(localStorageSize / 1024)}KB`,
        localStorageSize < 5 * 1024 * 1024 ? 'success' : 'warning',
        `LocalStorage 使用了 ${Math.round(localStorageSize / 1024)}KB`,
        5000
      )

      // 检查是否有 Service Worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        if (registrations.length > 0) {
          this.addResult(
            '缓存策略',
            'Service Worker',
            '已注册',
            'success',
            'Service Worker 已注册并运行'
          )
        } else {
          this.addResult(
            '缓存策略',
            'Service Worker',
            '未注册',
            'warning',
            '未检测到 Service Worker'
          )
        }
      }
    } catch (error) {
      this.addResult(
        '缓存策略',
        'Cache Strategy',
        0,
        'error',
        `缓存策略测试失败: ${error}`
      )
    }
  }

  /**
   * 测试图片懒加载
   */
  private async testImageLazyLoading() {
    try {
      const images = document.querySelectorAll('img')
      
      if (images.length === 0) {
        this.addResult(
          '图片懒加载',
          '图片数量',
          0,
          'warning',
          '页面上没有图片元素'
        )
        return
      }

      // 检查 loading 属性
      const lazyImages = Array.from(images).filter(img => img.loading === 'lazy')
      const lazyRate = Math.round((lazyImages.length / images.length) * 100)

      this.addResult(
        '图片懒加载',
        '懒加载图片比例',
        `${lazyRate}%`,
        lazyRate > 80 ? 'success' : lazyRate > 50 ? 'warning' : 'error',
        `${lazyRate}% 的图片启用了懒加载 (${lazyImages.length}/${images.length})`,
        80
      )

      // 检查 data-src 属性（自定义懒加载）
      const dataSrcImages = Array.from(images).filter(img => img.hasAttribute('data-src'))
      if (dataSrcImages.length > 0) {
        this.addResult(
          '图片懒加载',
          '自定义懒加载',
          dataSrcImages.length,
          'success',
          `检测到 ${dataSrcImages.length} 个使用自定义懒加载的图片`
        )
      }

      // 检查图片格式
      const webpImages = Array.from(images).filter(img => img.src.includes('.webp'))
      const webpRate = images.length > 0 ? Math.round((webpImages.length / images.length) * 100) : 0
      
      this.addResult(
        '图片懒加载',
        'WebP 格式使用率',
        `${webpRate}%`,
        webpRate > 50 ? 'success' : webpRate > 20 ? 'warning' : 'error',
        `${webpRate}% 的图片使用了 WebP 格式`,
        50
      )

      // 检查响应式图片
      const pictureElements = document.querySelectorAll('picture')
      if (pictureElements.length > 0) {
        this.addResult(
          '图片懒加载',
          '响应式图片',
          pictureElements.length,
          'success',
          `检测到 ${pictureElements.length} 个响应式图片元素`
        )
      } else {
        this.addResult(
          '图片懒加载',
          '响应式图片',
          0,
          'warning',
          '未检测到响应式图片元素 (<picture>)'
        )
      }
    } catch (error) {
      this.addResult(
        '图片懒加载',
        'Image Lazy Loading',
        0,
        'error',
        `图片懒加载测试失败: ${error}`
      )
    }
  }

  /**
   * 获取资源类型
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script'
    if (url.includes('.css')) return 'stylesheet'
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)/)) return 'image'
    if (url.match(/\.(woff|woff2|ttf|eot)/)) return 'font'
    return 'other'
  }

  /**
   * 添加测试结果
   */
  private addResult(
    category: string,
    metric: string,
    value: number | string,
    status: 'success' | 'warning' | 'error',
    message: string,
    threshold?: number
  ) {
    this.results.push({ category, metric, value, status, message, threshold })
  }

  /**
   * 生成测试报告
   */
  private generateReport() {
    console.log('\n📊 性能测试报告\n')
    console.log('='.repeat(60))

    const categories = [...new Set(this.results.map(r => r.category))]
    
    categories.forEach(category => {
      console.log(`\n${category}:`)
      const categoryResults = this.results.filter(r => r.category === category)
      
      categoryResults.forEach(result => {
        const icon =
          result.status === 'success'
            ? '✅'
            : result.status === 'warning'
              ? '⚠️'
              : '❌'
        console.log(`${icon} ${result.metric}: ${result.message}`)
      })
    })

    const successCount = this.results.filter(r => r.status === 'success').length
    const warningCount = this.results.filter(r => r.status === 'warning').length
    const errorCount = this.results.filter(r => r.status === 'error').length

    console.log('\n' + '='.repeat(60))
    console.log(`总计: ${this.results.length} 项测试`)
    console.log(`✅ 成功: ${successCount}`)
    console.log(`⚠️  警告: ${warningCount}`)
    console.log(`❌ 错误: ${errorCount}`)
    console.log('='.repeat(60) + '\n')

    if (errorCount === 0 && warningCount === 0) {
      console.log('🎉 所有性能测试通过!')
    } else if (errorCount === 0) {
      console.log('✨ 性能测试完成，有一些警告需要注意')
    } else {
      console.log('⚠️  性能测试发现问题，请优化')
    }
  }

  /**
   * 获取测试结果摘要
   */
  getSummary() {
    const successCount = this.results.filter(r => r.status === 'success').length
    const warningCount = this.results.filter(r => r.status === 'warning').length
    const errorCount = this.results.filter(r => r.status === 'error').length

    return {
      total: this.results.length,
      success: successCount,
      warning: warningCount,
      error: errorCount,
      passed: errorCount === 0
    }
  }
}

// 导出单例实例
export const performanceTester = new PerformanceTester()
