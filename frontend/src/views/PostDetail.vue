<template>
  <div class="post-detail">
    <!-- Loading State -->
    <div v-if="postsStore.loading" class="post-detail__loading">
      <div class="post-detail__container">
        <Skeleton variant="text" width="200px" height="20px" />
        <Skeleton variant="text" width="80%" height="48px" class="post-detail__title-skeleton" />
        <Skeleton variant="rounded" width="100%" height="400px" class="post-detail__image-skeleton" />
        <div class="post-detail__layout">
          <div class="post-detail__content-skeleton">
            <Skeleton v-for="i in 10" :key="i" variant="text" width="100%" height="20px" />
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <EmptyState
      v-else-if="error"
      title="Post not found"
      description="The post you're looking for doesn't exist or has been removed."
      action-text="Back to Posts"
      @action="router.push('/posts')"
    >
      <template #icon>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2"/>
          <path d="M32 20V32M32 44H32.02" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </template>
    </EmptyState>

    <!-- Post Content -->
    <article v-else-if="post" class="post-detail__article">
      <div class="post-detail__container">
        <!-- Article Header -->
        <header class="post-detail__header">
          <!-- Published Date -->
          <time :datetime="post.publishedAt" class="post-detail__date">
            {{ formattedDate }}
          </time>

          <!-- Title -->
          <h1 class="post-detail__title">{{ post.title }}</h1>

          <!-- Category Badge -->
          <div v-if="post.category" class="post-detail__category">
            <CategoryBadge :category="post.category" />
          </div>

          <!-- Cover Image -->
          <div v-if="post.coverImage" class="post-detail__cover">
            <img
              :src="coverImageUrl"
              :alt="post.title"
              @error="handleImageError"
            />
          </div>

          <!-- Meta Info -->
          <div class="post-detail__meta">
            <!-- Author -->
            <div class="post-detail__author">
              <img
                v-if="post.author.avatar"
                :src="avatarUrl"
                :alt="post.author.username"
                class="post-detail__avatar"
                @error="handleAvatarError"
              />
              <div class="post-detail__author-info">
                <span class="post-detail__author-name">{{ post.author.username }}</span>
                <span class="post-detail__author-role">{{ post.author.role }}</span>
              </div>
            </div>

            <!-- Stats -->
            <div class="post-detail__stats">
              <span class="post-detail__stat">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3C5.58172 3 2 6.58172 2 11C2 15.4183 5.58172 19 10 19C14.4183 19 18 15.4183 18 11C18 6.58172 14.4183 3 10 3Z" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M10 7V11L13 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                {{ readingTime }} 分钟阅读
              </span>
              <span class="post-detail__stat">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3C5.58172 3 2 6.58172 2 11C2 15.4183 5.58172 19 10 19C14.4183 19 18 15.4183 18 11C18 6.58172 14.4183 3 10 3Z" stroke="currentColor" stroke-width="1.5"/>
                  <circle cx="10" cy="10" r="2" fill="currentColor"/>
                </svg>
                {{ post.viewCount }} 次浏览
              </span>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="post.tags && post.tags.length > 0" class="post-detail__tags">
            <Badge
              v-for="tag in post.tags"
              :key="tag.id"
              :text="tag.name"
              variant="secondary"
              size="md"
            />
          </div>
        </header>

        <!-- Main Layout with Sidebar -->
        <div class="post-detail__layout">
          <!-- Article Content -->
          <div class="post-detail__content">
            <div
              class="post-detail__body"
              v-html="renderedContent"
            ></div>
          </div>

          <!-- Sidebar -->
          <Sidebar
            :visible="true"
            :show-search="false"
            :show-popular-posts="true"
            :show-tag-cloud="true"
            :popular-posts="recentPosts"
            :tags="allTags"
          />
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { errorHandler, ErrorLevel } from '@/utils/errorHandler'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { usePostsStore } from '@/stores/posts'
import { tagsApi } from '@/services/api/tags'
import { useMeta } from '@/composables/useMeta'
import { getImageUrl } from '@/utils/image'
import Badge from '@/components/common/Badge.vue'
import CategoryBadge from '@/components/blog/CategoryBadge.vue'
import Skeleton from '@/components/common/Skeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import type { Post, Tag } from '@/types/models'

