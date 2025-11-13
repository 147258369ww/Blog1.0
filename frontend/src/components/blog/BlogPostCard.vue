<template>
  <article :class="cardClasses">
    <!-- Cover Image -->
    <div v-if="post.coverImage" class="post-card__image">
      <router-link :to="`/posts/${post.id}`">
        <img 
          :src="coverImageUrl" 
          :alt="post.title"
          @error="handleImageError"
        />
      </router-link>
    </div>

    <!-- Content -->
    <div class="post-card__content">
      <!-- Category Badge -->
      <div v-if="post.category" class="post-card__category">
        <CategoryBadge :category="post.category" />
      </div>

      <!-- Title -->
      <h3 class="post-card__title">
        <router-link :to="`/posts/${post.id}`">
          {{ post.title }}
        </router-link>
      </h3>

      <!-- Excerpt -->
      <p v-if="post.excerpt" class="post-card__excerpt">
        {{ post.excerpt }}
      </p>

      <!-- Meta Info -->
      <div class="post-card__meta">
        <!-- Author & Date -->
        <div class="post-card__author">
          <img 
            v-if="post.author.avatar" 
            :src="avatarUrl" 
            :alt="post.author.username"
            class="post-card__avatar"
            @error="handleAvatarError"
          />
          <div class="post-card__author-info">
            <span class="post-card__author-name">{{ post.author.username }}</span>
            <span class="post-card__date">{{ formattedDate }}</span>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="post.tags && post.tags.length > 0" class="post-card__tags">
          <Badge
            v-for="tag in displayTags"
            :key="tag.id"
            :text="tag.name"
            variant="secondary"
            size="sm"
          />
          <span v-if="post.tags.length > maxTags" class="post-card__tags-more">
            +{{ post.tags.length - maxTags }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Badge from '@/components/common/Badge.vue'
import CategoryBadge from './CategoryBadge.vue'
import { getImageUrl } from '@/utils/image'
import type { Post } from '@/types/models'

interface Props {
  post: Post
  layout?: 'featured' | 'grid' | 'list'
  maxTags?: number
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'grid',
  maxTags: 3
})

// 图片重试计数器
const imageRetryCount = ref(0)
const avatarRetryCount = ref(0)
const MAX_RETRY = 5
const imageRetrying = ref(false)
const avatarRetrying = ref(false)

const cardClasses = computed(() => [
  'post-card',
  `post-card--${props.layout}`
])

const displayTags = computed(() => 
  props.post.tags.slice(0, props.maxTags)
)

const coverImageUrl = computed(() => 
  getImageUrl(props.post.coverImage, '/images/placeholder.svg')
)

const avatarUrl = computed(() => 
  getImageUrl(props.post.author.avatar, '/images/avatar-default.svg')
)

const formattedDate = computed(() => {
  const date = new Date(props.post.publishedAt)
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '未知日期'
  }
  
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  return `${year}年${month}月${day}日`
})

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
</script>

<style scoped>
.post-card {
  display: flex;
  background: var(--bg-primary, #FFFFFF);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* Featured Layout - Large horizontal card */
.post-card--featured {
  flex-direction: row;
  gap: 32px;
  padding: 0;
}

.post-card--featured .post-card__image {
  flex: 0 0 50%;
  height: 400px;
}

.post-card--featured .post-card__content {
  flex: 1;
  padding: 32px 32px 32px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.post-card--featured .post-card__title {
  font-size: 32px;
  line-height: 1.3;
  margin: 16px 0;
}

.post-card--featured .post-card__excerpt {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 24px;
}

/* Grid Layout - Card style */
.post-card--grid {
  flex-direction: column;
}

.post-card--grid .post-card__image {
  width: 100%;
  height: 240px;
}

.post-card--grid .post-card__content {
  padding: 24px;
  padding-left: 28px; /* 添加左边距 */
}

.post-card--grid .post-card__title {
  font-size: 20px;
  line-height: 1.4;
  margin: 12px 0;
}

.post-card--grid .post-card__excerpt {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
}

/* List Layout - Compact horizontal */
.post-card--list {
  flex-direction: row;
  gap: 16px;
  padding: 16px;
}

.post-card--list .post-card__image {
  flex: 0 0 120px;
  height: 120px;
}

.post-card--list .post-card__content {
  flex: 1;
  padding: 0;
}

.post-card--list .post-card__title {
  font-size: 16px;
  line-height: 1.4;
  margin: 0 0 8px 0;
}

.post-card--list .post-card__excerpt {
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card--list .post-card__tags {
  display: none;
}

/* Image */
.post-card__image {
  position: relative;
  overflow: hidden;
  background: var(--color-gray-50, #F9FAFB);
}

.post-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.post-card:hover .post-card__image img {
  transform: scale(1.05);
}

/* Content */
.post-card__content {
  display: flex;
  flex-direction: column;
}

.post-card__category {
  margin-bottom: 8px;
}

.post-card__title {
  font-weight: 600;
  color: var(--text-primary, #1A1A1A);
  margin: 0;
}

.post-card__title a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.post-card__title a:hover {
  color: var(--color-primary-600, #7F56D9);
}

.post-card__excerpt {
  color: var(--text-secondary, #667085);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

/* Meta Info */
.post-card__meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
}

.post-card__author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.post-card__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.post-card__author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.post-card__author-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #1A1A1A);
}

.post-card__date {
  font-size: 12px;
  color: var(--text-secondary, #667085);
}

.post-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.post-card__tags-more {
  font-size: 12px;
  color: var(--text-secondary, #667085);
}

/* Dark theme */
[data-theme="dark"] .post-card {
  background: var(--bg-secondary, #121212);
  box-shadow: 0 1px 3px rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .post-card:hover {
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

[data-theme="dark"] .post-card__image {
  background: rgba(255, 255, 255, 0.05);
}

/* Responsive - Tablet */
@media (max-width: 834px) {
  .post-card--featured {
    flex-direction: column;
    gap: 0;
  }

  .post-card--featured .post-card__image {
    flex: none;
    width: 100%;
    height: 300px;
  }

  .post-card--featured .post-card__content {
    padding: 24px;
  }

  .post-card--featured .post-card__title {
    font-size: 24px;
  }

  .post-card--featured .post-card__excerpt {
    font-size: 16px;
  }

  .post-card--grid .post-card__image {
    height: 200px;
  }
}

/* Responsive - Mobile */
@media (max-width: 390px) {
  .post-card--featured .post-card__image {
    height: 240px;
  }

  .post-card--featured .post-card__content {
    padding: 20px;
  }

  .post-card--featured .post-card__title {
    font-size: 20px;
  }

  .post-card--featured .post-card__excerpt {
    font-size: 14px;
  }

  .post-card--grid .post-card__image {
    height: 180px;
  }

  .post-card--grid .post-card__content {
    padding: 16px;
  }

  .post-card--list {
    flex-direction: column;
    gap: 12px;
  }

  .post-card--list .post-card__image {
    flex: none;
    width: 100%;
    height: 160px;
  }

  .post-card--list .post-card__content {
    padding: 0 16px 16px;
  }
}
</style>
