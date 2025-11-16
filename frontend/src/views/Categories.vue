<template>
  <div class="categories-page">
    <!-- Page Header -->
    <div class="categories-page__header">
      <h1 class="categories-page__title">分类</h1>
      <p class="categories-page__description">
        按分类浏览文章
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="categories-page__loading">
      <Skeleton
        v-for="i in 6"
        :key="i"
        variant="rounded"
        height="200px"
        class="categories-page__skeleton"
      />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="!loading && categories.length === 0"
      title="未找到分类"
      description="目前没有可用的分类。"
    >
      <template #icon>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 16C8 11.5817 11.5817 8 16 8H48C52.4183 8 56 11.5817 56 16V48C56 52.4183 52.4183 56 48 56H16C11.5817 56 8 52.4183 8 48V16Z" stroke="currentColor" stroke-width="2"/>
          <path d="M16 24H48M16 32H48M16 40H32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </template>
    </EmptyState>

    <!-- Categories Grid -->
    <div v-else class="categories-page__grid">
      <RouterLink
        v-for="category in categories"
        :key="category.id"
        :to="`/categories/${category.id}`"
        class="category-card"
      >
        <div class="category-card__header" :style="getCategoryHeaderStyle(category)">
          <div class="category-card__icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 8C4 5.79086 5.79086 4 8 4H24C26.2091 4 28 5.79086 28 8V24C28 26.2091 26.2091 28 24 28H8C5.79086 28 4 26.2091 4 24V8Z" stroke="currentColor" stroke-width="2"/>
              <path d="M4 12H28M10 8V4M22 8V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
        
        <div class="category-card__body">
          <h3 class="category-card__name">{{ category.name }}</h3>
          <p v-if="category.description" class="category-card__description">
            {{ category.description }}
          </p>
          <div v-if="category.postCount > 0" class="category-card__meta">
            <span class="category-card__count">
              {{ category.postCount }} 篇文章
            </span>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { categoriesApi } from '@/services/api/categories'
import Skeleton from '@/components/common/Skeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Category } from '@/types/models'

const categories = ref<Category[]>([])
const loading = ref(false)

// Get category header style with dynamic color
const getCategoryHeaderStyle = (category: Category) => {
  const color = category.color || '#7F56D9'
  
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

// Fetch categories
const fetchCategories = async () => {
  loading.value = true
  try {
    const response = await categoriesApi.getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.categories-page {
  max-width: 1440px;
  margin: 0 auto;
  padding: 56px 24px 48px; /* 减少上边距，因为 main-content 已有 padding-top */
}

.categories-page__header {
  text-align: center;
  margin-bottom: 48px;
}

.categories-page__title {
  margin: 0 0 12px 0;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary, #1A1A1A);
  letter-spacing: -0.02em;
}

.categories-page__description {
  margin: 0;
  font-size: 18px;
  line-height: 1.6;
  color: var(--text-secondary, #667085);
}

.categories-page__loading {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.categories-page__skeleton {
  width: 100%;
}

.categories-page__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* Category Card */
.category-card {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary, #FFFFFF);
  border: 1px solid var(--color-gray-300, #D0D5DD);
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary-600, #7F56D9);
}

.category-card__header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  padding: 24px;
}

.category-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

.category-card__icon svg {
  width: 32px;
  height: 32px;
}

.category-card__body {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.category-card__name {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-primary, #1A1A1A);
}

.category-card__description {
  margin: 0 0 16px 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary, #667085);
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
}

.category-card__count {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-primary-600, #7F56D9);
}

/* Dark theme */
[data-theme="dark"] .categories-page__title {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .categories-page__description {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme="dark"] .category-card {
  background-color: var(--bg-secondary, #121212);
  border-color: rgba(255, 255, 255, 0.34);
}

[data-theme="dark"] .category-card:hover {
  box-shadow: 0 12px 24px rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .category-card__name {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .category-card__description {
  color: var(--text-secondary, #C0C5D0);
}

/* Responsive - Tablet */
@media (max-width: 1439px) {
  .categories-page__grid,
  .categories-page__loading {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Responsive - Mobile */
@media (max-width: 834px) {
  .categories-page {
    padding: 32px 16px 32px; /* 移动端减少上边距 */
  }

  .categories-page__header {
    margin-bottom: 32px;
  }

  .categories-page__title {
    font-size: 32px;
  }

  .categories-page__description {
    font-size: 16px;
  }

  .categories-page__grid,
  .categories-page__loading {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .category-card__header {
    height: 100px;
  }

  .category-card__icon {
    width: 48px;
    height: 48px;
  }

  .category-card__icon svg {
    width: 24px;
    height: 24px;
  }

  .category-card__body {
    padding: 20px;
  }

  .category-card__name {
    font-size: 18px;
  }
}
</style>
