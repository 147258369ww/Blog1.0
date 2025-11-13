#!/usr/bin/env node

/**
 * 集成验证脚本
 * 验证所有功能模块的集成状态
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// ANSI 颜色代码
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

class IntegrationVerifier {
  constructor() {
    this.results = []
    this.errors = []
    this.warnings = []
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`)
  }

  success(message) {
    this.log(`✅ ${message}`, 'green')
    this.results.push({ status: 'success', message })
  }

  warning(message) {
    this.log(`⚠️  ${message}`, 'yellow')
    this.warnings.push(message)
    this.results.push({ status: 'warning', message })
  }

  error(message) {
    this.log(`❌ ${message}`, 'red')
    this.errors.push(message)
    this.results.push({ status: 'error', message })
  }

  info(message) {
    this.log(`ℹ️  ${message}`, 'cyan')
  }

  section(title) {
    this.log(`\n${'='.repeat(60)}`, 'blue')
    this.log(`${title}`, 'blue')
    this.log(`${'='.repeat(60)}`, 'blue')
  }

  /**
   * 检查文件是否存在
   */
  checkFile(filePath, description) {
    const fullPath = join(projectRoot, filePath)
    if (existsSync(fullPath)) {
      this.success(`${description}: ${filePath}`)
      return true
    } else {
      this.error(`${description}缺失: ${filePath}`)
      return false
    }
  }

  /**
   * 检查多个文件
   */
  checkFiles(files, description) {
    let allExist = true
    files.forEach(file => {
      if (!this.checkFile(file, description)) {
        allExist = false
      }
    })
    return allExist
  }

  /**
   * 验证项目结构
   */
  verifyProjectStructure() {
    this.section('1. 验证项目结构')

    const requiredDirs = [
      'src/components/common',
      'src/components/layout',
      'src/components/blog',
      'src/views',
      'src/views/auth',
      'src/stores',
      'src/services',
      'src/services/api',
      'src/types',
      'src/composables',
      'src/utils',
      'src/router',
      'src/styles'
    ]

    requiredDirs.forEach(dir => {
      this.checkFile(dir, '目录')
    })
  }

  /**
   * 验证配置文件
   */
  verifyConfiguration() {
    this.section('2. 验证配置文件')

    const configFiles = [
      'package.json',
      'vite.config.ts',
      'tsconfig.json',
      '.eslintrc.cjs',
      '.prettierrc.json',
      '.env.example'
    ]

    configFiles.forEach(file => {
      this.checkFile(file, '配置文件')
    })

    // 验证环境变量
    if (existsSync(join(projectRoot, '.env.development'))) {
      this.success('开发环境配置: .env.development')
    } else {
      this.warning('开发环境配置缺失: .env.development')
    }

    if (existsSync(join(projectRoot, '.env.production'))) {
      this.success('生产环境配置: .env.production')
    } else {
      this.warning('生产环境配置缺失: .env.production')
    }
  }

  /**
   * 验证核心文件
   */
  verifyCoreFiles() {
    this.section('3. 验证核心文件')

    const coreFiles = [
      'src/main.ts',
      'src/App.vue',
      'index.html'
    ]

    coreFiles.forEach(file => {
      this.checkFile(file, '核心文件')
    })
  }

  /**
   * 验证路由配置
   */
  verifyRouter() {
    this.section('4. 验证路由配置')

    if (this.checkFile('src/router/index.ts', '路由配置')) {
      try {
        const routerContent = readFileSync(
          join(projectRoot, 'src/router/index.ts'),
          'utf-8'
        )

        const requiredRoutes = [
          'Home',
          'Posts',
          'PostDetail',
          'Categories',
          'CategoryDetail',
          'Tags',
          'TagDetail',
          'Projects',
          'About',
          'Newsletter',
          'Search',
          'Login',
          'Register',
          'Profile',
          'NotFound'
        ]

        requiredRoutes.forEach(route => {
          if (routerContent.includes(`name: '${route}'`)) {
            this.success(`路由已配置: ${route}`)
          } else {
            this.error(`路由缺失: ${route}`)
          }
        })

        // 检查路由守卫
        if (routerContent.includes('router.beforeEach')) {
          this.success('路由守卫已配置')
        } else {
          this.warning('路由守卫未配置')
        }

        // 检查滚动行为
        if (routerContent.includes('scrollBehavior')) {
          this.success('滚动行为已配置')
        } else {
          this.warning('滚动行为未配置')
        }
      } catch (error) {
        this.error(`读取路由配置失败: ${error.message}`)
      }
    }
  }

  /**
   * 验证状态管理
   */
  verifyStores() {
    this.section('5. 验证状态管理')

    const stores = [
      'src/stores/index.ts',
      'src/stores/auth.ts',
      'src/stores/posts.ts',
      'src/stores/categories.ts',
      'src/stores/tags.ts',
      'src/stores/theme.ts',
      'src/stores/siteConfig.ts'
    ]

    stores.forEach(store => {
      this.checkFile(store, 'Store')
    })
  }

  /**
   * 验证 API 服务
   */
  verifyApiServices() {
    this.section('6. 验证 API 服务')

    if (this.checkFile('src/services/http.ts', 'HTTP 客户端')) {
      try {
        const httpContent = readFileSync(
          join(projectRoot, 'src/services/http.ts'),
          'utf-8'
        )

        // 检查拦截器
        if (httpContent.includes('interceptors.request')) {
          this.success('请求拦截器已配置')
        } else {
          this.warning('请求拦截器未配置')
        }

        if (httpContent.includes('interceptors.response')) {
          this.success('响应拦截器已配置')
        } else {
          this.warning('响应拦截器未配置')
        }
      } catch (error) {
        this.error(`读取 HTTP 客户端失败: ${error.message}`)
      }
    }

    const apiServices = [
      'src/services/api/auth.ts',
      'src/services/api/posts.ts',
      'src/services/api/categories.ts',
      'src/services/api/tags.ts',
      'src/services/api/links.ts',
      'src/services/api/settings.ts',
      'src/services/api/stats.ts'
    ]

    apiServices.forEach(service => {
      this.checkFile(service, 'API 服务')
    })
  }

  /**
   * 验证类型定义
   */
  verifyTypes() {
    this.section('7. 验证类型定义')

    const typeFiles = [
      'src/types/models.ts',
      'src/types/api.ts'
    ]

    typeFiles.forEach(file => {
      this.checkFile(file, '类型定义')
    })
  }

  /**
   * 验证组合式函数
   */
  verifyComposables() {
    this.section('8. 验证组合式函数')

    const composables = [
      'src/composables/useDebounce.ts',
      'src/composables/useImageLazyLoad.ts',
      'src/composables/useToast.ts',
      'src/composables/useInfiniteScroll.ts',
      'src/composables/useTouch.ts'
    ]

    composables.forEach(composable => {
      this.checkFile(composable, 'Composable')
    })
  }

  /**
   * 验证通用组件
   */
  verifyCommonComponents() {
    this.section('9. 验证通用组件')

    const components = [
      'src/components/common/Badge.vue',
      'src/components/common/Pagination.vue',
      'src/components/common/ResponsiveImage.vue',
      'src/components/common/Toast.vue',
      'src/components/common/Loading.vue',
      'src/components/common/Skeleton.vue',
      'src/components/common/EmptyState.vue',
      'src/components/common/ErrorBoundary.vue'
    ]

    components.forEach(component => {
      this.checkFile(component, '通用组件')
    })
  }

  /**
   * 验证布局组件
   */
  verifyLayoutComponents() {
    this.section('10. 验证布局组件')

    const components = [
      'src/components/layout/Header.vue',
      'src/components/layout/Navbar.vue',
      'src/components/layout/MobileMenu.vue',
      'src/components/layout/Footer.vue',
      'src/components/layout/Sidebar.vue',
      'src/components/layout/BackToTop.vue'
    ]

    components.forEach(component => {
      this.checkFile(component, '布局组件')
    })
  }

  /**
   * 验证博客组件
   */
  verifyBlogComponents() {
    this.section('11. 验证博客组件')

    const components = [
      'src/components/blog/BlogPostCard.vue',
      'src/components/blog/CategoryBadge.vue',
      'src/components/blog/TagCloud.vue'
    ]

    components.forEach(component => {
      this.checkFile(component, '博客组件')
    })
  }

  /**
   * 验证页面组件
   */
  verifyPages() {
    this.section('12. 验证页面组件')

    const pages = [
      'src/views/Home.vue',
      'src/views/Posts.vue',
      'src/views/PostDetail.vue',
      'src/views/Categories.vue',
      'src/views/CategoryDetail.vue',
      'src/views/Tags.vue',
      'src/views/TagDetail.vue',
      'src/views/Projects.vue',
      'src/views/About.vue',
      'src/views/Newsletter.vue',
      'src/views/Search.vue',
      'src/views/auth/Login.vue',
      'src/views/auth/Register.vue',
      'src/views/Profile.vue',
      'src/views/NotFound.vue'
    ]

    pages.forEach(page => {
      this.checkFile(page, '页面组件')
    })
  }

  /**
   * 验证工具函数
   */
  verifyUtils() {
    this.section('13. 验证工具函数')

    const utils = [
      'src/utils/cache.ts',
      'src/utils/image.ts',
      'src/utils/performance.ts',
      'src/utils/errorHandler.ts'
    ]

    utils.forEach(util => {
      this.checkFile(util, '工具函数')
    })
  }

  /**
   * 验证样式文件
   */
  verifyStyles() {
    this.section('14. 验证样式文件')

    const styles = [
      'src/styles/index.css',
      'src/styles/variables.css',
      'src/styles/theme.css'
    ]

    styles.forEach(style => {
      this.checkFile(style, '样式文件')
    })
  }

  /**
   * 生成报告
   */
  generateReport() {
    this.section('集成验证报告')

    const total = this.results.length
    const successCount = this.results.filter(r => r.status === 'success').length
    const warningCount = this.warnings.length
    const errorCount = this.errors.length

    this.log(`\n总计: ${total} 项检查`, 'cyan')
    this.log(`✅ 成功: ${successCount}`, 'green')
    this.log(`⚠️  警告: ${warningCount}`, 'yellow')
    this.log(`❌ 错误: ${errorCount}`, 'red')

    if (errorCount === 0 && warningCount === 0) {
      this.log('\n🎉 所有集成验证通过!', 'green')
      return 0
    } else if (errorCount === 0) {
      this.log('\n✨ 集成验证完成，有一些警告需要注意', 'yellow')
      return 0
    } else {
      this.log('\n⚠️  集成验证发现错误，请检查并修复', 'red')
      return 1
    }
  }

  /**
   * 运行所有验证
   */
  async run() {
    this.log('\n🚀 开始集成验证...\n', 'cyan')

    this.verifyProjectStructure()
    this.verifyConfiguration()
    this.verifyCoreFiles()
    this.verifyRouter()
    this.verifyStores()
    this.verifyApiServices()
    this.verifyTypes()
    this.verifyComposables()
    this.verifyCommonComponents()
    this.verifyLayoutComponents()
    this.verifyBlogComponents()
    this.verifyPages()
    this.verifyUtils()
    this.verifyStyles()

    return this.generateReport()
  }
}

// 运行验证
const verifier = new IntegrationVerifier()
verifier.run().then(exitCode => {
  process.exit(exitCode)
}).catch(error => {
  console.error('验证过程出错:', error)
  process.exit(1)
})
