<template>
  <div class="tags-page">
    <!-- Page Header -->
    <div class="tags-page__header">
      <h1 class="tags-page__title">标签</h1>
      <p class="tags-page__description">
        按标签探索文章
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="tags-page__loading">
      <Skeleton variant="rounded" height="400px" />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="!loading && tags.length === 0"
      title="未找到标签"
      description="目前没有可用的标签。"
    >
      <template #icon>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 8L8 32L32 56L56 32L32 8Z" stroke="currentColor" stroke-width="2"/>
          <path d="M32 24V32M32 40H32.02" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </template>
    </EmptyState>

    <!-- Tags Cloud -->
    <div v-else class="tags-page__content">
      <div class="tags-page__cloud-wrapper">
        <TagCloud
          :tags="tags"
          :max-tags="100"
          @tag-click="handleTagClick"
        />
      </div>

      <!-- Tags Stats -->
      <div class="tags-page__stats">
        <div class="tags-page__stat-item">
          <span class="tags-page__stat-label">标签总数</span>
          <span class="tags-page__stat-value">{{ tags.length }}</span>
        </div>
        <div class="tags-page__stat-item">
          <span class="tags-page__stat-label">文章总数</span>
          <span class="tags-page__stat-value">{{ totalPosts }}</span>
        </div>
        <div class="tags-page__stat-item">
          <span class="tags-page__stat-label">最热门</span>
          <span class="tags-page__stat-value">{{ mostPopularTag?.name || '暂无' }}</span>
        </div>
      </div>

      <!-- Popular Tags List -->
      <div class="tags-page__popular">
        <h2 class="tags-page__popular-title">热门标签</h2>
        <div class="tags-page__popular-list">
          <RouterLink
            v-for="tag in popularTags"
            :key="tag.id"
            :to="`/tags/${tag.id}`"
            class="tag-item"
            :style="getTagItemStyle(tag)"
          >
            <div class="tag-item__header">
              <span class="tag-item__name">{{ tag.name }}</span>
              <span class="tag-item__count">{{ tag.postCount }}</span>
            </div>
            <div class="tag-item__bar">
              <div
                class="tag-item__bar-fill"
                :style="{ width: getTagPercentage(tag) + '%' }"
              ></div>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { errorHandler, ErrorLevel } from '@/utils/errorHandler'
import { useRouter, RouterLink } from 'vue-router'
import { tagsApi } from '@/services/api/tags'
import TagCloud from '@/components/blog/TagCloud.vue'
import Skeleton from '@/components/common/Skeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Tag } from '@/types/models'

const router = useRouter()

const tags = ref<Tag[]>([])
const loading = ref(false)

// Computed properties
const totalPosts = computed(() =>
  tags.value.reduce((sum, tag) => sum + (tag.postCount || 0), 0)
)

const mostPopularTag = computed(() =>
  tags.value.length > 0
    ? tags.value.reduce((prev, current) =>
        prev.postCount > current.postCount ? prev : current
      )
    : null
)

const popularTags = computed(() =>
  [...tags.value]
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 10)
)

const maxPostCount = computed(() =>
  popularTags.value.length > 0
    ? Math.max(...popularTags.value.map(tag => tag.postCount))
    : 1
)

// Get tag item style with dynamic color
const getTagItemStyle = (tag: Tag) => {
  const color = tag.color || '#7F56D9'
  
  return {
    '--tag-color': color
  }
}

// Get tag percentage for bar chart
const getTagPercentage = (tag: Tag): number => {
  return (tag.postCount / maxPostCount.value) * 100
}

// Handle tag click
const handleTagClick = (tag: Tag) => {
  router.push(`/tags/${tag.id}`)
}

// Fetch tags
const fetchTags = async () => {
  loading.value = true
  try {
    const response = await tagsApi.getTags()
    tags.value = response.data
  } catch (error) {
    errorHandler.log('Failed to fetch tags', ErrorLevel.ERROR, { error: String(error) })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTags()
})
</script>

