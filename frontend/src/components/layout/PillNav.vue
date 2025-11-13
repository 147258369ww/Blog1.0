<template>
  <nav class="pill-nav" role="navigation" aria-label="Main navigation">
    <ul class="pill-nav__list" ref="navListRef">
      <li
        v-for="item in navItems"
        :key="item.path"
        class="pill-nav__item"
      >
        <router-link
          :to="item.path"
          class="pill-nav__link"
          :class="{ 'pill-nav__link--active': isActive(item.path) }"
          @click="handleLinkClick(item)"
          ref="linkRefs"
        >
          {{ item.label }}
        </router-link>
      </li>
      <!-- 滑动指示器 -->
      <li
        class="pill-nav__indicator"
        :style="indicatorStyle"
        aria-hidden="true"
      ></li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'

export interface NavItem {
  label: string
  path: string
  hash?: string
}

interface PillNavProps {
  items?: NavItem[]
}

const props = withDefaults(defineProps<PillNavProps>(), {
  items: () => [
    { label: '首页', path: '/' },
    { label: '文章', path: '/posts' },
    { label: '分类', path: '/categories' },
    { label: '标签', path: '/tags' },
    { label: '关于', path: '/about' }
  ]
})

const route = useRoute()
const navListRef = ref<HTMLElement | null>(null)
const linkRefs = ref<HTMLElement[]>([])
const indicatorStyle = ref({
  left: '0px',
  width: '0px'
})

const navItems = computed(() => props.items)

const isActive = (path: string): boolean => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const updateIndicator = () => {
  nextTick(() => {
    if (!navListRef.value) return

    const activeIndex = navItems.value.findIndex(item => isActive(item.path))
    if (activeIndex === -1) {
      indicatorStyle.value = { left: '0px', width: '0px' }
      return
    }

    const links = navListRef.value.querySelectorAll('.pill-nav__link')
    const activeLink = links[activeIndex] as HTMLElement

    if (activeLink) {
      const navRect = navListRef.value.getBoundingClientRect()
      const linkRect = activeLink.getBoundingClientRect()
      
      indicatorStyle.value = {
        left: `${linkRect.left - navRect.left}px`,
        width: `${linkRect.width}px`
      }
    }
  })
}

const handleLinkClick = (item: NavItem) => {
  if (item.hash) {
    setTimeout(() => {
      const element = document.querySelector(item.hash!)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }
}

// 监听路由变化
watch(() => route.path, () => {
  updateIndicator()
})

// 监听窗口大小变化
onMounted(() => {
  updateIndicator()
  window.addEventListener('resize', updateIndicator)
})
</script>

<style scoped>
.pill-nav {
  display: none;
}

.pill-nav__list {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0.25rem;
  background: var(--pill-nav-bg, rgba(0, 0, 0, 0.05));
  border-radius: 999px;
  backdrop-filter: blur(8px);
}

.pill-nav__item {
  margin: 0;
  position: relative;
  z-index: 1;
}

.pill-nav__link {
  display: inline-block;
  padding: 0.5rem 1.25rem;
  color: var(--text-secondary, #667085);
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: color 0.3s ease;
  border-radius: 999px;
  white-space: nowrap;
  position: relative;
}

.pill-nav__link:hover {
  color: var(--text-primary, #1A1A1A);
}

.pill-nav__link--active {
  color: var(--text-primary, #1A1A1A);
  font-weight: 600;
}

.pill-nav__link:focus-visible {
  outline: 2px solid var(--color-primary-600, #7F56D9);
  outline-offset: 2px;
}

/* 滑动指示器 */
.pill-nav__indicator {
  position: absolute;
  top: 0.25rem;
  bottom: 0.25rem;
  background: var(--pill-nav-indicator, #FFFFFF);
  border-radius: 999px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);
  pointer-events: none;
  z-index: 0;
}

/* 桌面端显示 */
@media (min-width: 835px) {
  .pill-nav {
    display: block;
  }
}

/* 平板端调整 */
@media (min-width: 835px) and (max-width: 1439px) {
  .pill-nav__link {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}

/* Dark theme support */
[data-theme='dark'] .pill-nav__list {
  background: var(--pill-nav-bg-dark, rgba(255, 255, 255, 0.08));
}

[data-theme='dark'] .pill-nav__link {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme='dark'] .pill-nav__link:hover {
  color: var(--text-primary, #FFFFFF);
}

[data-theme='dark'] .pill-nav__link--active {
  color: var(--text-primary, #FFFFFF);
}

[data-theme='dark'] .pill-nav__indicator {
  background: var(--pill-nav-indicator-dark, rgba(255, 255, 255, 0.12));
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.3),
    0 1px 2px rgba(0, 0, 0, 0.2);
}
</style>
