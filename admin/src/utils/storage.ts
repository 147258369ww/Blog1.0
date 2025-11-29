/**
 * 本地存储工具类
 * 提供类型安全的 localStorage 封装
 */

const STORAGE_PREFIX = 'blog_admin_'

/**
 * 缓存项接口
 */
interface CacheItem<T> {
  value: T
  expiresAt: number
}

export const storage = {
  /**
   * 设置存储项
   */
  set<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value)
      localStorage.setItem(STORAGE_PREFIX + key, serializedValue)
    } catch (error) {
      console.error('存储数据失败:', error)
    }
  },

  /**
   * 获取存储项
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key)
      if (item === null) {
        return null
      }
      return JSON.parse(item) as T
    } catch (error) {
      console.error('读取数据失败:', error)
      return null
    }
  },

  /**
   * 移除存储项
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key)
    } catch (error) {
      console.error('删除数据失败:', error)
    }
  },

  /**
   * 清空所有存储项
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('清空数据失败:', error)
    }
  },

  /**
   * 检查存储项是否存在
   */
  has(key: string): boolean {
    return localStorage.getItem(STORAGE_PREFIX + key) !== null
  },

  /**
   * 设置带过期时间的缓存项
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 过期时间（毫秒）
   */
  setCache<T>(key: string, value: T, ttl: number): void {
    try {
      const cacheItem: CacheItem<T> = {
        value,
        expiresAt: Date.now() + ttl,
      }
      const serializedValue = JSON.stringify(cacheItem)
      localStorage.setItem(STORAGE_PREFIX + 'cache_' + key, serializedValue)
    } catch (error) {
      console.error('设置缓存失败:', error)
    }
  },

  /**
   * 获取缓存项
   * @param key - 缓存键
   * @returns 缓存值，如果不存在或已过期则返回 null
   */
  getCache<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + 'cache_' + key)
      if (item === null) {
        return null
      }

      const cacheItem = JSON.parse(item) as CacheItem<T>

      // 检查是否过期
      if (Date.now() > cacheItem.expiresAt) {
        this.removeCache(key)
        return null
      }

      return cacheItem.value
    } catch (error) {
      console.error('读取缓存失败:', error)
      return null
    }
  },

  /**
   * 移除缓存项
   * @param key - 缓存键
   */
  removeCache(key: string): void {
    try {
      localStorage.removeItem(STORAGE_PREFIX + 'cache_' + key)
    } catch (error) {
      console.error('删除缓存失败:', error)
    }
  },

  /**
   * 清理所有过期的缓存
   */
  cleanupExpiredCache(): void {
    try {
      const keys = Object.keys(localStorage)
      const cachePrefix = STORAGE_PREFIX + 'cache_'
      const now = Date.now()

      keys.forEach(key => {
        if (key.startsWith(cachePrefix)) {
          try {
            const item = localStorage.getItem(key)
            if (item) {
              const cacheItem = JSON.parse(item) as CacheItem<unknown>
              if (now > cacheItem.expiresAt) {
                localStorage.removeItem(key)
              }
            }
          } catch (_error) {
            // 如果解析失败，删除该项
            localStorage.removeItem(key)
          }
        }
      })
    } catch (error) {
      console.error('清理过期缓存失败:', error)
    }
  },

  /**
   * 清空所有缓存
   */
  clearAllCache(): void {
    try {
      const keys = Object.keys(localStorage)
      const cachePrefix = STORAGE_PREFIX + 'cache_'

      keys.forEach(key => {
        if (key.startsWith(cachePrefix)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('清空缓存失败:', error)
    }
  },
}

// 定期清理过期缓存（每 10 分钟）
setInterval(
  () => {
    storage.cleanupExpiredCache()
  },
  10 * 60 * 1000
)
