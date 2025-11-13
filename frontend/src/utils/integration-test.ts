/**
 * 集成测试工具
 * 用于验证所有功能模块的集成状态
 */

import {
  useAuthStore,
  usePostsStore,
  useCategoriesStore,
  useTagsStore,
  useThemeStore,
  useSiteConfigStore
} from '@/stores'
import router from '@/router'
import {
  authApi,
  postsApi,
  categoriesApi,
  tagsApi,
  linksApi,
  settingsApi,
  statsApi
} from '@/services/api'

export interface IntegrationTestResult {
  module: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export class IntegrationTester {
  private results: IntegrationTestResult[] = []

  /**
   * 运行所有集成测试
   */
  async runAllTests(): Promise<IntegrationTestResult[]> {
    this.results = []

    console.log('🚀 开始集成测试...')

    // 测试路由系统
    await this.testRouter()

    // 测试状态管理
    await this.testStores()

    // 测试主题系统
    await this.testTheme()

    // 测试API服务
    await this.testApiServices()

    // 生成测试报告
    this.generateReport()

    return this.results
  }

  /**
   * 测试路由系统
   */
  private async testRouter() {
    try {
      const routes = router.getRoutes()
      
      if (routes.length === 0) {
        this.addResult('Router', 'error', '路由配置为空')
        return
      }

      // 验证必需的路由
      const requiredRoutes = [
        'Home',
        'Posts',
        'PostDetail',
        'Categories',
        'Tags',
        'Projects',
        'About',
        'Newsletter',
        'Search',
        'Login',
        'Register',
        'Profile',
        'NotFound'
      ]

      const missingRoutes = requiredRoutes.filter(
        name => !routes.some(r => r.name === name)
      )

      if (missingRoutes.length > 0) {
        this.addResult(
          'Router',
          'warning',
          `缺少路由: ${missingRoutes.join(', ')}`,
          { missingRoutes }
        )
      } else {
        this.addResult(
          'Router',
          'success',
          `所有必需路由已配置 (${routes.length} 个路由)`,
          { totalRoutes: routes.length }
        )
      }

      // 测试路由导航
      const currentRoute = router.currentRoute.value
      const routeName = currentRoute.name ? String(currentRoute.name) : currentRoute.path
      this.addResult(
        'Router Navigation',
        'success',
        `当前路由: ${routeName}`,
        { currentRoute: routeName }
      )
    } catch (error) {
      this.addResult('Router', 'error', `路由测试失败: ${error}`)
    }
  }

  /**
   * 测试状态管理
   */
  private async testStores() {
    try {
      // 测试 Auth Store
      const authStore = useAuthStore()
      this.addResult(
        'Auth Store',
        'success',
        `认证状态: ${authStore.isAuthenticated ? '已登录' : '未登录'}`,
        {
          isAuthenticated: authStore.isAuthenticated,
          hasUser: !!authStore.user
        }
      )

      // 测试 Posts Store
      const postsStore = usePostsStore()
      this.addResult(
        'Posts Store',
        'success',
        `文章数据: ${postsStore.posts.length} 篇文章`,
        {
          postsCount: postsStore.posts.length,
          hasCurrentPost: !!postsStore.currentPost
        }
      )

      // 测试 Categories Store
      try {
        const categoriesStore = useCategoriesStore()
        this.addResult(
          'Categories Store',
          'success',
          `分类数据: ${categoriesStore.categories.length} 个分类`,
          { categoriesCount: categoriesStore.categories.length }
        )
      } catch (error) {
        this.addResult('Categories Store', 'warning', '分类 Store 未初始化')
      }

      // 测试 Tags Store
      try {
        const tagsStore = useTagsStore()
        this.addResult(
          'Tags Store',
          'success',
          `标签数据: ${tagsStore.tags.length} 个标签`,
          { tagsCount: tagsStore.tags.length }
        )
      } catch (error) {
        this.addResult('Tags Store', 'warning', '标签 Store 未初始化')
      }

      // 测试 Theme Store
      const themeStore = useThemeStore()
      this.addResult(
        'Theme Store',
        'success',
        `主题状态: ${themeStore.theme}`,
        { theme: themeStore.theme }
      )

      // 测试 Site Config Store
      try {
        const siteConfigStore = useSiteConfigStore()
        this.addResult(
          'Site Config Store',
          'success',
          `网站配置: ${siteConfigStore.siteConfig?.siteName || '未加载'}`,
          {
            hasSiteConfig: !!siteConfigStore.siteConfig,
            hasSeoConfig: !!siteConfigStore.seoConfig
          }
        )
      } catch (error) {
        this.addResult('Site Config Store', 'warning', '网站配置 Store 未初始化')
      }
    } catch (error) {
      this.addResult('Stores', 'error', `状态管理测试失败: ${error}`)
    }
  }

  /**
   * 测试主题系统
   */
  private async testTheme() {
    try {
      const themeStore = useThemeStore()
      const currentTheme = themeStore.theme

      // 验证主题属性
      const htmlElement = document.documentElement
      const dataTheme = htmlElement.getAttribute('data-theme')

      if (dataTheme === currentTheme) {
        this.addResult(
          'Theme System',
          'success',
          `主题系统正常: ${currentTheme}`,
          { theme: currentTheme, dataTheme }
        )
      } else {
        this.addResult(
          'Theme System',
          'warning',
          `主题不一致: Store=${currentTheme}, DOM=${dataTheme}`,
          { theme: currentTheme, dataTheme }
        )
      }

      // 验证 localStorage 持久化
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme === currentTheme) {
        this.addResult(
          'Theme Persistence',
          'success',
          '主题持久化正常',
          { savedTheme }
        )
      } else {
        this.addResult(
          'Theme Persistence',
          'warning',
          `主题持久化不一致: Store=${currentTheme}, localStorage=${savedTheme}`,
          { theme: currentTheme, savedTheme }
        )
      }
    } catch (error) {
      this.addResult('Theme System', 'error', `主题系统测试失败: ${error}`)
    }
  }

