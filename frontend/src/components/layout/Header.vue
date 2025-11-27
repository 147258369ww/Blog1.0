<template>
  <header
    :class="[
      'header',
      { 'header--transparent': transparent && !isScrolled, 'header--fixed': fixed || isScrolled }
    ]"
  >
    <div class="header__container">
      <router-link to="/" class="header__logo">
        <span class="header__logo-text">THE BLOG</span>
      </router-link>

      <!-- Desktop Navigation -->
      <PillNav class="header__nav" />

      <div class="header__actions">
        <!-- 未登录状态 - 显示登录/注册按钮 -->
        <div v-if="!isAuthenticated" class="header__auth-buttons">
          <router-link to="/login" class="header__auth-link">登录</router-link>
          <router-link to="/register" class="header__auth-button">注册</router-link>
        </div>

        <!-- 已登录状态 - 显示用户菜单 -->
        <div v-else class="header__user-menu">
          <button
            class="header__user-button"
            @click="toggleUserMenu"
            :aria-label="'用户菜单'"
            :aria-expanded="showUserMenu"
          >
            <svg class="header__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="header__user-name">{{ user?.username || '用户' }}</span>
          </button>

          <!-- 用户下拉菜单 -->
          <transition name="user-menu">
            <div v-if="showUserMenu" class="header__user-dropdown">
              <button @click="goToProfile" class="header__dropdown-item">
                <svg class="header__dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                个人资料
              </button>
              <button @click="handleLogout" class="header__dropdown-item header__dropdown-item--danger">
                <svg class="header__dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                登出
              </button>
            </div>
          </transition>
        </div>

        <button
          class="header__theme-toggle"
          @click="toggleTheme"
          :aria-label="theme === 'light' ? '切换到深色模式' : '切换到浅色模式'"
        >
          <svg v-if="theme === 'light'" class="header__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <svg v-else class="header__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>

        <button
          class="header__menu-toggle"
          @click="toggleMobileMenu"
          :aria-label="isMobileMenuOpen ? '关闭菜单' : '打开菜单'"
          :aria-expanded="isMobileMenuOpen"
        >
          <svg v-if="!isMobileMenuOpen" class="header__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="header__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Menu -->
    <transition name="mobile-menu">
      <div v-if="isMobileMenuOpen" class="mobile-menu">
        <nav class="mobile-menu__nav" role="navigation" aria-label="Mobile navigation">
          <ul class="mobile-menu__list">
            <li class="mobile-menu__item">
              <router-link to="/" class="mobile-menu__link" @click="closeMobileMenu">首页</router-link>
            </li>
            <li class="mobile-menu__item">
              <router-link to="/posts" class="mobile-menu__link" @click="closeMobileMenu">文章</router-link>
            </li>
            <li class="mobile-menu__item">
              <router-link to="/categories" class="mobile-menu__link" @click="closeMobileMenu">分类</router-link>
            </li>
            <li class="mobile-menu__item">
              <router-link to="/tags" class="mobile-menu__link" @click="closeMobileMenu">标签</router-link>
            </li>
            <li class="mobile-menu__item">
              <router-link to="/portfolio" class="mobile-menu__link" @click="closeMobileMenu">作品集</router-link>
            </li>
            <li class="mobile-menu__item">
              <router-link to="/about" class="mobile-menu__link" @click="closeMobileMenu">关于</router-link>
            </li>
            
            <!-- 移动端认证链接 -->
            <li v-if="!isAuthenticated" class="mobile-menu__divider"></li>
            <li v-if="!isAuthenticated" class="mobile-menu__item">
              <router-link to="/login" class="mobile-menu__link" @click="closeMobileMenu">登录</router-link>
            </li>
            <li v-if="!isAuthenticated" class="mobile-menu__item">
              <router-link to="/register" class="mobile-menu__link mobile-menu__link--primary" @click="closeMobileMenu">注册</router-link>
            </li>
            
            <!-- 已登录用户菜单 -->
            <template v-else>
              <li class="mobile-menu__divider"></li>
              <li class="mobile-menu__item">
                <router-link to="/profile" class="mobile-menu__link" @click="closeMobileMenu">
                  <svg class="mobile-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {{ user?.username || '个人资料' }}
                </router-link>
              </li>
              <li class="mobile-menu__item">
                <button class="mobile-menu__link mobile-menu__link--danger" @click="handleLogout">
                  <svg class="mobile-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  登出
                </button>
              </li>
            </template>
          </ul>
        </nav>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import PillNav from './PillNav.vue'

interface HeaderProps {
  transparent?: boolean
  fixed?: boolean
}

withDefaults(defineProps<HeaderProps>(), {
  transparent: false,
  fixed: false
})

const emit = defineEmits<{
  toggleMobileMenu: []
}>()

const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const { theme } = storeToRefs(themeStore)
const { isAuthenticated, user } = storeToRefs(authStore)

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const showUserMenu = ref(false)

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  emit('toggleMobileMenu')
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    showUserMenu.value = false
    router.push('/')
  } catch (error) {
    console.error('登出失败:', error)
  }
}

