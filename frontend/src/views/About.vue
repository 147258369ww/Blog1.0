<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero__container">
        <div class="hero__content">
          <div class="hero__image-wrapper">
            <img
              :src="profile.avatar || defaultAvatar"
              :alt="profile.name"
              class="hero__image"
              @error="handleImageError"
            />
          </div>
          <div class="hero__text">
            <h1 class="hero__title">{{ profile.name }}</h1>
            <p class="hero__subtitle">{{ profile.title }}</p>
            <div class="hero__social">
              <a
                v-for="social in profile.socialLinks"
                :key="social.name"
                :href="social.url"
                target="_blank"
                rel="noopener noreferrer"
                class="hero__social-link"
                :aria-label="social.name"
              >
                <component :is="getSocialIcon(social.name)" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Me Section -->
    <section class="about-section">
      <div class="about-section__container">
        <h2 class="about-section__title">关于我</h2>
        <div class="about-section__content">
          <p v-for="(paragraph, index) in profile.bio" :key="index" class="about-section__paragraph">
            {{ paragraph }}
          </p>
        </div>
      </div>
    </section>

    <!-- Skills Section -->
    <section class="skills-section">
      <div class="skills-section__container">
        <h2 class="skills-section__title">技能与专长</h2>
        <div class="skills-section__grid">
          <div
            v-for="skillCategory in profile.skills"
            :key="skillCategory.category"
            class="skill-category"
          >
            <h3 class="skill-category__title">{{ skillCategory.category }}</h3>
            <div class="skill-category__items">
              <span
                v-for="skill in skillCategory.items"
                :key="skill"
                class="skill-tag"
              >
                {{ skill }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Experience Section -->
    <section class="experience-section">
      <div class="experience-section__container">
        <h2 class="experience-section__title">工作经历</h2>
        <div class="experience-section__timeline">
          <article
            v-for="(experience, index) in profile.experience"
            :key="index"
            class="experience-item"
          >
            <div class="experience-item__header">
              <div class="experience-item__company">
                <h3 class="experience-item__position">{{ experience.position }}</h3>
                <p class="experience-item__company-name">{{ experience.company }}</p>
              </div>
              <span class="experience-item__period">{{ experience.period }}</span>
            </div>
            <p class="experience-item__description">{{ experience.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Education Section -->
    <section class="education-section">
      <div class="education-section__container">
        <h2 class="education-section__title">教育背景</h2>
        <div class="education-section__list">
          <article
            v-for="(education, index) in profile.education"
            :key="index"
            class="education-item"
          >
            <div class="education-item__header">
              <div class="education-item__school">
                <h3 class="education-item__degree">{{ education.degree }}</h3>
                <p class="education-item__school-name">{{ education.school }}</p>
              </div>
              <span class="education-item__period">{{ education.period }}</span>
            </div>
            <p v-if="education.description" class="education-item__description">
              {{ education.description }}
            </p>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'

interface SocialLink {
  name: string
  url: string
}

interface SkillCategory {
  category: string
  items: string[]
}

interface Experience {
  position: string
  company: string
  period: string
  description: string
}

interface Education {
  degree: string
  school: string
  period: string
  description?: string
}

interface Profile {
  name: string
  title: string
  avatar?: string
  bio: string[]
  socialLinks: SocialLink[]
  skills: SkillCategory[]
  experience: Experience[]
  education: Education[]
}

const defaultAvatar = '/images/avatar.png'

// 图片重试计数器
const imageRetryCount = ref(0)
const MAX_RETRY = 5
const imageRetrying = ref(false)

// Mock profile data
const profile = ref<Profile>({
  name: '',
  title: '',
  avatar: '/images/avatar.png',
  bio: [
    '',
    '',
    ''
  ],
  socialLinks: [
    { name: 'twitter', url: '' },
    { name: 'linkedin', url: '' },
    { name: 'github', url: '' },
    { name: 'email', url: '' }
  ],
  skills: [
    {
      category: '前端',
      items: ['Vue.js', 'React', 'TypeScript', 'Tailwind CSS', 'Vite']
    },
    {
      category: '后端',
      items: ['Node.js', 'Express', 'PostgreSQL', 'Redis']
    },
    {
      category: '工具',
      items: ['Git', 'VS Code', 'Figma', 'Postman', 'Jest']
    }
  ],
  experience: [
    {
      position: '',
      company: '',
      period: '',
      description: ''
    }
  ],
  education: [
    {
      degree: '',
      school: '',
      period: '',
      description: ''
    }
  ]
})

// Social icon components
const getSocialIcon = (name: string) => {
  const icons: Record<string, any> = {
    twitter: () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'currentColor' }, [
      h('path', { d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' })
    ]),
    linkedin: () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'currentColor' }, [
      h('path', { d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' })
    ]),
    github: () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'currentColor' }, [
      h('path', { d: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' })
    ]),
    email: () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }),
      h('polyline', { points: '22,6 12,13 2,6' })
    ])
  }
  return icons[name] || icons.email
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  
  // 如果正在重试中或已经是默认头像，不再处理
  if (imageRetrying.value || img.src === defaultAvatar) {
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
    // 超过重试次数，显示默认头像
    img.src = defaultAvatar
  }
}
</script>

