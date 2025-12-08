import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { setupRouterGuards } from './guards'

const routes: RouteRecordRaw[] = [
  // 认证路由 - 使用 AuthLayout
  {
    path: '/login',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import('@/views/auth/Login.vue'),
        meta: {
          title: '登录',
          requiresAuth: false,
        },
      },
    ],
  },
  // 主应用路由 - 使用 DefaultLayout
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/dashboard',
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: {
          title: '仪表盘',
          requiresAuth: true,
        },
      },
      {
        path: 'articles',
        name: 'ArticleList',
        component: () => import('@/views/article/List.vue'),
        meta: {
          title: '文章列表',
          requiresAuth: true,
        },
      },
      {
        path: 'articles/create',
        name: 'ArticleCreate',
        component: () => import('@/views/article/Create.vue'),
        meta: {
          title: '创建文章',
          requiresAuth: true,
        },
      },
      {
        path: 'articles/:id/edit',
        name: 'ArticleEdit',
        component: () => import('@/views/article/Edit.vue'),
        meta: {
          title: '编辑文章',
          requiresAuth: true,
        },
      },
      {
        path: 'articles/editor-demo',
        name: 'EditorDemo',
        component: () => import('@/views/article/EditorDemo.vue'),
        meta: {
          title: '编辑器演示',
          requiresAuth: true,
        },
      },
      {
        path: 'categories',
        name: 'CategoryManage',
        component: () => import('@/views/category/Index.vue'),
        meta: {
          title: '分类管理',
          requiresAuth: true,
        },
      },
      {
        path: 'tags',
        name: 'TagManage',
        component: () => import('@/views/tag/Index.vue'),
        meta: {
          title: '标签管理',
          requiresAuth: true,
        },
      },
      {
        path: 'files',
        name: 'FileManage',
        component: () => import('@/views/file/Index.vue'),
        meta: {
          title: '文件管理',
          requiresAuth: true,
        },
      },
      {
        path: 'links',
        name: 'LinkManage',
        component: () => import('@/views/link/Index.vue'),
        meta: {
          title: '友情链接',
          requiresAuth: true,
        },
      },
      {
        path: 'config',
        name: 'SystemConfig',
        component: () => import('@/views/config/Index.vue'),
        meta: {
          title: '系统配置',
          requiresAuth: true,
        },
      },
      {
        path: 'logs',
        name: 'LogsManage',
        component: () => import('@/views/logs/Index.vue'),
        meta: {
          title: '日志管理',
          requiresAuth: true,
        },
      },
      {
        path: 'test/image-upload',
        name: 'ImageUploadDemo',
        component: () => import('@/views/test/ImageUploadDemo.vue'),
        meta: {
          title: '图片上传测试',
          requiresAuth: true,
        },
      },
      {
        path: 'test/performance',
        name: 'PerformanceDemo',
        component: () => import('@/views/test/PerformanceDemo.vue'),
        meta: {
          title: '性能优化演示',
          requiresAuth: true,
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 设置路由守卫
setupRouterGuards(router)

export default router