  /**
   * 测试 API 服务
   */
  private async testApiServices() {
    try {
      // 验证环境变量
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

      if (!apiBaseUrl) {
        this.addResult(
          'API Configuration',
          'error',
          'API Base URL 未配置',
          { apiBaseUrl }
        )
        return
      }

      this.addResult(
        'API Configuration',
        'success',
        `API Base URL: ${apiBaseUrl}`,
        { apiBaseUrl }
      )

      // 验证 HTTP 客户端
      try {
        const { http } = await import('@/services/http')
        this.addResult(
          'HTTP Client',
          'success',
          'HTTP 客户端已初始化',
          { hasHttpClient: !!http }
        )
      } catch (error) {
        this.addResult(
          'HTTP Client',
          'error',
          `HTTP 客户端初始化失败: ${error}`
        )
      }

      // 验证 API 服务模块
      const apiServices = [
        { name: 'auth', api: authApi },
        { name: 'posts', api: postsApi },
        { name: 'categories', api: categoriesApi },
        { name: 'tags', api: tagsApi },
        { name: 'links', api: linksApi },
        { name: 'settings', api: settingsApi },
        { name: 'stats', api: statsApi }
      ]

      for (const { name, api } of apiServices) {
        if (api && typeof api === 'object') {
          const methods = Object.keys(api).length
          this.addResult(
            `API Service: ${name}`,
            'success',
            `${name} API 服务已加载 (${methods} 个方法)`,
            { methods }
          )
        } else {
          this.addResult(
            `API Service: ${name}`,
            'warning',
            `${name} API 服务未正确初始化`
          )
        }
      }
    } catch (error) {
      this.addResult('API Services', 'error', `API 服务测试失败: ${error}`)
    }
  }

  /**
   * 添加测试结果
   */
  private addResult(
    module: string,
    status: 'success' | 'error' | 'warning',
    message: string,
    details?: any
  ) {
    this.results.push({ module, status, message, details })
  }

  /**
   * 生成测试报告
   */
  private generateReport() {
    console.log('\n📊 集成测试报告\n')
    console.log('='.repeat(60))

    const successCount = this.results.filter(r => r.status === 'success').length
    const warningCount = this.results.filter(r => r.status === 'warning').length
    const errorCount = this.results.filter(r => r.status === 'error').length

    this.results.forEach(result => {
      const icon =
        result.status === 'success'
          ? '✅'
          : result.status === 'warning'
            ? '⚠️'
            : '❌'
      console.log(`${icon} [${result.module}] ${result.message}`)
      if (result.details) {
        console.log(`   详情:`, result.details)
      }
    })

    console.log('\n' + '='.repeat(60))
    console.log(`总计: ${this.results.length} 项测试`)
    console.log(`✅ 成功: ${successCount}`)
    console.log(`⚠️  警告: ${warningCount}`)
    console.log(`❌ 错误: ${errorCount}`)
    console.log('='.repeat(60) + '\n')

    if (errorCount === 0 && warningCount === 0) {
      console.log('🎉 所有集成测试通过!')
    } else if (errorCount === 0) {
      console.log('✨ 集成测试完成，有一些警告需要注意')
    } else {
      console.log('⚠️  集成测试发现错误，请检查并修复')
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
export const integrationTester = new IntegrationTester()