const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()

const post = computed(() => postsStore.currentPost)
const error = ref<string | null>(null)
const recentPosts = ref<Post[]>([])
const allTags = ref<Tag[]>([])

// 图片重试计数器
const imageRetryCount = ref(0)
const avatarRetryCount = ref(0)
const MAX_RETRY = 5
const imageRetrying = ref(false)
const avatarRetrying = ref(false)

// Computed image URLs
const coverImageUrl = computed(() => 
  post.value?.coverImage ? getImageUrl(post.value.coverImage, '/images/placeholder.svg') : ''
)

const avatarUrl = computed(() => 
  post.value?.author.avatar ? getImageUrl(post.value.author.avatar, '/images/avatar-default.svg') : ''
)

// Initialize SEO meta tags
const { updateMeta, setArticleStructuredData } = useMeta()

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true
})

// Render markdown/HTML content
const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  
  try {
    // Check if content is HTML or Markdown
    if (post.value.content.trim().startsWith('<')) {
      // Content is HTML
      return post.value.content
    } else {
      // Content is Markdown
      return marked.parse(post.value.content)
    }
  } catch (err) {
    errorHandler.log('Failed to render content', ErrorLevel.ERROR, { error: String(err) })
    return '<p>Failed to render content</p>'
  }
})

// Format published date
const formattedDate = computed(() => {
  if (!post.value) return ''
  const date = new Date(post.value.publishedAt)
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '未知日期'
  }
  
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  return `${year}年${month}月${day}日`
})

// Calculate reading time (assuming 200 words per minute)
const readingTime = computed(() => {
  if (!post.value?.content) return 0
  const words = post.value.content.split(/\s+/).length
  return Math.ceil(words / 200)
})

// Fetch post details
const fetchPost = async () => {
  const postId = Number(route.params.id)
  
  if (isNaN(postId)) {
    error.value = 'Invalid post ID'
    return
  }

  try {
    await postsStore.fetchPost(postId)
    
    if (!postsStore.currentPost) {
      error.value = 'Post not found'
    }
  } catch (err) {
    console.error('Failed to fetch post:', err)
    error.value = 'Failed to load post'
  }
}

// Fetch recent posts for sidebar
const fetchRecentPosts = async () => {
  try {
    await postsStore.fetchPosts({
      page: 1,
      pageSize: 5
    })
    recentPosts.value = postsStore.posts.slice(0, 5)
  } catch (err) {
    console.error('Failed to fetch recent posts:', err)
  }
}

// Fetch all tags for sidebar
const fetchTags = async () => {
  try {
    const response = await tagsApi.getTags()
    allTags.value = response.data
  } catch (err) {
    console.error('Failed to fetch tags:', err)
  }
}



// Handle image error
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  
  // 如果正在重试中或已经是默认图片，不再处理
  if (imageRetrying.value || img.src.includes('placeholder.svg')) {
    return
  }
  
  imageRetryCount.value++
  
  if (imageRetryCount.value < MAX_RETRY) {
    // 重试加载原图
    imageRetrying.value = true
    const originalSrc = img.src
    setTimeout(() => {
      img.src = originalSrc + '?retry=' + imageRetryCount.value
      imageRetrying.value = false
    }, 1000 * imageRetryCount.value) // 递增延迟
  } else {
    // 超过重试次数，显示默认图片
    img.src = '/images/placeholder.svg'
  }
}

// Handle avatar error
const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  
  // 如果正在重试中或已经是默认头像，不再处理
  if (avatarRetrying.value || img.src.includes('avatar-default.svg')) {
    return
  }
  
  avatarRetryCount.value++
  
  if (avatarRetryCount.value < MAX_RETRY) {
    // 重试加载原头像
    avatarRetrying.value = true
    const originalSrc = img.src
    setTimeout(() => {
      img.src = originalSrc + '?retry=' + avatarRetryCount.value
      avatarRetrying.value = false
    }, 1000 * avatarRetryCount.value) // 递增延迟
  } else {
    // 超过重试次数，显示默认头像
    img.src = '/images/avatar-default.svg'
  }
}

