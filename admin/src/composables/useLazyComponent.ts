/**
 * 组件懒加载工具 Composable
 * 用于优化组件加载性能
 *
 * @module composables/useLazyComponent
 */

import { defineAsyncComponent, type Component } from 'vue'

/**
 * 懒加载组件配置
 */
interface LazyComponentOptions {
  /**
   * 加载延迟（毫秒）
   * 如果组件在此时间内加载完成，不显示加载状态
   */
  delay?: number

  /**
   * 超时时间（毫秒）
   */
  timeout?: number

  /**
   * 是否显示加载提示
   */
  showLoading?: boolean

  /**
   * 加载提示文本
   */
  loadingText?: string

  /**
   * 错误提示文本
   */
  errorText?: string
}

/**
 * 创建懒加载组件
 *
 * @param loader - 组件加载函数
 * @param options - 配置选项
 * @returns 异步组件
 *
 * @example
 * ```typescript
 * import { useLazyComponent } from '@/composables/useLazyComponent'
 *
 * const RichTextEditor = useLazyComponent(
 *   () => import('@/components/editor/RichTextEditor.vue'),
 *   {
 *     delay: 200,
 *     loadingText: '加载编辑器中...',
 *   }
 * )
 * ```
 */
export function useLazyComponent(
  loader: () => Promise<Component>,
  options: LazyComponentOptions = {}
): Component {
  const {
    delay = 200,
    timeout = 30000,
    showLoading = false,
    loadingText = '加载中...',
    errorText = '组件加载失败',
  } = options

  return defineAsyncComponent({
    loader,
    delay,
    timeout,

    // 加载中显示的组件
    loadingComponent: showLoading
      ? {
          template: `
          <div style="display: flex; justify-content: center; align-items: center; min-height: 200px;">
            <el-loading :text="loadingText" />
          </div>
        `,
          data() {
            return { loadingText }
          },
        }
      : undefined,

    // 加载失败显示的组件
    errorComponent: {
      template: `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 200px; color: #f56c6c;">
          <el-icon :size="48" style="margin-bottom: 16px;">
            <WarningFilled />
          </el-icon>
          <p>{{ errorText }}</p>
          <el-button type="primary" size="small" @click="retry" style="margin-top: 16px;">
            重试
          </el-button>
        </div>
      `,
      data() {
        return { errorText }
      },
      methods: {
        retry() {
          window.location.reload()
        },
      },
    },

    // 加载失败时的回调
    onError(error, retry, fail, attempts) {
      console.error('组件加载失败:', error)

      // 最多重试 3 次
      if (attempts <= 3) {
        console.log(`重试加载组件 (${attempts}/3)`)
        retry()
      } else {
        console.error('组件加载失败，已达到最大重试次数')
        fail()
      }
    },
  })
}

/**
 * 预加载组件
 * 在空闲时预加载组件，提升用户体验
 *
 * @param loader - 组件加载函数
 *
 * @example
 * ```typescript
 * import { preloadComponent } from '@/composables/useLazyComponent'
 *
 * // 在路由守卫中预加载下一个页面的组件
 * router.beforeEach((to, from, next) => {
 *   if (to.name === 'ArticleEdit') {
 *     preloadComponent(() => import('@/components/editor/RichTextEditor.vue'))
 *   }
 *   next()
 * })
 * ```
 */
export function preloadComponent(loader: () => Promise<Component>): void {
  // 使用 requestIdleCallback 在浏览器空闲时预加载
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      loader().catch(error => {
        console.warn('组件预加载失败:', error)
      })
    })
  } else {
    // 降级方案：使用 setTimeout
    setTimeout(() => {
      loader().catch(error => {
        console.warn('组件预加载失败:', error)
      })
    }, 1000)
  }
}

/**
 * 批量预加载组件
 *
 * @param loaders - 组件加载函数数组
 *
 * @example
 * ```typescript
 * import { preloadComponents } from '@/composables/useLazyComponent'
 *
 * // 预加载多个组件
 * preloadComponents([
 *   () => import('@/components/editor/RichTextEditor.vue'),
 *   () => import('@/components/upload/ImageUpload.vue'),
 *   () => import('@/components/chart/LineChart.vue'),
 * ])
 * ```
 */
export function preloadComponents(loaders: Array<() => Promise<Component>>): void {
  loaders.forEach(loader => {
    preloadComponent(loader)
  })
}

export default useLazyComponent
