import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

/**
 * 设置路由守卫
 * 实现认证检查和权限验证
 */
export function setupRouterGuards(router: Router) {
  /**
   * 全局前置守卫
   * 在每次路由跳转前执行
   */
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    // 设置页面标题
    if (to.meta.title) {
      document.title = `${to.meta.title} - 博客后台管理系统`
    } else {
      document.title = '博客后台管理系统'
    }

    // 检查路由是否需要认证
    const requiresAuth = to.meta.requiresAuth !== false // 默认需要认证

    // 如果需要认证但用户未登录
    if (requiresAuth && !authStore.isAuthenticated()) {
      // 避免重复跳转到登录页
      if (to.path === '/login') {
        next()
        return
      }

      // 保存原始目标路径，登录后可以重定向回来
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
      return
    }

    // 如果用户已登录且访问登录页，重定向到仪表盘
    if (to.path === '/login' && authStore.isAuthenticated()) {
      const redirectPath = (to.query.redirect as string) || '/dashboard'
      next(redirectPath)
      return
    }

    // 权限验证（可选）
    // 如果路由配置了特定角色要求，可以在这里检查
    if (to.meta.roles && Array.isArray(to.meta.roles)) {
      const userRole = authStore.user?.role
      if (!userRole || !to.meta.roles.includes(userRole)) {
        ElMessage.error('您没有权限访问该页面')
        next(from.path || '/dashboard')
        return
      }
    }

    // 允许导航
    next()
  })

  /**
   * 全局后置钩子
   * 在路由跳转完成后执行
   */
  router.afterEach(() => {
    // 可以在这里添加页面访问统计、日志记录等
    // console.log(`导航完成: ${from.path} -> ${to.path}`)
  })

  /**
   * 全局解析守卫
   * 在导航被确认之前，同时在所有组件内守卫和异步路由组件被解析之后调用
   */
  router.beforeResolve(async (_to, _from, next) => {
    // 可以在这里执行一些异步操作，比如预加载数据
    next()
  })

  /**
   * 路由错误处理
   */
  router.onError(error => {
    console.error('路由错误:', error)
    ElMessage.error('页面加载失败，请刷新重试')
  })
}