// Update SEO meta tags when post changes
watch(post, (newPost) => {
  if (newPost) {
    // Update meta tags
    updateMeta({
      title: newPost.title,
      description: newPost.excerpt,
      keywords: newPost.tags.map(tag => tag.name),
      ogTitle: newPost.title,
      ogDescription: newPost.excerpt,
      ogImage: newPost.coverImage,
      ogType: 'article',
      ogUrl: window.location.href,
      twitterCard: 'summary_large_image',
      author: newPost.author.username,
      publishedTime: newPost.publishedAt,
      modifiedTime: newPost.updatedAt,
      canonical: window.location.href
    })

    // Set structured data for article
    setArticleStructuredData({
      title: newPost.title,
      description: newPost.excerpt,
      image: newPost.coverImage,
      author: newPost.author.username,
      publishedTime: newPost.publishedAt,
      modifiedTime: newPost.updatedAt,
      url: window.location.href
    })
  }
}, { immediate: true })

// Watch for route parameter changes
watch(() => route.params.id, async (newId) => {
  if (newId) {
    error.value = null
    await fetchPost()
  }
})

onMounted(async () => {
  await Promise.all([
    fetchPost(),
    fetchRecentPosts(),
    fetchTags()
  ])
})
</script>

<style scoped>
.post-detail {
  min-height: 100vh;
  background-color: var(--bg-secondary, #F9FAFB);
}

.post-detail__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 56px 24px 48px; /* 减少上边距，因为 main-content 已有 padding-top */
}

.post-detail__loading {
  padding: 48px 24px;
}

.post-detail__title-skeleton {
  margin: 16px 0;
}

.post-detail__image-skeleton {
  margin: 24px 0;
}

.post-detail__content-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 32px;
}

/* Article Header */
.post-detail__header {
  max-width: 800px;
  margin: 0 auto 48px;
  text-align: center;
}

.post-detail__date {
  display: block;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary, #667085);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.post-detail__title {
  margin: 0 0 24px 0;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary, #1A1A1A);
  letter-spacing: -0.02em;
}

.post-detail__category {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.post-detail__cover {
  width: 100%;
  max-height: 500px;
  margin-bottom: 32px;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--bg-primary, #FFFFFF);
}

.post-detail__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-detail__meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
  padding: 24px 0;
  border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
}

.post-detail__author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.post-detail__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.post-detail__author-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.post-detail__author-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #1A1A1A);
}

.post-detail__author-role {
  font-size: 14px;
  color: var(--text-secondary, #667085);
  text-transform: capitalize;
}

.post-detail__stats {
  display: flex;
  gap: 16px;
}

.post-detail__stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary, #667085);
}

.post-detail__stat svg {
  width: 20px;
  height: 20px;
}

.post-detail__tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

/* Main Layout */
.post-detail__layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 48px;
  align-items: start;
}

.post-detail__content {
  min-width: 0;
}

