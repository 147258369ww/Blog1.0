<template>
  <nav class="navbar" role="navigation" aria-label="Main navigation">
    <ul class="navbar__list">
      <li v-for="item in navItems" :key="item.path" class="navbar__item">
        <router-link
          :to="item.path"
          class="navbar__link"
          :class="{ 'navbar__link--active': isActive(item.path) }"
          @click="handleLinkClick(item)"
        >
          {{ item.label }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export interface NavItem {
  label: string
  path: string
  hash?: string
}

interface NavbarProps {
  items?: NavItem[]
}

const props = withDefaults(defineProps<NavbarProps>(), {
  items: () => [
    { label: '首页', path: '/' },
    { label: '文章', path: '/posts' },
    { label: '分类', path: '/categories' },
    { label: '标签', path: '/tags' },
    { label: '关于', path: '/about' }
  ]
})

const route = useRoute()

const navItems = computed(() => props.items)

const isActive = (path: string): boolean => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const handleLinkClick = (item: NavItem) => {
  if (item.hash) {
    // 平滑滚动到锚点
    setTimeout(() => {
      const element = document.querySelector(item.hash!)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }
}
</script>

<style scoped>
.navbar {
  display: none;
}

.navbar__list {
  display: flex;
  align-items: center;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar__item {
  margin: 0;
}

.navbar__link {
  display: inline-block;
  padding: 0.5rem 0;
  color: var(--text-secondary, #667085);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.2s ease;
  position: relative;
}

.navbar__link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--color-primary-600, #7F56D9);
  transition: width 0.3s ease;
}

.navbar__link:hover {
  color: var(--text-primary, #1A1A1A);
}

.navbar__link:hover::after {
  width: 100%;
}

.navbar__link--active {
  color: var(--color-primary-600, #7F56D9);
  font-weight: 600;
}

.navbar__link--active::after {
  width: 100%;
}

.navbar__link:focus-visible {
  outline: 2px solid var(--color-primary-600, #7F56D9);
  outline-offset: 4px;
  border-radius: 4px;
}

/* 桌面端显示水平导航 */
@media (min-width: 835px) {
  .navbar {
    display: block;
  }
}

/* 平板端调整间距 */
@media (min-width: 835px) and (max-width: 1439px) {
  .navbar__list {
    gap: 1.5rem;
  }

  .navbar__link {
    font-size: 0.9375rem;
  }
}

/* Dark theme support */
[data-theme='dark'] .navbar__link {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme='dark'] .navbar__link:hover {
  color: var(--text-primary, #FFFFFF);
}

[data-theme='dark'] .navbar__link--active {
  color: var(--color-primary-600, #7F56D9);
}
</style>