const goToProfile = () => {
  showUserMenu.value = false
  router.push('/profile')
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
  
  // 如果有 token，获取用户信息
  if (isAuthenticated.value && !user.value) {
    authStore.fetchCurrentUser().catch(() => {
      // 如果获取失败，清除 token
      authStore.clearTokens()
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  background-color: transparent;
  transition: all 0.3s ease;
  z-index: 100;
}

.header--transparent {
  background-color: transparent;
}

.header--fixed {
  background-color: transparent;
}

.header__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 2rem;
}

@media (max-width: 834px) {
  .header__container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.875rem 1rem;
  }
}

.header__logo {
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 700;
  font-size: 1.25rem;
  transition: opacity 0.2s ease;
}

.header__logo:hover {
  opacity: 0.8;
}

.header__logo-text {
  letter-spacing: 0.05em;
}

.header__nav {
  display: none;
}

@media (min-width: 835px) {
  .header__nav {
    display: block;
  }
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-end;
}

@media (max-width: 834px) {
  .header__actions {
    gap: 0.25rem;
  }
}

.header__theme-toggle,
.header__menu-toggle {
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
  color: var(--text-primary);
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.header__theme-toggle:hover,
.header__menu-toggle:hover {
  background-color: var(--bg-secondary, rgba(0, 0, 0, 0.05));
}

.header__theme-toggle:focus-visible,
.header__menu-toggle:focus-visible {
  outline: 2px solid var(--color-primary-600, #7F56D9);
  outline-offset: 2px;
}

.header__icon {
  width: 24px;
  height: 24px;
}

.header__menu-toggle {
  display: none;
}

@media (max-width: 834px) {
  .header__menu-toggle {
    display: flex;
  }
  
  .header__theme-toggle,
  .header__menu-toggle {
    width: 40px;
    height: 40px;
    padding: 0.5rem;
  }
  
  .header__icon {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 390px) {
  .header__container {
    padding: 0.75rem 0.875rem;
    gap: 0.5rem;
  }

  .header__logo {
    font-size: 1rem;
  }
  
  .header__actions {
    gap: 0;
  }
}

/* Mobile Menu */
.mobile-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 834px) {
  .mobile-menu {
    display: block;
  }
}

.mobile-menu__nav {
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
  padding: 0.875rem 1.5rem;
  color: var(--text-primary);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.mobile-menu__link:hover {
  background-color: var(--bg-secondary, rgba(0, 0, 0, 0.05));
  color: var(--color-primary-600, #7F56D9);
}

.mobile-menu__link.router-link-active {
  color: var(--color-primary-600, #7F56D9);
  background-color: var(--bg-secondary, rgba(127, 86, 217, 0.1));
}

/* Mobile Menu Transitions */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Auth Buttons */
.header__auth-buttons {
  display: none;
  align-items: center;
  gap: 0.75rem;
  margin-right: 0.5rem;
}

@media (min-width: 835px) {
  .header__auth-buttons {
    display: flex;
  }
}

.header__auth-link {
  padding: 0.5rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
}

.header__auth-link:hover {
  background-color: var(--bg-secondary, rgba(0, 0, 0, 0.05));
}

.header__auth-button {
  padding: 0.5rem 1rem;
  color: white;
  background-color: var(--color-primary-600, #7F56D9);
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
}

.header__auth-button:hover {
  background-color: var(--color-primary-700, #6941C6);
}

/* User Menu */
.header__user-menu {
  display: none;
  position: relative;
  margin-right: 0.5rem;
}

@media (min-width: 835px) {
  .header__user-menu {
    display: block;
  }
}

.header__user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  border-radius: 0.5rem;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.header__user-button:hover {
  background-color: var(--bg-secondary, rgba(0, 0, 0, 0.05));
  border-color: var(--color-primary-600, #7F56D9);
}

.header__user-button:focus-visible {
  outline: 2px solid var(--color-primary-600, #7F56D9);
  outline-offset: 2px;
}

.header__user-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header__user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 180px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 1000;
}

.header__dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: var(--text-primary);
  text-align: left;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.header__dropdown-item:hover {
  background-color: var(--bg-secondary, rgba(0, 0, 0, 0.05));
}

.header__dropdown-item--danger {
  color: #DC2626;
}

.header__dropdown-item--danger:hover {
  background-color: rgba(220, 38, 38, 0.1);
}

.header__dropdown-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

/* User Menu Transitions */
.user-menu-enter-active,
.user-menu-leave-active {
  transition: all 0.2s ease;
}

.user-menu-enter-from,
.user-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Mobile Menu Additions */
.mobile-menu__divider {
  height: 1px;
  margin: 0.5rem 1.5rem;
  background-color: var(--border-color, rgba(0, 0, 0, 0.1));
}

.mobile-menu__icon {
  width: 20px;
  height: 20px;
  margin-right: 0.5rem;
  stroke-width: 2;
}

.mobile-menu__link {
  display: flex;
  align-items: center;
}

.mobile-menu__link--primary {
  color: var(--color-primary-600, #7F56D9);
  font-weight: 600;
}

.mobile-menu__link--danger {
  color: #DC2626;
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
}

.mobile-menu__link--danger:hover {
  background-color: rgba(220, 38, 38, 0.1);
}

/* Dark theme support */
[data-theme='dark'] .header--fixed {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

[data-theme='dark'] .mobile-menu {
  border-bottom-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

[data-theme='dark'] .mobile-menu__link:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

[data-theme='dark'] .mobile-menu__link.router-link-active {
  background-color: rgba(127, 86, 217, 0.2);
}

[data-theme='dark'] .mobile-menu__divider {
  background-color: rgba(255, 255, 255, 0.1);
}

[data-theme='dark'] .header__auth-link:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

[data-theme='dark'] .header__user-button {
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme='dark'] .header__user-button:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

[data-theme='dark'] .header__user-dropdown {
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

[data-theme='dark'] .header__dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
