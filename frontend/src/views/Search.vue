<template>
  <div class="search-page">
    <!-- Page Header -->
    <div class="search-page__header">
      <h1 class="search-page__title">Search</h1>
      <p class="search-page__description">
        Find articles, tutorials, and insights
      </p>
    </div>

    <!-- Search Input -->
    <div class="search-page__search-box">
      <div class="search-page__input-wrapper">
        <svg class="search-page__search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          class="search-page__input"
          placeholder="Search for articles..."
          @keyup.enter="handleSearch"
          aria-label="Search articles"
        />
        <button
          v-if="searchQuery"
          class="search-page__clear-button"
          @click="clearSearch"
          aria-label="Clear search"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Search History -->
      <div v-if="searchHistory.length > 0 && !searchQuery && !hasSearched" class="search-page__history">
        <div class="search-page__history-header">
          <h3 class="search-page__history-title">Recent Searches</h3>
          <button
            class="search-page__history-clear"
            @click="clearHistory"
          >
            Clear All
          </button>
        </div>
        <div class="search-page__history-list">
          <button
            v-for="(item, index) in searchHistory"
            :key="index"
            class="search-page__history-item"
            @click="selectHistoryItem(item)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.99999 14.6667C11.6819 14.6667 14.6666 11.6819 14.6666 8.00001C14.6666 4.31811 11.6819 1.33334 7.99999 1.33334C4.31809 1.33334 1.33333 4.31811 1.33333 8.00001C1.33333 11.6819 4.31809 14.6667 7.99999 14.6667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 4V8L10.6667 9.33333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ item }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div v-if="hasSearched" class="search-page__filters">
      <div class="search-page__filter-group">
        <label for="category-filter" class="search-page__filter-label">Category:</label>
        <select
          id="category-filter"
          v-model="selectedCategoryId"
          class="search-page__filter-select"
          @change="handleFilterChange"
        >
          <option :value="null">All Categories</option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </div>

      <div class="search-page__filter-group">
        <label for="tag-filter" class="search-page__filter-label">Tag:</label>
        <select
          id="tag-filter"
          v-model="selectedTagId"
          class="search-page__filter-select"
          @change="handleFilterChange"
        >
          <option :value="null">All Tags</option>
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

    <!-- Search Results -->
    <div v-if="hasSearched" class="search-page__results">
      <!-- Results Header -->
      <div class="search-page__results-header">
        <h2 class="search-page__results-title">
          <template v-if="!postsStore.loading">
            {{ postsStore.pagination.total }} result{{ postsStore.pagination.total !== 1 ? 's' : '' }}
            <span v-if="debouncedQuery" class="search-page__results-query">
              for "<span class="search-page__highlight">{{ debouncedQuery }}</span>"
            </span>
          </template>
          <template v-else>
            Searching...
          </template>
        </h2>
      </div>

      <!-- Loading State -->
      <div v-if="postsStore.loading" class="search-page__loading">
        <Skeleton
          v-for="i in 6"
          :key="i"
          variant="rounded"
          height="200px"
          class="search-page__skeleton"
        />
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else-if="!postsStore.loading && postsStore.posts.length === 0"
        title="No results found"
        :description="`We couldn't find any articles matching '${debouncedQuery}'. Try different keywords or adjust your filters.`"
        action-text="Clear Search"
        @action="clearSearch"
      >
        <template #icon>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M28 48C38.4934 48 47 39.4934 47 29C47 18.5066 38.4934 10 28 10C17.5066 10 9 18.5066 9 29C9 39.4934 17.5066 48 28 48Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M41.5 41.5L55 55" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M28 21V29L33 34" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
      </EmptyState>

      <!-- Results Grid -->
      <div v-else class="search-page__grid">
        <BlogPostCard
          v-for="post in highlightedPosts"
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

    <!-- Initial State (No search yet) -->
    <div v-else class="search-page__initial">
      <div class="search-page__initial-icon">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M35 60C48.8071 60 60 48.8071 60 35C60 21.1929 48.8071 10 35 10C21.1929 10 10 21.1929 10 35C10 48.8071 21.1929 60 35 60Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M52.5 52.5L70 70" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2 class="search-page__initial-title">Start searching</h2>
      <p class="search-page__initial-description">
        Enter keywords to find articles, tutorials, and insights
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { errorHandler, ErrorLevel } from '@/utils/errorHandler'
import { useRoute, useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/posts'
import { categoriesApi } from '@/services/api/categories'
import { tagsApi } from '@/services/api/tags'
import { useDebounce } from '@/composables/useDebounce'
import BlogPostCard from '@/components/blog/BlogPostCard.vue'
import Pagination from '@/components/common/Pagination.vue'
import Skeleton from '@/components/common/Skeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Category, Tag } from '@/types/models'

const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()

// Search state
const searchQuery = ref('')
const debouncedQuery = useDebounce(searchQuery, 500)
const hasSearched = ref(false)

// Filter state
const selectedCategoryId = ref<number | null>(null)
const selectedTagId = ref<number | null>(null)
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

// Search history (localStorage)
const HISTORY_KEY = 'search_history'
const MAX_HISTORY_ITEMS = 10
const searchHistory = ref<string[]>([])

// Load search history from localStorage
const loadSearchHistory = () => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    if (stored) {
      searchHistory.value = JSON.parse(stored)
    }
  } catch (error) {
    errorHandler.log('Failed to load search history', ErrorLevel.ERROR, { error: String(error) })
    searchHistory.value = []
  }
}

