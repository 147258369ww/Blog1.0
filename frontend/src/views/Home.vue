<template>
  <div class="home">
    <!-- Background for entire page -->
    <div class="home__background">
      <Prism
        animation-type="rotate"
        :time-scale="0.5"
        :height="3.5"
        :base-width="5.5"
        :scale="3.6"
        :hue-shift="0"
        :color-frequency="1"
        :noise="0"
        :glow="1"
      />
    </div>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero__container">
        <!-- Portfolio Gallery -->
        <div class="portfolio-gallery">
          <CircularGallery
            :items="portfolioItems"
            :bend="3"
            text-color="#ffffff"
            font="bold 24px Arial"
            :scroll-speed="2"
            :scroll-ease="0.05"
          />
        </div>
      </div>
    </section>

    <!-- Recent Blog Posts Section -->
    <section class="recent-posts">
      <div class="recent-posts__container">
        <h2 class="section-title">最新文章</h2>
        
        <div v-if="loading && posts.length === 0" class="recent-posts__loading">
          <Skeleton type="post-card" :count="3" />
        </div>

        <div v-else-if="error" class="recent-posts__error">
          <EmptyState
            title="加载失败"
            :description="error"
            icon="error"
          />
        </div>

        <div v-else-if="posts.length > 0" class="recent-posts__grid">
          <!-- 显示前3篇文章，使用grid布局 -->
          <BlogPostCard
            v-for="post in recentPosts"
            :key="post.id"
            :post="post"
            layout="grid"
          />
        </div>

        <EmptyState
          v-else
          title="暂无文章"
          description="稍后再来查看新内容"
          icon="empty"
        />
      </div>
    </section>

    <!-- All Blog Posts Section -->
    <section class="all-posts">
      <div class="all-posts__container">
        <h2 class="section-title">所有文章</h2>

        <div v-if="loading && allPosts.length === 0" class="all-posts__loading">
          <Skeleton type="post-card" :count="6" />
        </div>

        <div v-else-if="allPosts.length > 0" class="all-posts__grid">
          <BlogPostCard
            v-for="post in allPosts"
            :key="post.id"
            :post="post"
            layout="grid"
          />
        </div>

        <EmptyState
          v-else-if="!loading"
          title="没有更多文章了"
          description="已经到底了"
          icon="empty"
        />

        <!-- Pagination -->
        <Pagination
          v-if="pagination.totalPages > 1"
          :current-page="pagination.page"
          :total-pages="pagination.totalPages"
          @page-change="handlePageChange"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, defineAsyncComponent } from 'vue'
import { errorHandler, ErrorLevel } from '@/utils/errorHandler'
import { usePostsStore } from '@/stores/posts'
import { useMeta } from '@/composables/useMeta'
import BlogPostCard from '@/components/blog/BlogPostCard.vue'
import Pagination from '@/components/common/Pagination.vue'
import Skeleton from '@/components/common/Skeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import Loading from '@/components/common/Loading.vue'

// 异步加载重型 3D 组件
const Prism = defineAsyncComponent({
  loader: () => import('@/components/common/Prism.vue'),
  loadingComponent: Loading,
  delay: 200,
  timeout: 3000
})

const CircularGallery = defineAsyncComponent({
  loader: () => import('@/components/common/CircularGallery.vue'),
  loadingComponent: Loading,
  delay: 200,
  timeout: 3000
})

const postsStore = usePostsStore()

// Portfolio items for gallery - 使用更高分辨率的图片
const portfolioItems = [
  { image: 'https://picsum.photos/seed/project1/1600/1200', text: '项目一' },
  { image: 'https://picsum.photos/seed/project2/1600/1200', text: '项目二' },
  { image: 'https://picsum.photos/seed/project3/1600/1200', text: '项目三' },
  { image: 'https://picsum.photos/seed/project4/1600/1200', text: '项目四' },
  { image: 'https://picsum.photos/seed/project5/1600/1200', text: '项目五' },
  { image: 'https://picsum.photos/seed/project6/1600/1200', text: '项目六' }
]

const posts = computed(() => postsStore.posts)
const pagination = computed(() => postsStore.pagination)
const loading = computed(() => postsStore.loading)
const error = computed(() => postsStore.error)

