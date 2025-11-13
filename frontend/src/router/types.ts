import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    guest?: boolean
    // SEO 相关元数据
    description?: string
    keywords?: string | string[]
    ogImage?: string
    ogType?: string
    robots?: string
    canonical?: string
  }
}