<style scoped>
.about-page {
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

.hero__content {
  display: flex;
  align-items: center;
  gap: 48px;
}

.hero__image-wrapper {
  flex-shrink: 0;
}

.hero__image {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--color-primary-600, #7F56D9);
}

.hero__text {
  flex: 1;
}

.hero__title {
  font-size: 64px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary, #1A1A1A);
  margin: 0 0 12px 0;
}

.hero__subtitle {
  font-size: 24px;
  color: var(--text-secondary, #667085);
  margin: 0 0 24px 0;
}

.hero__social {
  display: flex;
  gap: 16px;
}

.hero__social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-gray-50, #F9FAFB);
  color: var(--text-primary, #1A1A1A);
  transition: all 0.2s ease;
}

.hero__social-link:hover {
  background-color: var(--color-primary-600, #7F56D9);
  color: #FFFFFF;
  transform: translateY(-2px);
}

/* About Section */
.about-section {
  background: var(--bg-secondary, #F9FAFB);
  padding: 80px 0;
}

.about-section__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 80px;
}

.about-section__title {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary, #1A1A1A);
  margin: 0 0 32px 0;
  letter-spacing: -0.02em;
}

.about-section__content {
  max-width: 800px;
}

.about-section__paragraph {
  font-size: 18px;
  line-height: 1.8;
  color: var(--text-secondary, #667085);
  margin: 0 0 24px 0;
}

.about-section__paragraph:last-child {
  margin-bottom: 0;
}

/* Skills Section */
.skills-section {
  background: var(--bg-primary, #FFFFFF);
  padding: 80px 0;
}

.skills-section__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 80px;
}

.skills-section__title {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary, #1A1A1A);
  margin: 0 0 48px 0;
  letter-spacing: -0.02em;
}

.skills-section__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

.skill-category {
  padding: 32px;
  background-color: var(--bg-secondary, #F9FAFB);
  border-radius: 12px;
  border: 1px solid var(--color-gray-300, #D0D5DD);
}

.skill-category__title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #1A1A1A);
  margin: 0 0 20px 0;
}

.skill-category__items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background-color: var(--color-primary-50, #F9F5FF);
  color: var(--color-primary-700, #6941C6);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

/* Experience Section */
.experience-section {
  background: var(--bg-secondary, #F9FAFB);
  padding: 80px 0;
}

.experience-section__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 80px;
}

.experience-section__title {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary, #1A1A1A);
  margin: 0 0 48px 0;
  letter-spacing: -0.02em;
}

.experience-section__timeline {
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.experience-item {
  padding: 32px;
  background-color: var(--bg-primary, #FFFFFF);
  border-radius: 12px;
  border: 1px solid var(--color-gray-300, #D0D5DD);
  transition: all 0.3s ease;
}

.experience-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary-600, #7F56D9);
}

.experience-item__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
}

.experience-item__company {
  flex: 1;
}

.experience-item__position {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #1A1A1A);
  margin: 0 0 8px 0;
}

.experience-item__company-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-primary-600, #7F56D9);
  margin: 0;
}

.experience-item__period {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary, #667085);
  white-space: nowrap;
}

.experience-item__description {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-secondary, #667085);
  margin: 0;
}

/* Education Section */
.education-section {
  background: var(--bg-primary, #FFFFFF);
  padding: 80px 0;
}

.education-section__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 80px;
}

.education-section__title {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary, #1A1A1A);
  margin: 0 0 48px 0;
  letter-spacing: -0.02em;
}

.education-section__list {
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.education-item {
  padding: 32px;
  background-color: var(--bg-secondary, #F9FAFB);
  border-radius: 12px;
  border: 1px solid var(--color-gray-300, #D0D5DD);
}

.education-item__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 16px;
}

.education-item__school {
  flex: 1;
}

.education-item__degree {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #1A1A1A);
  margin: 0 0 8px 0;
}

.education-item__school-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-primary-600, #7F56D9);
  margin: 0;
}

.education-item__period {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary, #667085);
  white-space: nowrap;
}

.education-item__description {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-secondary, #667085);
  margin: 0;
}

/* Dark theme */
[data-theme="dark"] .hero {
  background: var(--bg-primary, #090D1F);
  border-bottom-color: rgba(255, 255, 255, 0.34);
}

[data-theme="dark"] .hero__title {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .hero__subtitle {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme="dark"] .hero__social-link {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .about-section {
  background: var(--bg-secondary, #121212);
}

[data-theme="dark"] .about-section__title,
[data-theme="dark"] .skills-section__title,
[data-theme="dark"] .experience-section__title,
[data-theme="dark"] .education-section__title {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .about-section__paragraph,
[data-theme="dark"] .experience-item__description,
[data-theme="dark"] .education-item__description {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme="dark"] .skills-section {
  background: var(--bg-primary, #090D1F);
}

[data-theme="dark"] .skill-category {
  background-color: var(--bg-secondary, #121212);
  border-color: rgba(255, 255, 255, 0.34);
}

[data-theme="dark"] .skill-category__title {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .skill-tag {
  background-color: rgba(127, 86, 217, 0.2);
  color: var(--color-primary-600, #7F56D9);
}

[data-theme="dark"] .experience-section {
  background: var(--bg-secondary, #121212);
}

[data-theme="dark"] .experience-item {
  background-color: var(--bg-primary, #090D1F);
  border-color: rgba(255, 255, 255, 0.34);
}

[data-theme="dark"] .experience-item:hover {
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .experience-item__position,
[data-theme="dark"] .education-item__degree {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .experience-item__period,
[data-theme="dark"] .education-item__period {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme="dark"] .education-section {
  background: var(--bg-primary, #090D1F);
}

[data-theme="dark"] .education-item {
  background-color: var(--bg-secondary, #121212);
  border-color: rgba(255, 255, 255, 0.34);
}

/* Responsive - Tablet */
@media (max-width: 1439px) {
  .hero__container,
  .about-section__container,
  .skills-section__container,
  .experience-section__container,
  .education-section__container {
    padding: 0 40px;
  }

  .hero__title {
    font-size: 48px;
  }

  .hero__subtitle {
    font-size: 20px;
  }

  .about-section__title,
  .skills-section__title,
  .experience-section__title,
  .education-section__title {
    font-size: 32px;
  }
}

@media (max-width: 834px) {
  .hero,
  .about-section,
  .skills-section,
  .experience-section,
  .education-section {
    padding: 60px 0;
  }

  .hero__container,
  .about-section__container,
  .skills-section__container,
  .experience-section__container,
  .education-section__container {
    padding: 0 24px;
  }

  .hero__content {
    flex-direction: column;
    text-align: center;
    gap: 32px;
  }

  .hero__title {
    font-size: 40px;
  }

  .hero__subtitle {
    font-size: 18px;
  }

  .hero__social {
    justify-content: center;
  }

  .about-section__title,
  .skills-section__title,
  .experience-section__title,
  .education-section__title {
    font-size: 28px;
    margin-bottom: 32px;
  }

  .skills-section__grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .experience-item__header,
  .education-item__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .experience-item__period,
  .education-item__period {
    white-space: normal;
  }
}

/* Responsive - Mobile */
@media (max-width: 390px) {
  .hero,
  .about-section,
  .skills-section,
  .experience-section,
  .education-section {
    padding: 40px 0;
  }

  .hero__container,
  .about-section__container,
  .skills-section__container,
  .experience-section__container,
  .education-section__container {
    padding: 0 16px;
  }

  .hero__image {
    width: 150px;
    height: 150px;
  }

  .hero__title {
    font-size: 32px;
  }

  .hero__subtitle {
    font-size: 16px;
  }

  .hero__social-link {
    width: 44px;
    height: 44px;
  }

  .about-section__title,
  .skills-section__title,
  .experience-section__title,
  .education-section__title {
    font-size: 24px;
    margin-bottom: 24px;
  }

  .about-section__paragraph {
    font-size: 16px;
  }

  .skill-category {
    padding: 24px;
  }

  .skill-category__title {
    font-size: 18px;
  }

  .experience-item,
  .education-item {
    padding: 24px;
  }

  .experience-item__position {
    font-size: 18px;
  }

  .education-item__degree {
    font-size: 16px;
  }
}
</style>
