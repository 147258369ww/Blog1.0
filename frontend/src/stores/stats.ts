import { defineStore } from 'pinia'
import { ref } from 'vue'
import { statsApi } from '@/services/api/stats'
import { cacheManager } from '@/utils/cache'
import type { Stats } from '@/types'

/**
 * 统计数据状态管理 Store
 * 
 * 功能:
 * - 统计数据状态管理
 * - 缓存策略 (使用 CacheManager, 10分钟 TTL)
 * - 自动刷新机制
 */
export const useStatsStore = defineStore('stats', () => {
  // State
  const stats = ref<Stats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Cache配置
  const CACHE_KEY = 'stats:global'
  const CACHE_DURATION = 10 * 60 * 1000 // 10分钟 TTL

  /**
   * 获取统计数据
   * @param forceRefresh 是否强制刷新 (忽略缓存)
   */
  const fetchStats = async (forceRefresh = false) => {
    // 检查缓存
    if (!forceRefresh) {
      const cached = cacheManager.get<Stats>(CACHE_KEY)
      if (cached) {
        stats.value = cached
        return
      }
    }

    loading.value = true
    error.value = null

    try {
      const response = await statsApi.getStats()
      stats.value = response.data

      // 更新缓存
      cacheManager.set(CACHE_KEY, response.data, CACHE_DURATION)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch stats'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新统计数据 (强制从服务器获取)
   */
  const refreshStats = async () => {
    await fetchStats(true)
  }

  /**
   * 清除缓存
   */
  const clearCache = () => {
    cacheManager.remove(CACHE_KEY)
  }

  /**
   * 重置状态
   */
  const reset = () => {
    stats.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    stats,
    loading,
    error,

    // Actions
    fetchStats,
    refreshStats,
    clearCache,
    reset
  }
})
