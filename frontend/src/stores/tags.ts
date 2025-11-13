import { defineStore } from 'pinia'
import { ref } from 'vue'
import { tagsApi } from '@/services/api/tags'
import type { Tag, Post } from '@/types/models'

/**
 * 标签状态管理
 */
export const useTagsStore = defineStore('tags', () => {
  // State
  const tags = ref<Tag[]>([])
  const currentTag = ref<Tag | null>(null)
  const tagPosts = ref<Post[]>([])
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })
  const loading = ref(false)

  // Actions
  const fetchTags = async () => {
    loading.value = true
    try {
      const response = await tagsApi.getTags()
      tags.value = response.data
    } finally {
      loading.value = false
    }
  }

  const searchTags = async (keyword: string) => {
    loading.value = true
    try {
      const response = await tagsApi.searchTags({ keyword })
      tags.value = response.data
    } finally {
      loading.value = false
    }
  }

  const fetchTagPosts = async (
    id: number,
    params?: { page?: number; pageSize?: number }
  ) => {
    loading.value = true
    try {
      const response = await tagsApi.getTagPosts(id, params)
      tagPosts.value = response.data
      pagination.value = response.pagination
    } finally {
      loading.value = false
    }
  }

  return {
    tags,
    currentTag,
    tagPosts,
    pagination,
    loading,
    fetchTags,
    searchTags,
    fetchTagPosts
  }
})
