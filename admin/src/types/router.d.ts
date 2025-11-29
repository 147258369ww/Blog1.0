import 'vue-router'
import type { RouteMeta as CustomRouteMeta } from './common'

/**
 * 扩展 vue-router 的 RouteMeta 类型
 * 使其支持自定义的元信息字段
 */
declare module 'vue-router' {
  interface RouteMeta extends CustomRouteMeta {}
}
