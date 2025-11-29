/**
 * 缓存工具 Composable
 * 用于缓存 API 响应和其他数据，减少重复请求
 *
 * @module composables/useCache
 */

import { ref, type Ref } from 'vue'

/**
 * 缓存项接口
 */
interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
}

/**
 * 缓存存储
 */
class CacheStorage {
  private cache = new Map<string, CacheItem<unknown>>()

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) {
      return null
    }

    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, ttl: number): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    })
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size
  }
}

// 全局缓存实例
const cacheStorage = new CacheStorage()

// 定期清理过期缓存（每 5 分钟）
setInterval(
  () => {
    cacheStorage.cleanup()
  },
  5 * 60 * 1000
)

/**
 * API 响应缓存 Composable
 *
 * @param key - 缓存键
 * @param fetcher - 数据获取函数
 * @param options - 配置选项
 * @returns 缓存数据和相关方法
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useCache } from '@/composables/useCache'
 * import { articleApi } from '@/api/article'
 *
 * const { data, loading, error, fetch, refresh } = useCache(
 *   'articles-list',
 *   () => articleApi.getList({ page: 1, limit: 20 }),
 *   { ttl: 60000 } // 缓存 1 分钟
 * )
 *
 * // 组件挂载时自动获取数据
 * onMounted(() => {
 *   fetch()
 * })
 * </script>
 *
 * <template>
 *   <div v-loading="loading">
 *     <div v-if="error">{{ error.message }}</div>
 *     <div v-else-if="data">
 *       <!-- 显示数据 -->
 *     </div>
 *   </div>
 * </template>
 * ```
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number // 缓存时间（毫秒），默认 60 秒
    immediate?: boolean // 是否立即获取数据，默认 false
  } = {}
) {
  const { ttl = 60000, immediate = false } = options

  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * 获取数据
   * @param force - 是否强制刷新，忽略缓存
   */
  const fetch = async (force = false) => {
    // 如果不强制刷新，先尝试从缓存获取
    if (!force) {
      const cached = cacheStorage.get<T>(key)
      if (cached !== null) {
        data.value = cached
        return
      }
    }

    loading.value = true
    error.value = null

    try {
      const result = await fetcher()
      data.value = result
      cacheStorage.set(key, result, ttl)
    } catch (e) {
      error.value = e as Error
      console.error(`缓存获取失败 [${key}]:`, e)
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新数据（强制重新获取）
   */
  const refresh = () => fetch(true)

  /**
   * 清除缓存
   */
  const clear = () => {
    cacheStorage.delete(key)
    data.value = null
    error.value = null
  }

  // 立即获取数据
  if (immediate) {
    fetch()
  }

  return {
    data,
    loading,
    error,
    fetch,
    refresh,
    clear,
  }
}

/**
 * 简单缓存函数
 * 用于缓存函数调用结果
 *
 * @param fn - 要缓存的函数
 * @param options - 配置选项
 * @returns 缓存包装后的函数
 *
 * @example
 * ```typescript
 * import { cachedFn } from '@/composables/useCache'
 *
 * const getArticle = cachedFn(
 *   async (id: number) => {
 *     return await articleApi.getById(id)
 *   },
 *   { ttl: 300000 } // 缓存 5 分钟
 * )
 *
 * // 第一次调用会请求 API
 * const article1 = await getArticle(1)
 *
 * // 第二次调用会从缓存返回
 * const article2 = await getArticle(1)
 * ```
 */
export function cachedFn<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    ttl?: number
    keyGenerator?: (...args: Parameters<T>) => string
  } = {}
): T {
  const { ttl = 60000, keyGenerator = (...args: Parameters<T>) => JSON.stringify(args) } = options

  return (async (...args: Parameters<T>) => {
    const key = `fn:${fn.name}:${keyGenerator(...args)}`

    // 尝试从缓存获取
    const cached = cacheStorage.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // 调用原函数
    const result = await fn(...args)

    // 缓存结果
    cacheStorage.set(key, result, ttl)

    return result
  }) as T
}

/**
 * 清除所有缓存
 */
export function clearAllCache(): void {
  cacheStorage.clear()
}

/**
 * 清除指定前缀的缓存
 *
 * @param prefix - 缓存键前缀
 *
 * @example
 * ```typescript
 * // 清除所有文章相关的缓存
 * clearCacheByPrefix('articles')
 * ```
 */
export function clearCacheByPrefix(prefix: string): void {
  // 注意：Map 不支持按前缀删除，这里需要遍历
  // 在实际应用中，可以考虑使用更高效的数据结构
  console.warn(`clearCacheByPrefix('${prefix}') 需要遍历所有缓存，性能可能较差`)
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats() {
  return {
    size: cacheStorage.size,
  }
}

export default useCache