<style scoped>
.tags-page {
  max-width: 1440px;
  margin: 0 auto;
  padding: 56px 24px 48px; /* 减少上边距，因为 main-content 已有 padding-top */
}

.tags-page__header {
  text-align: center;
  margin-bottom: 48px;
}

.tags-page__title {
  margin: 0 0 12px 0;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary, #1A1A1A);
  letter-spacing: -0.02em;
}

.tags-page__description {
  margin: 0;
  font-size: 18px;
  line-height: 1.6;
  color: var(--text-secondary, #667085);
}

.tags-page__loading {
  max-width: 800px;
  margin: 0 auto;
}

.tags-page__content {
  max-width: 1200px;
  margin: 0 auto;
}

.tags-page__cloud-wrapper {
  background-color: var(--bg-primary, #FFFFFF);
  border: 1px solid var(--color-gray-300, #D0D5DD);
  border-radius: 16px;
  padding: 48px;
  margin-bottom: 48px;
}

/* Stats Section */
.tags-page__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 48px;
}

.tags-page__stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  background-color: var(--bg-primary, #FFFFFF);
  border: 1px solid var(--color-gray-300, #D0D5DD);
  border-radius: 12px;
  text-align: center;
}

.tags-page__stat-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary, #667085);
  margin-bottom: 8px;
}

.tags-page__stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-primary-600, #7F56D9);
  line-height: 1.2;
}

/* Popular Tags Section */
.tags-page__popular {
  background-color: var(--bg-primary, #FFFFFF);
  border: 1px solid var(--color-gray-300, #D0D5DD);
  border-radius: 16px;
  padding: 32px;
}

.tags-page__popular-title {
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary, #1A1A1A);
}

.tags-page__popular-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Tag Item */
.tag-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background-color: var(--bg-secondary, #F9FAFB);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.tag-item:hover {
  background-color: var(--color-gray-50, #F9FAFB);
  transform: translateX(4px);
}

.tag-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tag-item__name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #1A1A1A);
}

.tag-item__count {
  font-size: 14px;
  font-weight: 600;
  color: var(--tag-color);
  padding: 4px 12px;
  background-color: rgba(127, 86, 217, 0.1);
  border-radius: 12px;
}

.tag-item__bar {
  height: 6px;
  background-color: var(--color-gray-300, #D0D5DD);
  border-radius: 3px;
  overflow: hidden;
}

.tag-item__bar-fill {
  height: 100%;
  background-color: var(--tag-color);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Dark theme */
[data-theme="dark"] .tags-page__title {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .tags-page__description {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme="dark"] .tags-page__cloud-wrapper,
[data-theme="dark"] .tags-page__stat-item,
[data-theme="dark"] .tags-page__popular {
  background-color: var(--bg-secondary, #121212);
  border-color: rgba(255, 255, 255, 0.34);
}

[data-theme="dark"] .tags-page__stat-label {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme="dark"] .tags-page__popular-title {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .tag-item {
  background-color: rgba(255, 255, 255, 0.05);
}

[data-theme="dark"] .tag-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .tag-item__name {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .tag-item__bar {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Responsive - Tablet */
@media (max-width: 1439px) {
  .tags-page__stats {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Responsive - Mobile */
@media (max-width: 834px) {
  .tags-page {
    padding: 32px 16px 32px; /* 移动端减少上边距 */
  }

  .tags-page__header {
    margin-bottom: 32px;
  }

  .tags-page__title {
    font-size: 32px;
  }

  .tags-page__description {
    font-size: 16px;
  }

  .tags-page__cloud-wrapper {
    padding: 24px;
    margin-bottom: 32px;
  }

  .tags-page__stats {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 32px;
  }

  .tags-page__stat-item {
    padding: 24px;
  }

  .tags-page__stat-value {
    font-size: 24px;
  }

  .tags-page__popular {
    padding: 24px;
  }

  .tags-page__popular-title {
    font-size: 20px;
  }

  .tag-item {
    padding: 12px;
  }

  .tag-item__name {
    font-size: 14px;
  }

  .tag-item__count {
    font-size: 12px;
    padding: 3px 10px;
  }
}
</style>