// Initialize SEO meta tags with website structured data
const { setWebsiteStructuredData } = useMeta()

// Set website structured data on mount
onMounted(() => {
  setWebsiteStructuredData({
    name: '个人博客',
    description: '分享技术、开发和更多精彩内容的现代博客',
    url: window.location.origin,
    logo: `${window.location.origin}/images/logo.png`
  })
})

// Recent posts (前3篇文章显示在最新文章区域)
const recentPosts = computed(() => posts.value.slice(0, 3))

// All posts (所有文章显示在所有文章区域)
const allPosts = computed(() => posts.value)

const handlePageChange = async (page: number) => {
  try {
    await postsStore.fetchPosts({ page, pageSize: 10 })
    // Scroll to top of all posts section
    const allPostsSection = document.querySelector('.all-posts')
    if (allPostsSection) {
      allPostsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  } catch (err) {
    errorHandler.log('Failed to load page', ErrorLevel.ERROR, { error: String(err) })
  }
}

onMounted(async () => {
  try {
    // Fetch first page of posts
    await postsStore.fetchPosts({ page: 1, pageSize: 10 })
  } catch (err) {
    errorHandler.log('Failed to load posts', ErrorLevel.ERROR, { error: String(err) })
  }
})
</script>

<style scoped>
.home {
  position: relative;
  min-height: 100vh;
  overflow: visible;
}

.home__background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 0;
  opacity: 0.7;
  pointer-events: none;
}

/* Hero Section */
.hero {
  position: relative;
  padding: 60px 0;
  min-height: 480px;
  background: transparent;
  overflow: visible;
  z-index: 10;
}

.hero__container {
  position: relative;
  z-index: 10;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0;
  overflow: visible;
}

.portfolio-gallery {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: visible;
  z-index: 10;
}

/* Recent Posts Section */
.recent-posts {
  position: relative;
  padding: 80px 0;
  z-index: 1;
}

.recent-posts__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 80px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary, #1A1A1A);
  margin: 0 0 32px 0;
}

.recent-posts__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

.recent-posts__loading,
.recent-posts__error {
  grid-column: 1 / -1;
}

/* All Posts Section */
.all-posts {
  position: relative;
  padding: 80px 0;
  z-index: 1;
}

.all-posts__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 80px;
}

.all-posts__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-bottom: 48px;
}

.all-posts__loading {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

/* Dark theme */
[data-theme="dark"] .home__background {
  opacity: 0.5;
}

/* Responsive - Tablet (834px) */
@media (max-width: 1439px) {
  .hero__container {
    padding: 0;
  }

  .recent-posts__container,
  .all-posts__container {
    padding: 0 40px;
  }

  .portfolio-gallery {
    height: 380px;
  }

  .hero {
    padding: 50px 0;
    min-height: 460px;
  }

  .all-posts__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .all-posts__loading {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 834px) {
  .hero {
    padding: 40px 0;
    min-height: 400px;
  }

  .hero__container {
    padding: 0;
  }

  .recent-posts__container,
  .all-posts__container {
    padding: 0 24px;
  }

  .portfolio-gallery {
    height: 320px;
  }

  .recent-posts,
  .all-posts {
    padding: 60px 0;
  }

  .section-title {
    font-size: 20px;
    margin-bottom: 24px;
  }

  .recent-posts__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .all-posts__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .all-posts__loading {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Responsive - Mobile (390px) */
@media (max-width: 390px) {
  .hero {
    padding: 30px 0;
    min-height: 340px;
  }

  .hero__container {
    padding: 0;
  }

  .recent-posts__container,
  .all-posts__container {
    padding: 0 16px;
  }

  .portfolio-gallery {
    height: 280px;
  }

  .gallery-fade {
    width: 60px;
  }

  .recent-posts,
  .all-posts {
    padding: 40px 0;
  }

  .section-title {
    font-size: 18px;
    margin-bottom: 20px;
  }

  .recent-posts__grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .all-posts__grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 32px;
  }

  .all-posts__loading {
    grid-template-columns: 1fr;
  }
}
</style>