/* Article Body */
.post-detail__body {
  background-color: var(--bg-primary, #FFFFFF);
  padding: 48px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.post-detail__body :deep(h1),
.post-detail__body :deep(h2),
.post-detail__body :deep(h3),
.post-detail__body :deep(h4),
.post-detail__body :deep(h5),
.post-detail__body :deep(h6) {
  margin: 32px 0 16px 0;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text-primary, #1A1A1A);
}

.post-detail__body :deep(h1) { font-size: 36px; }
.post-detail__body :deep(h2) { font-size: 30px; }
.post-detail__body :deep(h3) { font-size: 24px; }
.post-detail__body :deep(h4) { font-size: 20px; }
.post-detail__body :deep(h5) { font-size: 18px; }
.post-detail__body :deep(h6) { font-size: 16px; }

.post-detail__body :deep(p) {
  margin: 0 0 20px 0;
  font-size: 18px;
  line-height: 1.8;
  color: var(--text-primary, #1A1A1A);
}

.post-detail__body :deep(a) {
  color: var(--color-primary-600, #7F56D9);
  text-decoration: underline;
  transition: color 0.2s ease;
}

.post-detail__body :deep(a:hover) {
  color: var(--color-primary-700, #6941C6);
}

.post-detail__body :deep(ul),
.post-detail__body :deep(ol) {
  margin: 0 0 20px 0;
  padding-left: 28px;
}

.post-detail__body :deep(li) {
  margin-bottom: 8px;
  font-size: 18px;
  line-height: 1.8;
  color: var(--text-primary, #1A1A1A);
}

.post-detail__body :deep(blockquote) {
  margin: 24px 0;
  padding: 16px 24px;
  border-left: 4px solid var(--color-primary-600, #7F56D9);
  background-color: var(--color-primary-50, #F9F5FF);
  font-style: italic;
}

.post-detail__body :deep(code) {
  padding: 2px 6px;
  background-color: var(--color-gray-50, #F9FAFB);
  border: 1px solid var(--color-gray-300, #D0D5DD);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.post-detail__body :deep(pre) {
  margin: 24px 0;
  padding: 20px;
  background-color: var(--color-gray-900, #1A1A1A);
  border-radius: 8px;
  overflow-x: auto;
}

.post-detail__body :deep(pre code) {
  padding: 0;
  background: none;
  border: none;
  color: #FFFFFF;
  font-size: 14px;
  line-height: 1.6;
}

.post-detail__body :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 24px 0;
  border-radius: 8px;
}

.post-detail__body :deep(table) {
  width: 100%;
  margin: 24px 0;
  border-collapse: collapse;
}

.post-detail__body :deep(th),
.post-detail__body :deep(td) {
  padding: 12px;
  border: 1px solid var(--color-gray-300, #D0D5DD);
  text-align: left;
}

.post-detail__body :deep(th) {
  background-color: var(--color-gray-50, #F9FAFB);
  font-weight: 600;
}

.post-detail__body :deep(hr) {
  margin: 32px 0;
  border: none;
  border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
}

/* Dark theme */
[data-theme="dark"] .post-detail {
  background-color: var(--bg-primary, #090D1F);
}

[data-theme="dark"] .post-detail__title {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .post-detail__date {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme="dark"] .post-detail__meta {
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .post-detail__author-name {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .post-detail__author-role,
[data-theme="dark"] .post-detail__stat {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme="dark"] .post-detail__body {
  background-color: var(--bg-secondary, #121212);
  box-shadow: 0 1px 3px rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .post-detail__body :deep(h1),
[data-theme="dark"] .post-detail__body :deep(h2),
[data-theme="dark"] .post-detail__body :deep(h3),
[data-theme="dark"] .post-detail__body :deep(h4),
[data-theme="dark"] .post-detail__body :deep(h5),
[data-theme="dark"] .post-detail__body :deep(h6),
[data-theme="dark"] .post-detail__body :deep(p),
[data-theme="dark"] .post-detail__body :deep(li) {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .post-detail__body :deep(code) {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .post-detail__body :deep(blockquote) {
  background-color: rgba(127, 86, 217, 0.1);
}

[data-theme="dark"] .post-detail__body :deep(th) {
  background-color: rgba(255, 255, 255, 0.05);
}

[data-theme="dark"] .post-detail__body :deep(th),
[data-theme="dark"] .post-detail__body :deep(td) {
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .post-detail__body :deep(hr) {
  border-color: rgba(255, 255, 255, 0.1);
}

/* Responsive - Tablet */
@media (max-width: 1439px) {
  .post-detail__layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

/* Responsive - Mobile */
@media (max-width: 834px) {
  .post-detail__container {
    padding: 32px 16px 32px; /* 移动端减少上边距 */
  }

  .post-detail__header {
    margin-bottom: 32px;
  }

  .post-detail__title {
    font-size: 32px;
  }

  .post-detail__meta {
    flex-direction: column;
    gap: 16px;
  }

  .post-detail__stats {
    flex-direction: column;
    gap: 8px;
  }

  .post-detail__body {
    padding: 24px 20px;
  }

  .post-detail__body :deep(h1) { font-size: 28px; }
  .post-detail__body :deep(h2) { font-size: 24px; }
  .post-detail__body :deep(h3) { font-size: 20px; }
  .post-detail__body :deep(h4) { font-size: 18px; }
  .post-detail__body :deep(h5) { font-size: 16px; }
  .post-detail__body :deep(h6) { font-size: 14px; }

  .post-detail__body :deep(p),
  .post-detail__body :deep(li) {
    font-size: 16px;
  }
}
</style>
