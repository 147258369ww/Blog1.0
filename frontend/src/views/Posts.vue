<template>
  <div class="posts-page">
    <!-- Page Header -->
    <div class="posts-page__header">
      <h1 class="posts-page__title">所有文章</h1>
      <p class="posts-page__description">
        探索所有文章、教程和见解
      </p>
    </div>

    <!-- Filters -->
    <div class="posts-page__filters">
      <div class="posts-page__filter-group">
        <label for="category-filter" class="posts-page__filter-label">分类：</label>
        <select
          id="category-filter"
          v-model="selectedCategoryId"
          class="posts-page__filter-select"
          @change="handleFilterChange"
        >
          <option :value="null">所有分类</option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </div>

      <div class="posts-page__filter-group">
        <label for="tag-filter" class="posts-page__filter-label">标签：</label>
        <select
          id="tag-filter"
          v-model="selectedTagId"
          class="posts-page__filter-select"
          @change="handleFilterChange"
        >
          <option :value="null">所有标签</option>
          <option
            v-for="tag in tags"
            :key="tag.id"
            :value="tag.id"
          >
            {{ tag.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Main Content with Sidebar -->
    <div class="posts-page__layout">
      <!-- Posts List -->
      <div class="posts-page__content">
        <!-- Loading State -->
        <div v-if="postsStore.loading" class="posts-page__loading">
          <Skeleton
            v-for="i in 6"
            :key="i"
            variant="rounded"
            height="400px"
            class="posts-page__skeleton"
          />
        </div>

        <!-- Empty State -->
        <EmptyState
          v-else-if="!postsStore.loading && postsStore.posts.length === 0"
          title="未找到文章"
          description="没有符合您筛选条件的文章。请尝试调整搜索条件。"
          action-text="清除筛选"
          @action="clearFilters"
        >
          <template #icon>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 16C8 11.5817 11.5817 8 16 8H48C52.4183 8 56 11.5817 56 16V48C56 52.4183 52.4183 56 48 56H16C11.5817 56 8 52.4183 8 48V16Z" stroke="currentColor" stroke-width="2"/>
              <path d="M8 24H56M20 16V8M44 16V8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </template>
        </EmptyState>

        <!-- Posts Grid -->
        <div v-else class="posts-page__grid">
          <BlogPostCard
            v-for="post in postsStore.posts"
            :key="post.id"
            :post="post"
            layout="grid"
          />
        </div>

        <!-- Pagination -->
        <Pagination
          v-if="!postsStore.loading && postsStore.posts.length > 0"
          :current-page="postsStore.pagination.page"
          :total-pages="postsStore.pagination.totalPages"
          @page-change="handlePageChange"
        />
      </div>

      <!-- Sidebar -->
      <Sidebar
        :visible="true"
        :show-search="true"
        :show-popular-posts="true"
        :show-tag-cloud="true"
        :popular-posts="popularPosts"
        :tags="tags"
        @search="handleSearch"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePostsStore } from '@/stores/posts'
import { categoriesApi } from '@/services/api/categories'
import { tagsApi } from '@/services/api/tags'
import BlogPostCard from '@/components/blog/BlogPostCard.vue'
import Pagination from '@/components/common/Pagination.vue'
import Skeleton from '@/components/common/Skeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import type { Category, Tag, Post } from '@/types/models'

const router = useRouter()
const route = useRoute()
const postsStore = usePostsStore()

const selectedCategoryId = ref<number | null>(null)
const selectedTagId = ref<number | null>(null)
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const popularPosts = ref<Post[]>([])

// Initialize filters from URL query params
const initializeFilters = () => {
  if (route.query.categoryId) {
    selectedCategoryId.value = Number(route.query.categoryId)
  }
  if (route.query.tagId) {
    selectedTagId.value = Number(route.query.tagId)
  }
}

// Fetch posts with current filters
const fetchPosts = async (page = 1) => {
  try {
    await postsStore.fetchPosts({
      page,
      pageSize: 12,
      categoryId: selectedCategoryId.value || undefined,
      tagId: selectedTagId.value || undefined
    })
  } catch (error) {
    console.error('Failed to fetch posts:', error)
  }
}

// Fetch categories
const fetchCategories = async () => {
  try {
    const response = await categoriesApi.getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

// Fetch tags
const fetchTags = async () => {
  try {
    const response = await tagsApi.getTags()
    tags.value = response.data
  } catch (error) {
    console.error('Failed to fetch tags:', error)
  }
}

// Fetch popular posts for sidebar
const fetchPopularPosts = async () => {
  try {
    await postsStore.fetchPosts({
      page: 1,
      pageSize: 5
    })
    // Store popular posts separately (top 5 by view count would be ideal)
    popularPosts.value = postsStore.posts.slice(0, 5)
  } catch (error) {
    console.error('Failed to fetch popular posts:', error)
  }
}

// Handle filter change
const handleFilterChange = () => {
  // Update URL query params
  router.push({
    query: {
      ...(selectedCategoryId.value && { categoryId: selectedCategoryId.value }),
      ...(selectedTagId.value && { tagId: selectedTagId.value })
    }
  })
  
  // Fetch posts with new filters
  fetchPosts(1)
}

// Clear all filters
const clearFilters = () => {
  selectedCategoryId.value = null
  selectedTagId.value = null
  router.push({ query: {} })
  fetchPosts(1)
}

// Handle page change
const handlePageChange = (page: number) => {
  fetchPosts(page)
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Handle search from sidebar
const handleSearch = (query: string) => {
  if (query.trim()) {
    router.push({ name: 'Search', query: { q: query } })
  }
}

// Watch route query changes
watch(
  () => route.query,
  () => {
    initializeFilters()
  }
)

onMounted(async () => {
  initializeFilters()
  await Promise.all([
    fetchPosts(),
    fetchCategories(),
    fetchTags(),
    fetchPopularPosts()
  ])
})
</script>

<style scoped>
.posts-page {
  max-width: 1440px;
  margin: 0 auto;
  padding: 56px 24px 48px; /* 减少上边距，因为 main-content 已有 padding-top */
}

.posts-page__header {
  text-align: center;
  margin-bottom: 48px;
}

.posts-page__title {
  margin: 0 0 12px 0;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary, #1A1A1A);
  letter-spacing: -0.02em;
}

.posts-page__description {
  margin: 0;
  font-size: 18px;
  line-height: 1.6;
  color: var(--text-secondary, #667085);
}

.posts-page__filters {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.posts-page__filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.posts-page__filter-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #1A1A1A);
}

.posts-page__filter-select {
  min-width: 200px;
  padding: 10px 14px;
  background-color: var(--bg-primary, #FFFFFF);
  border: 1px solid var(--color-gray-300, #D0D5DD);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary, #1A1A1A);
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.posts-page__filter-select:focus {
  outline: none;
  border-color: var(--color-primary-600, #7F56D9);
}

.posts-page__layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 48px;
}

.posts-page__content {
  min-width: 0;
}

.posts-page__loading {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.posts-page__skeleton {
  width: 100%;
}

.posts-page__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* Dark theme */
[data-theme="dark"] .posts-page__title {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .posts-page__description {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme="dark"] .posts-page__filter-label {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .posts-page__filter-select {
  background-color: var(--bg-secondary, #121212);
  border-color: rgba(255, 255, 255, 0.34);
  color: var(--text-primary, #FFFFFF);
}

/* Responsive - Tablet */
@media (max-width: 1439px) {
  .posts-page__layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .posts-page__grid,
  .posts-page__loading {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Responsive - Mobile */
@media (max-width: 834px) {
  .posts-page {
    padding: 32px 16px 32px; /* 移动端减少上边距 */
  }

  .posts-page__header {
    margin-bottom: 32px;
  }

  .posts-page__title {
    font-size: 32px;
  }

  .posts-page__description {
    font-size: 16px;
  }

  .posts-page__filters {
    flex-direction: column;
    gap: 12px;
  }

  .posts-page__filter-group {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .posts-page__filter-select {
    width: 100%;
  }

  .posts-page__grid,
  .posts-page__loading {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
