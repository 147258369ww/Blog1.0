import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import './types'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
    meta: { 
      title: '首页',
      description: '欢迎来到个人博客 - 分享技术、开发和更多精彩内容',
      keywords: ['博客', '技术', '开发', '文章'],
      ogType: 'website'
    }
  },
  {
    path: '/posts',
    name: 'Posts',
    component: () => import(/* webpackChunkName: "posts" */ '@/views/Posts.vue'),
    meta: { 
      title: '所有文章',
      description: '浏览所有博客文章',
      keywords: ['博客文章', '文章', '所有文章']
    }
  },
  {
    path: '/posts/:id',
    name: 'PostDetail',
    component: () => import(/* webpackChunkName: "post-detail" */ '@/views/PostDetail.vue'),
    meta: { 
      title: '文章详情',
      ogType: 'article'
    }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import(/* webpackChunkName: "categories" */ '@/views/Categories.vue'),
    meta: { 
      title: '分类',
      description: '按分类浏览博客文章',
      keywords: ['分类', '主题', '博客分类']
    }
  },
  {
    path: '/categories/:id',
    name: 'CategoryDetail',
    component: () => import(/* webpackChunkName: "category-detail" */ '@/views/CategoryDetail.vue'),
    meta: { 
      title: '分类',
      description: '查看该分类下的所有文章'
    }
  },
  {
    path: '/tags',
    name: 'Tags',
    component: () => import(/* webpackChunkName: "tags" */ '@/views/Tags.vue'),
    meta: { 
      title: '标签',
      description: '按标签浏览博客文章',
      keywords: ['标签', '标记', '博客标签']
    }
  },
  {
    path: '/tags/:id',
    name: 'TagDetail',
    component: () => import(/* webpackChunkName: "tag-detail" */ '@/views/TagDetail.vue'),
    meta: { 
      title: '标签',
      description: '查看该标签下的所有文章'
    }
  },
  {
    path: '/portfolio',
    name: 'Portfolio',
    component: () => import(/* webpackChunkName: "portfolio" */ '@/views/Portfolio.vue'),
    meta: {
      title: '作品集',
      description: '创意作品集页面，包含首屏动画与精选作品展示',
      keywords: ['作品集', '项目', 'Selected Works']
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ '@/views/About.vue'),
    meta: { 
      title: '关于我',
      description: '了解更多关于我的信息、技能和经验',
      keywords: ['关于', '简介', '个人资料', '技能']
    }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import(/* webpackChunkName: "search" */ '@/views/Search.vue'),
    meta: { 
      title: '搜索',
      description: '搜索博客文章',
      keywords: ['搜索', '查找', '文章'],
      robots: 'noindex, follow'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "auth" */ '@/views/auth/Login.vue'),
    meta: { 
      title: '登录', 
      guest: true,
      description: '登录您的账户',
      robots: 'noindex, nofollow'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import(/* webpackChunkName: "auth" */ '@/views/auth/Register.vue'),
    meta: { 
      title: '注册', 
      guest: true,
      description: '创建新账户',
      robots: 'noindex, nofollow'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import(/* webpackChunkName: "profile" */ '@/views/Profile.vue'),
    meta: { 
      title: '个人资料', 
      requiresAuth: true,
      description: '管理您的个人资料',
      robots: 'noindex, nofollow'
    }
  },
  {
    path: '/integration-test',
    name: 'IntegrationTest',
    component: () => import(/* webpackChunkName: "integration-test" */ '@/views/IntegrationTest.vue'),
    meta: { 
      title: '集成测试',
      description: '开发环境集成测试面板',
      robots: 'noindex, nofollow'
    }
  },
  {
    path: '/responsive-test',
    name: 'ResponsiveTest',
    component: () => import(/* webpackChunkName: "responsive-test" */ '@/views/ResponsiveTest.vue'),
    meta: { 
      title: '响应式测试',
      description: '开发环境响应式测试面板',
      robots: 'noindex, nofollow'
    }
  },
  {
    path: '/performance-test',
    name: 'PerformanceTest',
    component: () => import(/* webpackChunkName: "performance-test" */ '@/views/PerformanceTest.vue'),
    meta: { 
      title: '性能测试',
      description: '开发环境性能测试面板',
      robots: 'noindex, nofollow'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import(/* webpackChunkName: "not-found" */ '@/views/NotFound.vue'),
    meta: { 
      title: '404 页面未找到',
      description: '您访问的页面不存在',
      robots: 'noindex, nofollow'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    // 如果有保存的位置(浏览器前进/后退),返回到该位置
    if (savedPosition) {
      return savedPosition
    } 
    // 如果有锚点,平滑滚动到锚点
    else if (to.hash) {
      return { 
        el: to.hash, 
        behavior: 'smooth' 
      }
    } 
    // 否则回到顶部
    else {
      return { 
        top: 0, 
        behavior: 'smooth' 
      }
    }
  }
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 个人博客` : '个人博客'
  
  // 设置基础 meta 标签
  if (to.meta.description) {
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', to.meta.description)
  }
  
  if (to.meta.keywords) {
    const keywords = Array.isArray(to.meta.keywords) 
      ? to.meta.keywords.join(', ') 
      : to.meta.keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]')
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta')
      metaKeywords.setAttribute('name', 'keywords')
      document.head.appendChild(metaKeywords)
    }
    metaKeywords.setAttribute('content', keywords)
  }
  
  if (to.meta.robots) {
    let metaRobots = document.querySelector('meta[name="robots"]')
    if (!metaRobots) {
      metaRobots = document.createElement('meta')
      metaRobots.setAttribute('name', 'robots')
      document.head.appendChild(metaRobots)
    }
    metaRobots.setAttribute('content', to.meta.robots)
  }
  
  // 需要认证的路由
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  // 访客路由(已登录用户不能访问)
  if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: 'Home' })
    return
  }
  
  next()
})

export default router
