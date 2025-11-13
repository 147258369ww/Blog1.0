import { defineStore } from 'pinia'
import { ref } from 'vue'
import { postsApi } from '@/services/api/posts'
import { cacheManager } from '@/utils/cache'
import type { Post, GetPostsParams, SearchRequest } from '@/types'

/**
 * 文章状态管理 Store
 * 
 * 功能:
 * - 文章列表和详情状态管理
 * - 分页状态管理
 * - API 响应缓存策略 (使用 CacheManager, 5分钟 TTL)
 * - 搜索功能
 */
export const usePostsStore = defineStore('posts', () => {
  // State
  const posts = ref<Post[]>([])
  const currentPost = ref<Post | null>(null)
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Cache配置
  const CACHE_DURATION = 5 * 60 * 1000 // 5分钟 TTL
  const CACHE_PREFIX = 'posts:'

  // 缓存数据接口
  interface CachedPostsData {
    data: Post[]
    pagination: {
      page: number
      pageSize: number
      total: number
      totalPages: number
    }
  }

  // Actions

  /**
   * 获取文章列表
   * @param params 查询参数 (page, pageSize, categoryId, tagId)
   */
  const fetchPosts = async (params?: GetPostsParams) => {
    const cacheKey = `${CACHE_PREFIX}list:${JSON.stringify(params || {})}`
    
    // 检查缓存
    const cached = cacheManager.get<CachedPostsData>(cacheKey)
    if (cached) {
      posts.value = cached.data
      pagination.value = cached.pagination
      return
    }

    loading.value = true
    error.value = null
    
    try {
      const response = await postsApi.getPosts(params)
      posts.value = response.data
      pagination.value = response.pagination

      // 更新缓存
      cacheManager.set(cacheKey, {
        data: response.data,
        pagination: response.pagination
      }, CACHE_DURATION)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch posts'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取文章详情
   * @param id 文章ID
   */
  const fetchPost = async (id: number) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await postsApi.getPost(id)
      currentPost.value = response.data

      // 增加浏览量
      await postsApi.incrementViewCount(id)
      
      // 更新当前文章的浏览量
      if (currentPost.value) {
        currentPost.value.viewCount += 1
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch post'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索文章
   * @param keyword 搜索关键词
   * @param page 页码
   * @param pageSize 每页数量
   */
  const searchPosts = async (keyword: string, page = 1, pageSize = 10) => {
    const cacheKey = `${CACHE_PREFIX}search:${keyword}:${page}:${pageSize}`
    
    // 检查缓存
    const cached = cacheManager.get<CachedPostsData>(cacheKey)
    if (cached) {
      posts.value = cached.data
      pagination.value = cached.pagination
      return
    }

    loading.value = true
    error.value = null
    
    try {
      const params: SearchRequest = { keyword, page, pageSize }
      const response = await postsApi.searchPosts(params)
      posts.value = response.data
      pagination.value = response.pagination

      // 更新缓存
      cacheManager.set(cacheKey, {
        data: response.data,
        pagination: response.pagination
      }, CACHE_DURATION)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search posts'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 清除所有文章相关缓存
   */
  const clearCache = () => {
    const keys = cacheManager.keys()
    const postsKeys = keys.filter(key => key.startsWith(CACHE_PREFIX))
    cacheManager.removeMany(postsKeys)
  }

  /**
   * 清除特定缓存项
   * @param params 查询参数或搜索关键词
   */
  const clearCacheItem = (params?: GetPostsParams | string) => {
    let cacheKey: string
    
    if (typeof params === 'string') {
      // 搜索缓存
      cacheKey = `${CACHE_PREFIX}search:${params}`
    } else {
      // 列表缓存
      cacheKey = `${CACHE_PREFIX}list:${JSON.stringify(params || {})}`
    }
    
    cacheManager.remove(cacheKey)
  }

  /**
   * 重置状态
   */
  const reset = () => {
    posts.value = []
    currentPost.value = null
    pagination.value = {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    }
    loading.value = false
    error.value = null
  }

  return {
    // State
    posts,
    currentPost,
    pagination,
    loading,
    error,

    // Actions
    fetchPosts,
    fetchPost,
    searchPosts,
    clearCache,
    clearCacheItem,
    reset
  }
})
