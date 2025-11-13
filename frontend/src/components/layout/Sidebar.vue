<template>
  <aside class="sidebar" :class="{ 'sidebar--hidden': !visible }">
    <!-- 搜索框 -->
    <div v-if="showSearch" class="sidebar__section">
      <h3 class="sidebar__title">搜索</h3>
      <div class="sidebar__search">
        <input
          type="search"
          class="sidebar__search-input"
          placeholder="搜索文章..."
          v-model="searchQuery"
          @input="handleSearch"
          aria-label="Search posts"
        />
        <svg class="sidebar__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8" stroke-width="2" />
          <path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>
    </div>

    <!-- 热门文章 -->
    <div v-if="showPopularPosts && popularPosts.length > 0" class="sidebar__section">
      <h3 class="sidebar__title">热门文章</h3>
      <ul class="sidebar__list">
        <li v-for="post in popularPosts" :key="post.id" class="sidebar__list-item">
          <router-link :to="`/posts/${post.id}`" class="sidebar__post-link">
            <div v-if="post.coverImage" class="sidebar__post-image">
              <img :src="getPostImageUrl(post.coverImage)" :alt="post.title" loading="lazy" />
            </div>
            <div class="sidebar__post-content">
              <h4 class="sidebar__post-title">{{ post.title }}</h4>
              <p class="sidebar__post-meta">
                <span class="sidebar__post-date">{{ formatDate(post.publishedAt) }}</span>
                <span v-if="post.viewCount" class="sidebar__post-views">
                  {{ post.viewCount }} 次浏览
                </span>
              </p>
            </div>
          </router-link>
        </li>
      </ul>
    </div>

    <!-- 标签云 -->
    <div v-if="showTagCloud && tags.length > 0" class="sidebar__section">
      <h3 class="sidebar__title">标签</h3>
      <div class="sidebar__tags">
        <router-link
          v-for="tag in tags"
          :key="tag.id"
          :to="`/tags/${tag.id}`"
          class="sidebar__tag"
          :style="{ fontSize: getTagSize(tag.postCount) }"
        >
          {{ tag.name }}
        </router-link>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getImageUrl } from '@/utils/image'

interface Post {
  id: number
  title: string
  coverImage?: string
  publishedAt: string
  viewCount?: number
}

interface Tag {
  id: number
  name: string
  postCount: number
}

interface SidebarProps {
  visible?: boolean
  showSearch?: boolean
  showPopularPosts?: boolean
  showTagCloud?: boolean
  popularPosts?: Post[]
  tags?: Tag[]
}

const props = withDefaults(defineProps<SidebarProps>(), {
  visible: true,
  showSearch: true,
  showPopularPosts: true,
  showTagCloud: true,
  popularPosts: () => [],
  tags: () => []
})

const emit = defineEmits<{
  search: [query: string]
}>()

const searchQuery = ref('')

const handleSearch = () => {
  emit('search', searchQuery.value)
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '未知时间'
  }
  
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays} 天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 个月前`
  return `${Math.floor(diffDays / 365)} 年前`
}

const getTagSize = (postCount: number): string => {
  const maxCount = Math.max(...props.tags.map(t => t.postCount))
  const minSize = 0.875 // 14px
  const maxSize = 1.25 // 20px
  const size = minSize + (maxSize - minSize) * (postCount / maxCount)
  return `${size}rem`
}

const getPostImageUrl = (url?: string): string => {
  return getImageUrl(url, '/images/placeholder.svg')
}
</script>

<style scoped>
.sidebar {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sidebar--hidden {
  display: none;
}

.sidebar__section {
  background-color: var(--bg-primary, #FFFFFF);
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.sidebar__title {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary, #1A1A1A);
}

/* 搜索框 */
.sidebar__search {
  position: relative;
}

.sidebar__search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  color: var(--text-primary, #1A1A1A);
  background-color: var(--bg-primary, #FFFFFF);
}

.sidebar__search-input:focus {
  outline: none;
  border-color: var(--color-primary-600, #7F56D9);
}

.sidebar__search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-secondary, #667085);
}

/* 热门文章列表 */
.sidebar__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar__list-item {
  margin: 0;
}

.sidebar__post-link {
  display: flex;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.sidebar__post-link:hover {
  transform: translateY(-2px);
}

.sidebar__post-image {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  overflow: hidden;
}

.sidebar__post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sidebar__post-content {
  flex: 1;
  min-width: 0;
}

.sidebar__post-title {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-primary, #1A1A1A);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sidebar__post-meta {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-secondary, #667085);
  display: flex;
  gap: 0.5rem;
}

.sidebar__post-views::before {
  content: '•';
  margin-right: 0.5rem;
}

/* 标签云 */
.sidebar__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.sidebar__tag {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background-color: var(--bg-secondary, #F9FAFB);
  color: var(--text-secondary, #667085);
  text-decoration: none;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.sidebar__tag:hover {
  background-color: var(--color-primary-50, #F9F5FF);
  color: var(--color-primary-600, #7F56D9);
}

/* 响应式设计 */
@media (max-width: 834px) {
  .sidebar__section {
    padding: 1rem;
  }
  
  .sidebar__title {
    font-size: 1rem;
  }
}

@media (max-width: 390px) {
  .sidebar__section {
    padding: 0.75rem;
  }
  
  .sidebar__title {
    font-size: 0.9375rem;
  }
}
</style>
