/**
 * 响应式测试工具
 * 用于测试不同屏幕尺寸下的布局和主题
 */

export interface ResponsiveTestResult {
  viewport: string
  width: number
  height: number
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export interface ThemeTestResult {
  theme: 'light' | 'dark'
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export class ResponsiveTester {
  private results: ResponsiveTestResult[] = []
  private themeResults: ThemeTestResult[] = []

  // 定义测试视口
  private viewports = {
    mobile: { width: 390, height: 844, name: 'Mobile (iPhone 14/15/16)' },
    tablet: { width: 834, height: 1194, name: 'Tablet (iPad Pro 11)' },
    desktop: { width: 1440, height: 900, name: 'Desktop' },
    wide: { width: 1920, height: 1080, name: 'Wide Desktop' }
  }

  /**
   * 运行所有响应式测试
   */
  async runAllTests(): Promise<{
    viewportResults: ResponsiveTestResult[]
    themeResults: ThemeTestResult[]
  }> {
    this.results = []
    this.themeResults = []

    console.log('📱 开始响应式测试...')

    // 测试各个视口
    await this.testViewport('mobile')
    await this.testViewport('tablet')
    await this.testViewport('desktop')

    // 测试主题切换
    await this.testThemes()

    // 生成报告
    this.generateReport()

    return {
      viewportResults: this.results,
      themeResults: this.themeResults
    }
  }

  /**
   * 测试特定视口
   */
  private async testViewport(viewportName: keyof typeof this.viewports) {
    const viewport = this.viewports[viewportName]
    
    try {
      // 设置视口大小
      window.resizeTo(viewport.width, viewport.height)
      
      // 等待布局更新
      await this.waitForLayout()

      // 检查视口尺寸
      const actualWidth = window.innerWidth
      const actualHeight = window.innerHeight

      // 验证断点
      const breakpoint = this.getBreakpoint(actualWidth)
      const expectedBreakpoint = this.getExpectedBreakpoint(viewportName)

      if (breakpoint === expectedBreakpoint) {
        this.addResult(
          viewport.name,
          viewport.width,
          viewport.height,
          'success',
          `视口测试通过 - 断点: ${breakpoint}`,
          {
            actualWidth,
            actualHeight,
            breakpoint,
            expectedBreakpoint
          }
        )
      } else {
        this.addResult(
          viewport.name,
          viewport.width,
          viewport.height,
          'warning',
          `断点不匹配 - 期望: ${expectedBreakpoint}, 实际: ${breakpoint}`,
          {
            actualWidth,
            actualHeight,
            breakpoint,
            expectedBreakpoint
          }
        )
      }

      // 测试布局元素
      await this.testLayoutElements(viewportName, viewport)

      // 测试响应式组件
      await this.testResponsiveComponents(viewportName, viewport)
    } catch (error) {
      this.addResult(
        viewport.name,
        viewport.width,
        viewport.height,
        'error',
        `视口测试失败: ${error}`
      )
    }
  }

  /**
   * 测试布局元素
   */
  private async testLayoutElements(
    viewportName: string,
    viewport: { width: number; height: number; name: string }
  ) {
    const elements = {
      header: document.querySelector('header'),
      navbar: document.querySelector('nav'),
      mobileMenu: document.querySelector('.mobile-menu'),
      footer: document.querySelector('footer'),
      sidebar: document.querySelector('.sidebar')
    }

    // 移动端测试
    if (viewportName === 'mobile') {
      if (elements.mobileMenu) {
        this.addResult(
          viewport.name,
          viewport.width,
          viewport.height,
          'success',
          '移动端菜单元素存在'
        )
      } else {
        this.addResult(
          viewport.name,
          viewport.width,
          viewport.height,
          'warning',
          '移动端菜单元素未找到'
        )
      }

      // 侧边栏应该隐藏
      if (elements.sidebar) {
        const isHidden = window.getComputedStyle(elements.sidebar).display === 'none'
        if (isHidden) {
          this.addResult(
            viewport.name,
            viewport.width,
            viewport.height,
            'success',
            '移动端侧边栏正确隐藏'
          )
        } else {
          this.addResult(
            viewport.name,
            viewport.width,
            viewport.height,
            'warning',
            '移动端侧边栏未隐藏'
          )
        }
      }
    }

    // 桌面端测试
    if (viewportName === 'desktop') {
      if (elements.navbar) {
        const isVisible = window.getComputedStyle(elements.navbar).display !== 'none'
        if (isVisible) {
          this.addResult(
            viewport.name,
            viewport.width,
            viewport.height,
            'success',
            '桌面端导航栏正确显示'
          )
        } else {
          this.addResult(
            viewport.name,
            viewport.width,
            viewport.height,
            'warning',
            '桌面端导航栏未显示'
          )
        }
      }
    }

    // 通用元素测试
    if (elements.header) {
      this.addResult(
        viewport.name,
        viewport.width,
        viewport.height,
        'success',
        'Header 元素存在'
      )
    }

    if (elements.footer) {
      this.addResult(
        viewport.name,
        viewport.width,
        viewport.height,
        'success',
        'Footer 元素存在'
      )
    }
  }

  /**
   * 测试响应式组件
   */
  private async testResponsiveComponents(
    viewportName: string,
    viewport: { width: number; height: number; name: string }
  ) {
    // 测试网格布局
    const gridContainers = document.querySelectorAll('.grid, .posts-grid, .blog-grid')
    
    if (gridContainers.length > 0) {
      gridContainers.forEach((container, index) => {
        const computedStyle = window.getComputedStyle(container)
        const gridColumns = computedStyle.gridTemplateColumns
        
        if (gridColumns && gridColumns !== 'none') {
          const columnCount = gridColumns.split(' ').length
          
          let expectedColumns = 1
          if (viewportName === 'tablet') expectedColumns = 2
          if (viewportName === 'desktop') expectedColumns = 3

          if (columnCount === expectedColumns) {
            this.addResult(
              viewport.name,
              viewport.width,
              viewport.height,
              'success',
              `网格布局 ${index + 1} 列数正确: ${columnCount}`,
              { gridColumns, columnCount, expectedColumns }
            )
          } else {
            this.addResult(
              viewport.name,
              viewport.width,
              viewport.height,
              'warning',
              `网格布局 ${index + 1} 列数不匹配: 期望 ${expectedColumns}, 实际 ${columnCount}`,
              { gridColumns, columnCount, expectedColumns }
            )
          }
        }
      })
    }

    // 测试触摸目标尺寸（移动端）
    if (viewportName === 'mobile') {
      const touchTargets = document.querySelectorAll('button, a, input, .clickable')
      let smallTargets = 0

      touchTargets.forEach(target => {
        const rect = target.getBoundingClientRect()
        if (rect.width < 44 || rect.height < 44) {
          smallTargets++
        }
      })

      if (smallTargets === 0) {
        this.addResult(
          viewport.name,
          viewport.width,
          viewport.height,
          'success',
          '所有触摸目标尺寸符合要求 (≥44px)'
        )
      } else {
        this.addResult(
          viewport.name,
          viewport.width,
          viewport.height,
          'warning',
          `发现 ${smallTargets} 个触摸目标尺寸过小 (<44px)`,
          { smallTargets }
        )
      }
    }
  }

  /**
   * 测试主题切换
   */
  private async testThemes() {
    console.log('🎨 测试主题切换...')

    // 测试亮色主题
    await this.testTheme('light')

    // 测试暗色主题
    await this.testTheme('dark')

    // 恢复到亮色主题
    document.documentElement.setAttribute('data-theme', 'light')
  }

  /**
   * 测试单个主题
   */
  private async testTheme(theme: 'light' | 'dark') {
    try {
      // 设置主题
      document.documentElement.setAttribute('data-theme', theme)
      
      // 等待主题应用
      await this.waitForTheme()

      // 验证主题属性
      const dataTheme = document.documentElement.getAttribute('data-theme')
      
      if (dataTheme === theme) {
        this.addThemeResult(
          theme,
          'success',
          `${theme === 'light' ? '亮色' : '暗色'}主题应用成功`,
          { dataTheme }
        )
      } else {
        this.addThemeResult(
          theme,
          'error',
          `主题应用失败: 期望 ${theme}, 实际 ${dataTheme}`,
          { expected: theme, actual: dataTheme }
        )
      }

      // 验证 CSS 变量
      const computedStyle = window.getComputedStyle(document.documentElement)
      const bgPrimary = computedStyle.getPropertyValue('--bg-primary').trim()
      const textPrimary = computedStyle.getPropertyValue('--text-primary').trim()

      if (bgPrimary && textPrimary) {
        this.addThemeResult(
          theme,
          'success',
          `${theme === 'light' ? '亮色' : '暗色'}主题 CSS 变量正确`,
          { bgPrimary, textPrimary }
        )
      } else {
        this.addThemeResult(
          theme,
          'error',
          `${theme === 'light' ? '亮色' : '暗色'}主题 CSS 变量缺失`,
          { bgPrimary, textPrimary }
        )
      }

      // 验证对比度
      if (theme === 'light') {
        // 亮色主题应该是浅色背景
        if (bgPrimary.includes('#fff') || bgPrimary.includes('255')) {
          this.addThemeResult(theme, 'success', '亮色主题背景颜色正确')
        } else {
          this.addThemeResult(theme, 'warning', '亮色主题背景颜色可能不正确', { bgPrimary })
        }
      } else {
        // 暗色主题应该是深色背景
        if (bgPrimary.includes('#0') || bgPrimary.includes('#1')) {
          this.addThemeResult(theme, 'success', '暗色主题背景颜色正确')
        } else {
          this.addThemeResult(theme, 'warning', '暗色主题背景颜色可能不正确', { bgPrimary })
        }
      }
    } catch (error) {
      this.addThemeResult(theme, 'error', `主题测试失败: ${error}`)
    }
  }

  /**
   * 获取当前断点
   */
  private getBreakpoint(width: number): string {
    if (width < 834) return 'mobile'
    if (width < 1440) return 'tablet'
    if (width < 1920) return 'desktop'
    return 'wide'
  }

  /**
   * 获取期望的断点
   */
  private getExpectedBreakpoint(viewportName: string): string {
    const mapping: Record<string, string> = {
      mobile: 'mobile',
      tablet: 'tablet',
      desktop: 'desktop',
      wide: 'wide'
    }
    return mapping[viewportName] || 'unknown'
  }

  /**
   * 等待布局更新
   */
  private waitForLayout(): Promise<void> {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 100)
        })
      })
    })
  }

  /**
   * 等待主题应用
   */
  private waitForTheme(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, 300) // 等待主题过渡动画
    })
  }

  /**
   * 添加视口测试结果
   */
  private addResult(
    viewport: string,
    width: number,
    height: number,
    status: 'success' | 'error' | 'warning',
    message: string,
    details?: any
  ) {
    this.results.push({ viewport, width, height, status, message, details })
  }

  /**
   * 添加主题测试结果
   */
  private addThemeResult(
    theme: 'light' | 'dark',
    status: 'success' | 'error' | 'warning',
    message: string,
    details?: any
  ) {
    this.themeResults.push({ theme, status, message, details })
  }

  /**
   * 生成测试报告
   */
  private generateReport() {
    console.log('\n📊 响应式测试报告\n')
    console.log('='.repeat(60))

    // 视口测试报告
    console.log('\n📱 视口测试结果:')
    const viewportSuccess = this.results.filter(r => r.status === 'success').length
    const viewportWarning = this.results.filter(r => r.status === 'warning').length
    const viewportError = this.results.filter(r => r.status === 'error').length

    this.results.forEach(result => {
      const icon =
        result.status === 'success'
          ? '✅'
          : result.status === 'warning'
            ? '⚠️'
            : '❌'
      console.log(`${icon} [${result.viewport}] ${result.message}`)
    })

    console.log(`\n视口测试: ${this.results.length} 项`)
    console.log(`✅ 成功: ${viewportSuccess}`)
    console.log(`⚠️  警告: ${viewportWarning}`)
    console.log(`❌ 错误: ${viewportError}`)

    // 主题测试报告
    console.log('\n🎨 主题测试结果:')
    const themeSuccess = this.themeResults.filter(r => r.status === 'success').length
    const themeError = this.themeResults.filter(r => r.status === 'error').length

    this.themeResults.forEach(result => {
      const icon = result.status === 'success' ? '✅' : '❌'
      console.log(`${icon} [${result.theme}] ${result.message}`)
    })

    console.log(`\n主题测试: ${this.themeResults.length} 项`)
    console.log(`✅ 成功: ${themeSuccess}`)
    console.log(`❌ 错误: ${themeError}`)

    console.log('\n' + '='.repeat(60))

    if (viewportError === 0 && themeError === 0 && viewportWarning === 0) {
      console.log('🎉 所有响应式测试通过!')
    } else if (viewportError === 0 && themeError === 0) {
      console.log('✨ 响应式测试完成，有一些警告需要注意')
    } else {
      console.log('⚠️  响应式测试发现错误，请检查并修复')
    }
  }

  /**
   * 获取测试结果摘要
   */
  getSummary() {
    const viewportSuccess = this.results.filter(r => r.status === 'success').length
    const viewportWarning = this.results.filter(r => r.status === 'warning').length
    const viewportError = this.results.filter(r => r.status === 'error').length

    const themeSuccess = this.themeResults.filter(r => r.status === 'success').length
    const themeError = this.themeResults.filter(r => r.status === 'error').length

    return {
      viewport: {
        total: this.results.length,
        success: viewportSuccess,
        warning: viewportWarning,
        error: viewportError
      },
      theme: {
        total: this.themeResults.length,
        success: themeSuccess,
        error: themeError
      },
      passed: viewportError === 0 && themeError === 0
    }
  }
}

// 导出单例实例
export const responsiveTester = new ResponsiveTester()
