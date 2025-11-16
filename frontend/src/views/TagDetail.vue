<template>
  <div class="tag-detail-page">
    <!-- Tag Header -->
    <div class="tag-detail-page__header">
      <div class="tag-detail-page__header-content">
        <div class="tag-detail-page__icon" :style="getTagIconStyle()">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 4L4 16L16 28L28 16L16 4Z" stroke="currentColor" stroke-width="2"/>
            <circle cx="16" cy="16" r="3" fill="currentColor"/>
          </svg>
        </div>
        <div class="tag-detail-page__info">
          <div class="tag-detail-page__breadcrumb">
            <RouterLink to="/tags" class="tag-detail-page__breadcrumb-link">
              标签
            </RouterLink>
            <span class="tag-detail-page__breadcrumb-separator">/</span>
            <span class="tag-detail-page__breadcrumb-current">
              {{ tagName }}
            </span>
          </div>
          <h1 class="tag-detail-page__title">
            <span class="tag-detail-page__hash">#</span>{{ tagName }}
          </h1>
          <div class="tag-detail-page__meta">
            <span class="tag-detail-page__count">
              {{ totalPosts }} 篇文章
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Posts Section -->
    <div class="tag-detail-page__content">
      <!-- Loading State -->
      <div v-if="loadingPosts" class="tag-detail-page__loading">
        <Skeleton
          v-for="i in 6"
          :key="i"
          variant="rounded"
          height="400px"
          class="tag-detail-page__skeleton"
        />
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else-if="!loadingPosts && posts.length === 0"
        title="该标签下暂无文章"
        description="该标签下还没有文章。稍后再来查看新内容。"
        action-text="浏览所有文章"
        @action="$router.push('/posts')"
      >
        <template #icon>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 8L8 32L32 56L56 32L32 8Z" stroke="currentColor" stroke-width="2"/>
            <path d="M32 24V32M32 40H32.02" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </template>
      </EmptyState>

      <!-- Posts Grid -->
      <div v-else class="tag-detail-page__grid">
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { tagsApi } from '@/services/api/tags'
import BlogPostCard from '@/components/blog/BlogPostCard.vue'
import Pagination from '@/components/common/Pagination.vue'
import Skeleton from '@/components/common/Skeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Tag, Post } from '@/types/models'

const route = useRoute()

const tag = ref<Tag | null>(null)
const posts = ref<Post[]>([])
const loadingPosts = ref(false)
const pagination = ref({
  page: 1,
  pageSize: 12,
  total: 0,
  totalPages: 0
})

// Computed properties
const tagName = computed(() => tag.value?.name || 'Tag')
const tagColor = computed(() => tag.value?.color || '#7F56D9')
const totalPosts = computed(() => pagination.value.total)

// Get tag icon style with dynamic color
const getTagIconStyle = () => {
  const color = tagColor.value
  
  // Convert hex to RGB for background
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
    backgroundColor: isDark
      ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
      : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
    color: color
  }
}

// Fetch tag info
const fetchTag = async (id: number) => {
  try {
    const response = await tagsApi.getTag(id)
    tag.value = response.data
  } catch (error) {
    console.error('Failed to fetch tag:', error)
  }
}

// Fetch tag posts
const fetchTagPosts = async (id: number, page = 1) => {
  loadingPosts.value = true
  try {
    const response = await tagsApi.getTagPosts(id, {
      page,
      pageSize: 12
    })
    posts.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    console.error('Failed to fetch tag posts:', error)
    posts.value = []
  } finally {
    loadingPosts.value = false
  }
}

// Handle page change
const handlePageChange = (page: number) => {
  const tagId = Number(route.params.id)
  fetchTagPosts(tagId, page)
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Watch route params changes
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      const tagId = Number(newId)
      fetchTag(tagId)
      fetchTagPosts(tagId)
    }
  }
)

onMounted(() => {
  const tagId = Number(route.params.id)
  if (tagId) {
    fetchTag(tagId)
    fetchTagPosts(tagId)
  }
})
</script>

<style scoped>
.tag-detail-page {
  max-width: 1440px;
  margin: 0 auto;
  padding: 48px 24px;
}

.tag-detail-page__header {
  margin-bottom: 48px;
}

.tag-detail-page__header-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.tag-detail-page__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tag-detail-page__info {
  flex: 1;
}

.tag-detail-page__breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
}

.tag-detail-page__breadcrumb-link {
  color: var(--text-secondary, #667085);
  text-decoration: none;
  transition: color 0.2s ease;
}

.tag-detail-page__breadcrumb-link:hover {
  color: var(--color-primary-600, #7F56D9);
}

.tag-detail-page__breadcrumb-separator {
  color: var(--text-secondary, #667085);
}

.tag-detail-page__breadcrumb-current {
  color: var(--text-primary, #1A1A1A);
  font-weight: 500;
}

.tag-detail-page__title {
  margin: 0 0 12px 0;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary, #1A1A1A);
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-detail-page__hash {
  color: var(--color-primary-600, #7F56D9);
  opacity: 0.6;
}

.tag-detail-page__meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tag-detail-page__count {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary-600, #7F56D9);
}

.tag-detail-page__content {
  margin-top: 48px;
}

.tag-detail-page__loading {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.tag-detail-page__skeleton {
  width: 100%;
}

.tag-detail-page__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 48px;
}

/* Dark theme */
[data-theme="dark"] .tag-detail-page__breadcrumb-link {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme="dark"] .tag-detail-page__breadcrumb-separator {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme="dark"] .tag-detail-page__breadcrumb-current {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .tag-detail-page__title {
  color: var(--text-primary, #FFFFFF);
}

/* Responsive - Tablet */
@media (max-width: 1439px) {
  .tag-detail-page__grid,
  .tag-detail-page__loading {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Responsive - Mobile */
@media (max-width: 834px) {
  .tag-detail-page {
    padding: 32px 16px;
  }

  .tag-detail-page__header {
    margin-bottom: 32px;
  }

  .tag-detail-page__header-content {
    flex-direction: column;
    text-align: center;
  }

  .tag-detail-page__icon {
    width: 64px;
    height: 64px;
  }

  .tag-detail-page__icon svg {
    width: 24px;
    height: 24px;
  }

  .tag-detail-page__breadcrumb {
    justify-content: center;
    font-size: 13px;
  }

  .tag-detail-page__title {
    font-size: 32px;
    justify-content: center;
  }

  .tag-detail-page__meta {
    justify-content: center;
  }

  .tag-detail-page__content {
    margin-top: 32px;
  }

  .tag-detail-page__grid,
  .tag-detail-page__loading {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
