<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero__container">
        <h1 class="hero__title">THE BLOG</h1>
      </div>
    </section>

    <!-- Recent Blog Posts Section -->
    <section class="recent-posts">
      <div class="recent-posts__container">
        <h2 class="section-title">Recent blog posts</h2>
        
        <div v-if="loading && posts.length === 0" class="recent-posts__loading">
          <Skeleton type="post-card" :count="3" />
        </div>

        <div v-else-if="error" class="recent-posts__error">
          <EmptyState
            title="Failed to load posts"
            :description="error"
            icon="error"
          />
        </div>

        <div v-else-if="posts.length > 0" class="recent-posts__grid">
          <!-- Featured Post (first post) -->
          <div v-if="featuredPost" class="recent-posts__featured">
            <BlogPostCard
              :post="featuredPost"
              layout="featured"
            />
          </div>

          <!-- Secondary Posts (next 2 posts) -->
          <div v-if="secondaryPosts.length > 0" class="recent-posts__secondary">
            <BlogPostCard
              v-for="post in secondaryPosts"
              :key="post.id"
              :post="post"
              layout="list"
            />
          </div>
        </div>

        <EmptyState
          v-else
          title="No posts yet"
          description="Check back later for new content"
          icon="empty"
        />
      </div>
    </section>

    <!-- All Blog Posts Section -->
    <section class="all-posts">
      <div class="all-posts__container">
        <h2 class="section-title">All blog posts</h2>

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
          title="No more posts"
          description="You've reached the end"
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
import { computed, onMounted } from 'vue'
import { usePostsStore } from '@/stores/posts'
import BlogPostCard from '@/components/blog/BlogPostCard.vue'
import Pagination from '@/components/common/Pagination.vue'
import Skeleton from '@/components/common/Skeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const postsStore = usePostsStore()

const posts = computed(() => postsStore.posts)
const pagination = computed(() => postsStore.pagination)
const loading = computed(() => postsStore.loading)
const error = computed(() => postsStore.error)

// Featured post (first post)
const featuredPost = computed(() => posts.value[0] || null)

// Recent posts (next 2 posts for the top section)
const secondaryPosts = computed(() => posts.value.slice(1, 3))

// All posts (remaining posts for the grid section)
const allPosts = computed(() => posts.value.slice(3))

const handlePageChange = async (page: number) => {
  try {
    await postsStore.fetchPosts({ page, pageSize: 10 })
    // Scroll to top of all posts section
    const allPostsSection = document.querySelector('.all-posts')
    if (allPostsSection) {
      allPostsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  } catch (err) {
    console.error('Failed to load page:', err)
  }
}

onMounted(async () => {
  try {
    // Fetch first page of posts
    await postsStore.fetchPosts({ page: 1, pageSize: 10 })
  } catch (err) {
    console.error('Failed to load posts:', err)
  }
})
</script>

<style scoped>
.home {
  min-height: 100vh;
}

/* Hero Section */
.hero {
  background: var(--bg-primary, #FFFFFF);
  padding: 80px 0;
  border-bottom: 1px solid var(--color-gray-300, #D0D5DD);
}

.hero__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 80px;
}

.hero__title {
  font-size: 96px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-primary, #1A1A1A);
  margin: 0;
  text-align: left;
}

/* Recent Posts Section */
.recent-posts {
  background: var(--bg-primary, #FFFFFF);
  padding: 80px 0;
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
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.recent-posts__featured {
  grid-column: 1 / -1;
}

.recent-posts__secondary {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.recent-posts__loading,
.recent-posts__error {
  grid-column: 1 / -1;
}

/* All Posts Section */
.all-posts {
  background: var(--bg-secondary, #F9FAFB);
  padding: 80px 0;
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
[data-theme="dark"] .hero {
  background: var(--bg-primary, #090D1F);
  border-bottom-color: rgba(255, 255, 255, 0.34);
}

[data-theme="dark"] .recent-posts {
  background: var(--bg-primary, #090D1F);
}

[data-theme="dark"] .all-posts {
  background: var(--bg-secondary, #121212);
}

/* Responsive - Tablet (834px) */
@media (max-width: 1439px) {
  .hero__container,
  .recent-posts__container,
  .all-posts__container {
    padding: 0 40px;
  }

  .hero__title {
    font-size: 72px;
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
    padding: 60px 0;
  }

  .hero__container,
  .recent-posts__container,
  .all-posts__container {
    padding: 0 24px;
  }

  .hero__title {
    font-size: 64px;
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
    grid-template-columns: 1fr;
    gap: 24px;
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
    padding: 40px 0;
  }

  .hero__container,
  .recent-posts__container,
  .all-posts__container {
    padding: 0 16px;
  }

  .hero__title {
    font-size: 48px;
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
    gap: 20px;
  }

  .recent-posts__secondary {
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
