<template>
  <div class="category-detail-page">
    <!-- Loading State for Category Info -->
    <div v-if="loadingCategory" class="category-detail-page__header-loading">
      <Skeleton variant="text" width="200px" height="48px" />
      <Skeleton variant="text" width="400px" height="24px" style="margin-top: 12px;" />
    </div>

    <!-- Category Header -->
    <div v-else-if="category" class="category-detail-page__header" :style="getCategoryHeaderStyle()">
      <div class="category-detail-page__header-content">
        <div class="category-detail-page__icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12C6 8.68629 8.68629 6 12 6H36C39.3137 6 42 8.68629 42 12V36C42 39.3137 39.3137 42 36 42H12C8.68629 42 6 39.3137 6 36V12Z" stroke="currentColor" stroke-width="2"/>
            <path d="M6 18H42M15 12V6M33 12V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="category-detail-page__info">
          <h1 class="category-detail-page__title">{{ category.name }}</h1>
          <p v-if="category.description" class="category-detail-page__description">
            {{ category.description }}
          </p>
          <div v-if="category.postCount > 0" class="category-detail-page__meta">
            <span class="category-detail-page__count">
              {{ category.postCount }} 篇文章
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <EmptyState
      v-else-if="!loadingCategory && !category"
      title="未找到分类"
      description="您查找的分类不存在或已被删除。"
      action-text="浏览所有分类"
      @action="$router.push('/categories')"
    >
      <template #icon>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 56C45.2548 56 56 45.2548 56 32C56 18.7452 45.2548 8 32 8C18.7452 8 8 18.7452 8 32C8 45.2548 18.7452 56 32 56Z" stroke="currentColor" stroke-width="2"/>
          <path d="M32 20V32M32 44H32.02" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </template>
    </EmptyState>

    <!-- Posts Section -->
    <div v-if="category" class="category-detail-page__content">
      <!-- Loading State for Posts -->
      <div v-if="loadingPosts" class="category-detail-page__loading">
        <Skeleton
          v-for="i in 6"
          :key="i"
          variant="rounded"
          height="400px"
          class="category-detail-page__skeleton"
        />
      </div>

      <!-- Empty State for Posts -->
      <EmptyState
        v-else-if="!loadingPosts && posts.length === 0"
        title="该分类下暂无文章"
        description="该分类下还没有文章。稍后再来查看新内容。"
        action-text="浏览所有文章"
        @action="$router.push('/posts')"
      >
        <template #icon>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 16C8 11.5817 11.5817 8 16 8H48C52.4183 8 56 11.5817 56 16V48C56 52.4183 52.4183 56 48 56H16C11.5817 56 8 52.4183 8 48V16Z" stroke="currentColor" stroke-width="2"/>
            <path d="M8 24H56M20 16V8M44 16V8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </template>
      </EmptyState>

      <!-- Posts Grid -->
      <div v-else class="category-detail-page__grid">
        <BlogPostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          layout="grid"
        />
      </div>

      <!-- Pagination -->
      <Pagination
        v-if="!loadingPosts && posts.length > 0"
        :current-page="pagination.page"
        :total-pages="pagination.totalPages"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { categoriesApi } from '@/services/api/categories'
import BlogPostCard from '@/components/blog/BlogPostCard.vue'
import Pagination from '@/components/common/Pagination.vue'
import Skeleton from '@/components/common/Skeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Category, Post } from '@/types/models'

const route = useRoute()

const category = ref<Category | null>(null)
const posts = ref<Post[]>([])
const loadingCategory = ref(false)
const loadingPosts = ref(false)
const pagination = ref({
  page: 1,
  pageSize: 12,
  total: 0,
  totalPages: 0
})

// Get category header style with dynamic color
const getCategoryHeaderStyle = () => {
  if (!category.value) return {}
  
  const color = category.value.color || '#7F56D9'
  
  // Convert hex to RGB for gradient
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1]!, 16),
      g: parseInt(result[2]!, 16),
      b: parseInt(result[3]!, 16)
    } : { r: 127, g: 86, b: 217 }
  }
  
  const rgb = hexToRgb(color)
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  
  return {
    background: isDark
      ? `linear-gradient(135deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) 100%)`
      : `linear-gradient(135deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05) 100%)`,
    color: color
  }
}

// Fetch category details
const fetchCategory = async (id: number) => {
  loadingCategory.value = true
  try {
    const response = await categoriesApi.getCategory(id)
    category.value = response.data
  } catch (error) {
    console.error('Failed to fetch category:', error)
    category.value = null
  } finally {
    loadingCategory.value = false
  }
}

// Fetch category posts
const fetchCategoryPosts = async (id: number, page = 1) => {
  loadingPosts.value = true
  try {
    const response = await categoriesApi.getCategoryPosts(id, {
      page,
      pageSize: 12
    })
    posts.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    console.error('Failed to fetch category posts:', error)
    posts.value = []
  } finally {
    loadingPosts.value = false
  }
}

// Handle page change
const handlePageChange = (page: number) => {
  const categoryId = Number(route.params.id)
  fetchCategoryPosts(categoryId, page)
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Watch route params changes
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      const categoryId = Number(newId)
      fetchCategory(categoryId)
      fetchCategoryPosts(categoryId)
    }
  }
)

onMounted(() => {
  const categoryId = Number(route.params.id)
  if (categoryId) {
    fetchCategory(categoryId)
    fetchCategoryPosts(categoryId)
  }
})
</script>

<style scoped>
.category-detail-page {
  max-width: 1440px;
  margin: 0 auto;
  padding: 48px 24px;
}

.category-detail-page__header-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48px;
}

.category-detail-page__header {
  margin-bottom: 48px;
  padding: 48px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.category-detail-page__header-content {
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
  z-index: 1;
}

.category-detail-page__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.category-detail-page__info {
  flex: 1;
}

.category-detail-page__title {
  margin: 0 0 12px 0;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.category-detail-page__description {
  margin: 0 0 16px 0;
  font-size: 18px;
  line-height: 1.6;
  opacity: 0.9;
}

.category-detail-page__meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.category-detail-page__count {
  font-size: 16px;
  font-weight: 600;
  opacity: 0.9;
}

.category-detail-page__content {
  margin-top: 48px;
}

.category-detail-page__loading {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.category-detail-page__skeleton {
  width: 100%;
}

.category-detail-page__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 48px;
}

/* Responsive - Tablet */
@media (max-width: 1439px) {
  .category-detail-page__grid,
  .category-detail-page__loading {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Responsive - Mobile */
@media (max-width: 834px) {
  .category-detail-page {
    padding: 32px 16px;
  }

  .category-detail-page__header {
    padding: 32px 24px;
    margin-bottom: 32px;
  }

  .category-detail-page__header-content {
    flex-direction: column;
    text-align: center;
  }

  .category-detail-page__icon {
    width: 72px;
    height: 72px;
  }

  .category-detail-page__icon svg {
    width: 36px;
    height: 36px;
  }

  .category-detail-page__title {
    font-size: 32px;
  }

  .category-detail-page__description {
    font-size: 16px;
  }

  .category-detail-page__meta {
    justify-content: center;
  }

  .category-detail-page__content {
    margin-top: 32px;
  }

  .category-detail-page__grid,
  .category-detail-page__loading {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
