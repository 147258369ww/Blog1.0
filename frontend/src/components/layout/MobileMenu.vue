<template>
  <Teleport to="body">
    <Transition name="mobile-menu">
      <div v-if="isOpen" class="mobile-menu">
        <!-- 遮罩层 -->
        <div class="mobile-menu__overlay" @click="handleClose" aria-hidden="true"></div>

        <!-- 抽屉菜单 -->
        <div
          class="mobile-menu__drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          @touchstart="onTouchStart"
          @touchend="onTouchEnd"
        >
          <div class="mobile-menu__header">
            <span class="mobile-menu__title">Menu</span>
            <button
              class="mobile-menu__close"
              @click="handleClose"
              aria-label="Close menu"
            >
              <svg class="mobile-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav class="mobile-menu__nav" role="navigation">
            <ul class="mobile-menu__list">
              <li v-for="item in navItems" :key="item.path" class="mobile-menu__item">
                <router-link
                  :to="item.path"
                  class="mobile-menu__link"
                  :class="{ 'mobile-menu__link--active': isActive(item.path) }"
                  @click="handleLinkClick"
                >
                  {{ item.label }}
                </router-link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTouch } from '@/composables/useTouch'
import type { NavItem } from './Navbar.vue'

interface MobileMenuProps {
  isOpen: boolean
  items?: NavItem[]
}

const props = withDefaults(defineProps<MobileMenuProps>(), {
  isOpen: false,
  items: () => [
    { label: 'Home', path: '/' },
    { label: 'Posts', path: '/posts' },
    { label: 'Categories', path: '/categories' },
    { label: 'Tags', path: '/tags' },
    { label: 'Projects', path: '/projects' },
    { label: 'About', path: '/about' }
  ]
})

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()
const { direction, onTouchStart, onTouchEnd } = useTouch()

const navItems = computed(() => props.items)

const isActive = (path: string): boolean => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const handleClose = () => {
  emit('close')
}

const handleLinkClick = () => {
  // 点击链接后关闭菜单
  handleClose()
}

// 监听滑动手势，向右滑动关闭菜单
watch(direction, (newDirection) => {
  if (newDirection === 'right' && props.isOpen) {
    handleClose()
  }
})

// 监听菜单打开状态，控制 body 滚动
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.mobile-menu__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.mobile-menu__drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 80%;
  max-width: 320px;
  background-color: var(--bg-primary, #FFFFFF);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.mobile-menu__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
}

.mobile-menu__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary, #1A1A1A);
}

.mobile-menu__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0.625rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  color: var(--text-primary, #1A1A1A);
  transition: background-color 0.2s ease;
}

.mobile-menu__close:hover {
  background-color: var(--bg-secondary, rgba(0, 0, 0, 0.05));
}

.mobile-menu__close:focus-visible {
  outline: 2px solid var(--color-primary-600, #7F56D9);
  outline-offset: 2px;
}

.mobile-menu__icon {
  width: 24px;
  height: 24px;
}

.mobile-menu__nav {
  flex: 1;
  padding: 1rem 0;
}

.mobile-menu__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-menu__item {
  margin: 0;
}

.mobile-menu__link {
  display: block;
  padding: 1rem 1.5rem;
  min-height: 44px;
  color: var(--text-secondary, #667085);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.mobile-menu__link:hover {
  color: var(--text-primary, #1A1A1A);
  background-color: var(--bg-secondary, rgba(0, 0, 0, 0.05));
}

.mobile-menu__link--active {
  color: var(--color-primary-600, #7F56D9);
  background-color: var(--color-primary-50, #F9F5FF);
  border-left-color: var(--color-primary-600, #7F56D9);
  font-weight: 600;
}

.mobile-menu__link:focus-visible {
  outline: 2px solid var(--color-primary-600, #7F56D9);
  outline-offset: -2px;
}

/* 动画 */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.3s ease;
}

.mobile-menu-enter-active .mobile-menu__drawer,
.mobile-menu-leave-active .mobile-menu__drawer {
  transition: transform 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}

.mobile-menu-enter-from .mobile-menu__drawer,
.mobile-menu-leave-to .mobile-menu__drawer {
  transform: translateX(100%);
}

/* Dark theme support */
[data-theme='dark'] .mobile-menu__drawer {
  background-color: var(--bg-primary, #090D1F);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.5);
}

[data-theme='dark'] .mobile-menu__header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

[data-theme='dark'] .mobile-menu__link {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme='dark'] .mobile-menu__link:hover {
  color: var(--text-primary, #FFFFFF);
  background-color: rgba(255, 255, 255, 0.05);
}

[data-theme='dark'] .mobile-menu__link--active {
  color: var(--color-primary-600, #7F56D9);
  background-color: rgba(127, 86, 217, 0.1);
}

/* 只在移动端显示 */
@media (min-width: 835px) {
  .mobile-menu {
    display: none;
  }
}
</style>
