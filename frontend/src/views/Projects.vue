<template>
  <div class="projects-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero__container">
        <h1 class="hero__title">PROJECTS</h1>
      </div>
    </section>

    <!-- Projects List Section -->
    <section class="projects-list">
      <div class="projects-list__container">
        <!-- Loading State -->
        <div v-if="loading" class="projects-list__loading">
          <Skeleton
            v-for="i in 4"
            :key="i"
            variant="rounded"
            height="400px"
            class="projects-list__skeleton"
          />
        </div>

        <!-- Empty State -->
        <EmptyState
          v-else-if="!loading && projects.length === 0"
          title="No projects yet"
          description="Check back later for new projects and case studies."
        >
          <template #icon>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 16C8 11.5817 11.5817 8 16 8H48C52.4183 8 56 11.5817 56 16V48C56 52.4183 52.4183 56 48 56H16C11.5817 56 8 52.4183 8 48V16Z" stroke="currentColor" stroke-width="2"/>
              <path d="M20 28L28 36L44 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </template>
        </EmptyState>

        <!-- Projects Grid -->
        <div v-else class="projects-list__grid">
          <article
            v-for="project in projects"
            :key="project.id"
            class="project-card"
          >
            <!-- Cover Image -->
            <div class="project-card__image-wrapper">
              <img
                v-if="project.coverImage"
                :src="project.coverImage"
                :alt="project.title"
                :data-project-id="project.id"
                class="project-card__image"
                @error="handleImageError"
              />
              <div v-else class="project-card__image-placeholder">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 16C8 11.5817 11.5817 8 16 8H48C52.4183 8 56 11.5817 56 16V48C56 52.4183 52.4183 56 48 56H16C11.5817 56 8 52.4183 8 48V16Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M20 28L28 36L44 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>

            <!-- Content -->
            <div class="project-card__content">
              <h2 class="project-card__title">{{ project.title }}</h2>
              <p class="project-card__description">{{ project.description }}</p>

              <!-- Tags -->
              <div v-if="project.tags && project.tags.length > 0" class="project-card__tags">
                <span
                  v-for="tag in project.tags"
                  :key="tag"
                  class="project-card__tag"
                >
                  {{ tag }}
                </span>
              </div>

              <!-- Links -->
              <div class="project-card__links">
                <a
                  v-if="project.demoUrl"
                  :href="project.demoUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="project-card__link project-card__link--primary"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 3.33334V16.6667M10 16.6667L15 11.6667M10 16.6667L5 11.6667" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  View Demo
                </a>
                <a
                  v-if="project.githubUrl"
                  :href="project.githubUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="project-card__link project-card__link--secondary"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2C5.58172 2 2 5.58172 2 10C2 13.5403 4.29203 16.5608 7.47097 17.5628C7.87097 17.6328 8.01709 17.3828 8.01709 17.1628C8.01709 16.9628 8.01709 16.4628 8.01709 15.8128C5.67097 16.2928 5.20709 14.7628 5.20709 14.7628C4.84709 13.8828 4.32097 13.6328 4.32097 13.6328C3.60709 13.1328 4.37097 13.1428 4.37097 13.1428C5.15709 13.1928 5.57097 13.9728 5.57097 13.9728C6.27097 15.1728 7.42097 14.8228 8.03709 14.6028C8.10709 14.0828 8.31709 13.7328 8.54709 13.5128C6.77097 13.2928 4.90709 12.6128 4.90709 9.37284C4.90709 8.53284 5.20709 7.84284 5.58709 7.30284C5.50709 7.08284 5.22097 6.27284 5.66709 5.18284C5.66709 5.18284 6.33709 4.96284 8.00709 6.08284C8.64709 5.88284 9.32709 5.78284 10.0071 5.78284C10.6871 5.78284 11.3671 5.88284 12.0071 6.08284C13.6771 4.96284 14.3471 5.18284 14.3471 5.18284C14.7971 6.27284 14.5071 7.08284 14.4271 7.30284C14.8071 7.84284 15.1071 8.53284 15.1071 9.37284C15.1071 12.6228 13.2371 13.2828 11.4571 13.5028C11.7471 13.7528 12.0071 14.2428 12.0071 15.0028C12.0071 16.0828 12.0071 16.9528 12.0071 17.1628C12.0071 17.3828 12.1471 17.6328 12.5571 17.5628C15.7371 16.5608 18.0071 13.5403 18.0071 10C18.0071 5.58172 14.4184 2 10 2Z" fill="currentColor"/>
                  </svg>
                  View Code
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Skeleton from '@/components/common/Skeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'

