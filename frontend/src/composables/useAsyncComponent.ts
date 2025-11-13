import { defineAsyncComponent, type Component } from 'vue'
import Loading from '@/components/common/Loading.vue'

/**
 * 创建异步组件的辅助函数
 * 
 * 功能:
 * - 组件级别懒加载
 * - 自动显示加载状态
 * - 错误处理
 * - 延迟加载优化
 * 
 * @param loader 组件加载函数
 * @param options 配置选项
 * @returns 异步组件
 */
export function useAsyncComponent(
  loader: () => Promise<Component>,
  options?: {
    delay?: number
    timeout?: number
    loadingComponent?: Component
    errorComponent?: Component
  }
) {
  return defineAsyncComponent({
    loader,
    loadingComponent: options?.loadingComponent || Loading,
    errorComponent: options?.errorComponent,
    delay: options?.delay || 200, // 延迟200ms显示loading
    timeout: options?.timeout || 10000, // 10秒超时
    onError(_error, retry, fail, attempts) {
      // 最多重试3次
      if (attempts <= 3) {
        retry()
      } else {
        fail()
      }
    }
  })
}

/**
 * 预加载组件
 * 
 * @param loader 组件加载函数
 */
export function preloadComponent(loader: () => Promise<Component>) {
  return loader()
}