// Save search history to localStorage
const saveSearchHistory = (query: string) => {
  if (!query.trim()) return

  // Remove duplicates and add to beginning
  const filtered = searchHistory.value.filter(item => item !== query)
  searchHistory.value = [query, ...filtered].slice(0, MAX_HISTORY_ITEMS)

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory.value))
  } catch (error) {
    errorHandler.log('Failed to save search history', ErrorLevel.ERROR, { error: String(error) })
  }
}

// Clear search history
const clearHistory = () => {
  searchHistory.value = []
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch (error) {
    errorHandler.log('Failed to clear search history', ErrorLevel.ERROR, { error: String(error) })
  }
}

// Select history item
const selectHistoryItem = (query: string) => {
  searchQuery.value = query
  handleSearch()
}

// Highlight keywords in text
const highlightText = (text: string, keyword: string): string => {
  if (!keyword.trim()) return text
  
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<mark class="search-highlight">$1</mark>')
}

// Create highlighted posts
const highlightedPosts = computed(() => {
  if (!debouncedQuery.value) return postsStore.posts

  return postsStore.posts.map(post => ({
    ...post,
    title: highlightText(post.title, debouncedQuery.value),
    excerpt: post.excerpt ? highlightText(post.excerpt, debouncedQuery.value) : ''
  }))
})

// Initialize from URL query
const initializeFromQuery = () => {
  const query = route.query.q as string
  if (query) {
    searchQuery.value = query
    hasSearched.value = true
  }

  if (route.query.categoryId) {
    selectedCategoryId.value = Number(route.query.categoryId)
  }

  if (route.query.tagId) {
    selectedTagId.value = Number(route.query.tagId)
  }
}

// Perform search
const performSearch = async (page = 1) => {
  if (!debouncedQuery.value.trim()) {
    hasSearched.value = false
    return
  }

  hasSearched.value = true
  saveSearchHistory(debouncedQuery.value)

  try {
    await postsStore.searchPosts(debouncedQuery.value, page, 12)
  } catch (error) {
    console.error('Search failed:', error)
  }
}

// Handle search button click or enter key
const handleSearch = () => {
  if (!searchQuery.value.trim()) return

  // Update URL
  router.push({
    query: {
      q: searchQuery.value,
      ...(selectedCategoryId.value && { categoryId: selectedCategoryId.value }),
      ...(selectedTagId.value && { tagId: selectedTagId.value })
    }
  })
}

// Clear search
const clearSearch = () => {
  searchQuery.value = ''
  hasSearched.value = false
  selectedCategoryId.value = null
  selectedTagId.value = null
  router.push({ query: {} })
}

// Handle filter change
const handleFilterChange = () => {
  if (!debouncedQuery.value.trim()) return

  // Update URL
  router.push({
    query: {
      q: debouncedQuery.value,
      ...(selectedCategoryId.value && { categoryId: selectedCategoryId.value }),
      ...(selectedTagId.value && { tagId: selectedTagId.value })
    }
  })

  // Perform search with filters
  performSearch(1)
}