interface Project {
  id: number
  title: string
  description: string
  coverImage?: string
  tags?: string[]
  demoUrl?: string
  githubUrl?: string
}

const projects = ref<Project[]>([])
const loading = ref(false)

// 图片重试计数器 - 为每个项目单独计数
const imageRetryCountMap = ref<Map<number, number>>(new Map())
const MAX_RETRY = 5

// Mock data for demonstration
// In a real application, this would fetch from an API
const fetchProjects = async () => {
  loading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock projects data
    projects.value = [
      {
        id: 1,
        title: 'E-Commerce Platform',
        description: 'A full-stack e-commerce platform built with Vue 3, Node.js, and PostgreSQL. Features include product management, shopping cart, payment integration, and order tracking.',
        coverImage: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=600&fit=crop',
        tags: ['Vue 3', 'Node.js', 'PostgreSQL', 'Stripe'],
        demoUrl: 'https://example.com/demo',
        githubUrl: 'https://github.com/example/project'
      },
      {
        id: 2,
        title: 'Task Management App',
        description: 'A collaborative task management application with real-time updates, drag-and-drop interface, and team collaboration features.',
        coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
        tags: ['React', 'TypeScript', 'Firebase', 'Tailwind CSS'],
        demoUrl: 'https://example.com/demo',
        githubUrl: 'https://github.com/example/project'
      },
      {
        id: 3,
        title: 'Weather Dashboard',
        description: 'A beautiful weather dashboard that displays current weather, forecasts, and historical data with interactive charts and maps.',
        coverImage: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=800&h=600&fit=crop',
        tags: ['Vue 3', 'Chart.js', 'OpenWeather API'],
        demoUrl: 'https://example.com/demo'
      },
      {
        id: 4,
        title: 'Portfolio Website',
        description: 'A modern portfolio website with smooth animations, dark mode support, and responsive design. Built with performance and accessibility in mind.',
        tags: ['Next.js', 'Framer Motion', 'Tailwind CSS'],
        githubUrl: 'https://github.com/example/project'
      }
    ]
  } catch (error) {
    console.error('Failed to fetch projects:', error)
  } finally {
    loading.value = false
  }
}

// Handle image load error
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  const projectId = parseInt(img.getAttribute('data-project-id') || '0')
  
  // 如果图片已经隐藏，不再处理
  if (img.style.display === 'none') {
    return
  }
  
  // 获取当前项目的重试次数
  const currentRetryCount = imageRetryCountMap.value.get(projectId) || 0
  imageRetryCountMap.value.set(projectId, currentRetryCount + 1)
  
  if (currentRetryCount < MAX_RETRY) {
    // 重试加载原图
    const originalSrc = img.src.split('?')[0] // 移除之前的查询参数
    setTimeout(() => {
      img.src = originalSrc + '?retry=' + (currentRetryCount + 1)
    }, 1000 * (currentRetryCount + 1)) // 递增延迟
  } else {
    // 超过重试次数，隐藏图片并显示占位符
    img.style.display = 'none'
    const placeholder = img.parentElement?.querySelector('.project-card__image-placeholder')
    if (placeholder) {
      (placeholder as HTMLElement).style.display = 'flex'
    }
  }
}

onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
.projects-page {
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

/* Projects List Section */
.projects-list {
  background: var(--bg-secondary, #F9FAFB);
  padding: 80px 0;
}

.projects-list__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 80px;
}

.projects-list__loading {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}

.projects-list__skeleton {
  width: 100%;
}

.projects-list__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 48px;
}

/* Project Card */
.project-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  background-color: var(--bg-primary, #FFFFFF);
  border: 1px solid var(--color-gray-300, #D0D5DD);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary-600, #7F56D9);
}

.project-card:nth-child(even) {
  grid-template-columns: 1fr 1fr;
}

.project-card:nth-child(even) .project-card__image-wrapper {
  order: 2;
}

.project-card:nth-child(even) .project-card__content {
  order: 1;
}

.project-card__image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  overflow: hidden;
}

.project-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.project-card:hover .project-card__image {
  transform: scale(1.05);
}

