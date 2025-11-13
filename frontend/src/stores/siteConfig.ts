import { defineStore } from 'pinia'
import { ref } from 'vue'
import { settingsApi } from '@/services/api/settings'
import type { SiteConfig, SEOConfig, Stats } from '@/types/models'

/**
 * 网站配置状态管理
 */
export const useSiteConfigStore = defineStore('siteConfig', () => {
  // State
  const siteConfig = ref<SiteConfig | null>(null)
  const seoConfig = ref<SEOConfig | null>(null)
  const stats = ref<Stats | null>(null)
  const loading = ref(false)

  // Actions
  const fetchSiteConfig = async () => {
    loading.value = true
    try {
      const response = await settingsApi.getSiteConfig()
      siteConfig.value = response.data
    } finally {
      loading.value = false
    }
  }

  const fetchSeoConfig = async () => {
    loading.value = true
    try {
      const response = await settingsApi.getSEOConfig()
      seoConfig.value = response.data
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    loading.value = true
    try {
      const response = await settingsApi.getStats()
      stats.value = response.data
    } finally {
      loading.value = false
    }
  }

  const initializeConfig = async () => {
    await Promise.all([fetchSiteConfig(), fetchSeoConfig(), fetchStats()])
  }

  return {
    siteConfig,
    seoConfig,
    stats,
    loading,
    fetchSiteConfig,
    fetchSeoConfig,
    fetchStats,
    initializeConfig
  }
})