// Handle page change
const handlePageChange = (page: number) => {
  performSearch(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
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

// Watch debounced query for automatic search
watch(debouncedQuery, (newValue) => {
  if (newValue.trim() && hasSearched.value) {
    performSearch(1)
  }
})

// Watch route query changes
watch(
  () => route.query,
  () => {
    initializeFromQuery()
  }
)

onMounted(async () => {
  loadSearchHistory()
  initializeFromQuery()
  
  await Promise.all([
    fetchCategories(),
    fetchTags()
  ])

  // Perform initial search if query exists
  if (debouncedQuery.value.trim()) {
    performSearch()
  }
})
</script>

<style scoped>
.search-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
}

.search-page__header {
  text-align: center;
  margin-bottom: 32px;
}

.search-page__title {
  margin: 0 0 12px 0;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary, #1A1A1A);
  letter-spacing: -0.02em;
}

.search-page__description {
  margin: 0;
  font-size: 18px;
  line-height: 1.6;
  color: var(--text-secondary, #667085);
}

/* Search Box */
.search-page__search-box {
  max-width: 720px;
  margin: 0 auto 32px;
}

.search-page__input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-page__search-icon {
  position: absolute;
  left: 16px;
  color: var(--text-secondary, #667085);
  pointer-events: none;
}

.search-page__input {
  width: 100%;
  padding: 14px 48px 14px 48px;
  background-color: var(--bg-primary, #FFFFFF);
  border: 2px solid var(--color-gray-300, #D0D5DD);
  border-radius: 12px;
  font-size: 16px;
  color: var(--text-primary, #1A1A1A);
  transition: all 0.2s ease;
}

.search-page__input:focus {
  outline: none;
  border-color: var(--color-primary-600, #7F56D9);
  box-shadow: 0 0 0 4px rgba(127, 86, 217, 0.1);
}

.search-page__input::placeholder {
  color: var(--text-secondary, #667085);
}

.search-page__clear-button {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-secondary, #667085);
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-page__clear-button:hover {
  background-color: var(--color-gray-50, #F9FAFB);
  color: var(--text-primary, #1A1A1A);
}

/* Search History */
.search-page__history {
  margin-top: 16px;
  padding: 16px;
  background-color: var(--bg-primary, #FFFFFF);
  border: 1px solid var(--color-gray-300, #D0D5DD);
  border-radius: 12px;
}

.search-page__history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.search-page__history-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #1A1A1A);
}

.search-page__history-clear {
  padding: 4px 8px;
  background-color: transparent;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary-600, #7F56D9);
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-page__history-clear:hover {
  background-color: var(--color-primary-50, #F9F5FF);
}

.search-page__history-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.search-page__history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: transparent;
  border: none;
  border-radius: 8px;
  text-align: left;
  font-size: 14px;
  color: var(--text-secondary, #667085);
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-page__history-item:hover {
  background-color: var(--color-gray-50, #F9FAFB);
  color: var(--text-primary, #1A1A1A);
}

.search-page__history-item svg {
  flex-shrink: 0;
}

/* Filters */
.search-page__filters {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.search-page__filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-page__filter-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #1A1A1A);
}

.search-page__filter-select {
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

.search-page__filter-select:focus {
  outline: none;
  border-color: var(--color-primary-600, #7F56D9);
}

/* Results */
.search-page__results {
  margin-top: 32px;
}

.search-page__results-header {
  margin-bottom: 24px;
}

.search-page__results-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #1A1A1A);
}

.search-page__results-query {
  font-weight: 400;
  color: var(--text-secondary, #667085);
}

.search-page__highlight {
  color: var(--color-primary-600, #7F56D9);
  font-weight: 600;
}

.search-page__loading {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.search-page__skeleton {
  width: 100%;
}

.search-page__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* Keyword highlighting in results */
:deep(.search-highlight) {
  background-color: rgba(127, 86, 217, 0.2);
  color: var(--color-primary-700, #6941C6);
  font-weight: 600;
  padding: 2px 4px;
  border-radius: 4px;
}

/* Initial State */
.search-page__initial {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
}

.search-page__initial-icon {
  margin-bottom: 24px;
  color: var(--color-gray-300, #D0D5DD);
}

.search-page__initial-title {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary, #1A1A1A);
}

.search-page__initial-description {
  margin: 0;
  font-size: 16px;
  color: var(--text-secondary, #667085);
}

/* Dark theme */
[data-theme="dark"] .search-page__title {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .search-page__description {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme="dark"] .search-page__input {
  background-color: var(--bg-secondary, #121212);
  border-color: rgba(255, 255, 255, 0.34);
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .search-page__input:focus {
  border-color: #7F56D9;
  box-shadow: 0 0 0 4px rgba(127, 86, 217, 0.2);
}

[data-theme="dark"] .search-page__history {
  background-color: var(--bg-secondary, #121212);
  border-color: rgba(255, 255, 255, 0.34);
}

[data-theme="dark"] .search-page__history-title {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .search-page__history-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .search-page__filter-label {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .search-page__filter-select {
  background-color: var(--bg-secondary, #121212);
  border-color: rgba(255, 255, 255, 0.34);
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .search-page__results-title {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .search-page__initial-title {
  color: var(--text-primary, #FFFFFF);
}

/* Responsive - Tablet */
@media (max-width: 1199px) {
  .search-page__grid,
  .search-page__loading {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Responsive - Mobile */
@media (max-width: 834px) {
  .search-page {
    padding: 32px 16px;
  }

  .search-page__title {
    font-size: 32px;
  }

  .search-page__description {
    font-size: 16px;
  }

  .search-page__input {
    padding: 12px 40px 12px 40px;
    font-size: 14px;
  }

  .search-page__filters {
    flex-direction: column;
    gap: 12px;
  }

  .search-page__filter-group {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .search-page__filter-select {
    width: 100%;
  }

  .search-page__grid,
  .search-page__loading {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .search-page__initial {
    padding: 60px 16px;
  }

  .search-page__initial-title {
    font-size: 20px;
  }

  .search-page__initial-description {
    font-size: 14px;
  }
}
</style>