.project-card__image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--color-primary-50, #F9F5FF) 0%, var(--color-gray-50, #F9FAFB) 100%);
  color: var(--color-gray-500, #667085);
}

.project-card__content {
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.project-card__title {
  margin: 0 0 16px 0;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary, #1A1A1A);
  letter-spacing: -0.02em;
}

.project-card__description {
  margin: 0 0 24px 0;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-secondary, #667085);
}

.project-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.project-card__tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background-color: var(--color-primary-50, #F9F5FF);
  color: var(--color-primary-700, #6941C6);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.project-card__links {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.project-card__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.project-card__link svg {
  width: 20px;
  height: 20px;
}

.project-card__link--primary {
  background-color: var(--color-primary-600, #7F56D9);
  color: #FFFFFF;
}

.project-card__link--primary:hover {
  background-color: var(--color-primary-700, #6941C6);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(127, 86, 217, 0.3);
}

.project-card__link--secondary {
  background-color: transparent;
  color: var(--text-primary, #1A1A1A);
  border: 1px solid var(--color-gray-300, #D0D5DD);
}

.project-card__link--secondary:hover {
  background-color: var(--color-gray-50, #F9FAFB);
  border-color: var(--color-gray-500, #667085);
}

/* Dark theme */
[data-theme="dark"] .hero {
  background: var(--bg-primary, #090D1F);
  border-bottom-color: rgba(255, 255, 255, 0.34);
}

[data-theme="dark"] .hero__title {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .projects-list {
  background: var(--bg-secondary, #121212);
}

[data-theme="dark"] .project-card {
  background-color: var(--bg-primary, #090D1F);
  border-color: rgba(255, 255, 255, 0.34);
}

[data-theme="dark"] .project-card:hover {
  box-shadow: 0 12px 32px rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .project-card__title {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .project-card__description {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme="dark"] .project-card__tag {
  background-color: rgba(127, 86, 217, 0.2);
  color: var(--color-primary-600, #7F56D9);
}

[data-theme="dark"] .project-card__link--secondary {
  color: var(--text-primary, #FFFFFF);
  border-color: rgba(255, 255, 255, 0.34);
}

[data-theme="dark"] .project-card__link--secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Responsive - Tablet */
@media (max-width: 1439px) {
  .hero__container,
  .projects-list__container {
    padding: 0 40px;
  }

  .hero__title {
    font-size: 72px;
  }

  .project-card {
    gap: 32px;
  }

  .project-card__content {
    padding: 32px;
  }

  .project-card__title {
    font-size: 28px;
  }
}

@media (max-width: 834px) {
  .hero {
    padding: 60px 0;
  }

  .hero__container,
  .projects-list__container {
    padding: 0 24px;
  }

  .hero__title {
    font-size: 64px;
  }

  .projects-list {
    padding: 60px 0;
  }

  .projects-list__grid {
    gap: 32px;
  }

  .project-card {
    grid-template-columns: 1fr !important;
    gap: 0;
  }

  .project-card:nth-child(even) .project-card__image-wrapper,
  .project-card:nth-child(even) .project-card__content {
    order: initial;
  }

  .project-card__image-wrapper {
    min-height: 300px;
  }

  .project-card__content {
    padding: 24px;
  }

  .project-card__title {
    font-size: 24px;
  }

  .project-card__description {
    font-size: 15px;
  }
}

/* Responsive - Mobile */
@media (max-width: 390px) {
  .hero {
    padding: 40px 0;
  }

  .hero__container,
  .projects-list__container {
    padding: 0 16px;
  }

  .hero__title {
    font-size: 48px;
  }

  .projects-list {
    padding: 40px 0;
  }

  .projects-list__grid {
    gap: 24px;
  }

  .project-card__image-wrapper {
    min-height: 240px;
  }

  .project-card__content {
    padding: 20px;
  }

  .project-card__title {
    font-size: 20px;
    margin-bottom: 12px;
  }

  .project-card__description {
    font-size: 14px;
    margin-bottom: 16px;
  }

  .project-card__tags {
    margin-bottom: 16px;
  }

  .project-card__tag {
    font-size: 12px;
    padding: 4px 10px;
  }

  .project-card__links {
    flex-direction: column;
  }

  .project-card__link {
    width: 100%;
    justify-content: center;
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style>
