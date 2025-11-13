/**
 * 缓存管理器
 * 
 * 功能:
 * - 内存缓存管理
 * - TTL (Time To Live) 支持
 * - 自动过期清理
 * - 缓存统计
 */

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheStats {
  hits: number
  misses: number
  size: number
}

export class CacheManager {
  private cache = new Map<string, CacheItem<any>>()
  private defaultTTL: number
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0
  }

  /**
   * 创建缓存管理器实例
   * @param defaultTTL 默认缓存时间 (毫秒), 默认5分钟
   */
  constructor(defaultTTL = 5 * 60 * 1000) {
    this.defaultTTL = defaultTTL
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param data 缓存数据
   * @param ttl 缓存时间 (毫秒), 可选
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    }
    
    this.cache.set(key, cacheItem)
    this.stats.size = this.cache.size
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存数据或null
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      this.stats.misses++
      return null
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      this.stats.size = this.cache.size
      this.stats.misses++
      return null
    }

    this.stats.hits++
    return item.data as T
  }

  /**
   * 检查缓存是否存在且有效
   * @param key 缓存键
   * @returns 是否存在
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      this.stats.size = this.cache.size
      return false
    }

    return true
  }

  /**
   * 删除指定缓存
   * @param key 缓存键
   */
  remove(key: string): void {
    this.cache.delete(key)
    this.stats.size = this.cache.size
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.cache.clear()
    this.stats.size = 0
  }

  /**
   * 清除过期缓存
   */
  clearExpired(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.cache.delete(key))
    this.stats.size = this.cache.size
  }

  /**
   * 获取缓存统计信息
   * @returns 缓存统计
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      size: this.cache.size
    }
  }

  /**
   * 获取所有缓存键
   * @returns 缓存键数组
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 获取缓存大小
   * @returns 缓存项数量
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 批量设置缓存
   * @param entries 缓存条目数组
   */
  setMany<T>(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    entries.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl)
    })
  }

  /**
   * 批量获取缓存
   * @param keys 缓存键数组
   * @returns 缓存数据映射
   */
  getMany<T>(keys: string[]): Map<string, T | null> {
    const result = new Map<string, T | null>()
    keys.forEach(key => {
      result.set(key, this.get<T>(key))
    })
    return result
  }

  /**
   * 批量删除缓存
   * @param keys 缓存键数组
   */
  removeMany(keys: string[]): void {
    keys.forEach(key => this.remove(key))
  }
}

// 创建全局缓存管理器实例
export const cacheManager = new CacheManager()

// 定期清理过期缓存 (每5分钟)
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheManager.clearExpired()
  }, 5 * 60 * 1000)
}
