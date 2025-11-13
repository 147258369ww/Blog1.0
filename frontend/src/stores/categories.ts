import { defineStore } from 'pinia'
import { ref } from 'vue'
import { categoriesApi } from '@/services/api/categories'
import type { Category, Post } from '@/types/models'

/**
 * 分类状态管理
 */
export const useCategoriesStore = defineStore('categories', () => {
  // State
  const categories = ref<Category[]>([])
  const currentCategory = ref<Category | null>(null)
  const categoryPosts = ref<Post[]>([])
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })
  const loading = ref(false)

  // Actions
  const fetchCategories = async () => {
    loading.value = true
    try {
      const response = await categoriesApi.getCategories()
      categories.value = response.data
    } finally {
      loading.value = false
    }
  }

  const fetchCategory = async (id: number) => {
    loading.value = true
    try {
      const response = await categoriesApi.getCategory(id)
      currentCategory.value = response.data
    } finally {
      loading.value = false
    }
  }

  const fetchCategoryPosts = async (
    id: number,
    params?: { page?: number; pageSize?: number }
  ) => {
    loading.value = true
    try {
      const response = await categoriesApi.getCategoryPosts(id, params)
      categoryPosts.value = response.data
      pagination.value = response.pagination
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    currentCategory,
    categoryPosts,
    pagination,
    loading,
    fetchCategories,
    fetchCategory,
    fetchCategoryPosts
  }
})
