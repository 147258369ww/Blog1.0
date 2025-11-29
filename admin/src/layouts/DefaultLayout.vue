<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useResponsive } from '@/composables/useResponsive'
import AppSidebar from '@/components/common/AppSidebar.vue'
import AppHeader from '@/components/common/AppHeader.vue'

// 使用响应式工具
const { isMobile, isTablet, isDesktop } = useResponsive()

// 侧边栏状态
const isSidebarCollapsed = ref(false)
const isMobileSidebarVisible = ref(false)

// 监听设备类型变化
watch([isMobile, isTablet, isDesktop], ([mobile, tablet, desktop]) => {
  // 平板和移动设备默认折叠侧边栏
  if (mobile || tablet) {
    isSidebarCollapsed.value = true
  }

  // 移动端切换到其他设备时隐藏侧边栏
  if (!mobile) {
    isMobileSidebarVisible.value = false
  }

  // 桌面设备恢复保存的折叠状态
  if (desktop) {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
      isSidebarCollapsed.value = savedState === 'true'
    }
  }
})

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  if (isMobile.value) {
    isMobileSidebarVisible.value = !isMobileSidebarVisible.value
  } else {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
    // 保存折叠状态到 localStorage
    localStorage.setItem('sidebarCollapsed', String(isSidebarCollapsed.value))
  }
}

// 关闭移动端侧边栏
const closeMobileSidebar = () => {
  if (isMobile.value) {
    isMobileSidebarVisible.value = false
  }
}

// 初始化
onMounted(() => {
  // 从 localStorage 恢复折叠状态 (仅桌面设备)
  if (isDesktop.value) {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
      isSidebarCollapsed.value = savedState === 'true'
    }
  } else {
    // 非桌面设备默认折叠
    isSidebarCollapsed.value = true
  }
})
</script>

<template>
  <div class="default-layout">
    <!-- 侧边栏 -->
    <AppSidebar
      :collapsed="isSidebarCollapsed"
      :mobile-visible="isMobileSidebarVisible"
      :is-mobile="isMobile"
      @close="closeMobileSidebar"
    />

    <!-- 移动端遮罩层 -->
    <transition name="fade">
      <div
        v-if="isMobile && isMobileSidebarVisible"
        class="mobile-overlay"
        @click="closeMobileSidebar"
      />
    </transition>

    <!-- 主内容区域 -->
    <div
      class="main-container"
      :class="{
        'main-container--collapsed': isSidebarCollapsed && !isMobile,
        'main-container--mobile': isMobile,
      }"
    >
      <!-- 顶部导航栏 -->
      <AppHeader :is-mobile="isMobile" @toggle-sidebar="toggleSidebar" />

      <!-- 内容区域 -->
      <main class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.default-layout {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: calc(100% - #{$sidebar-width});
  height: 100%;
  margin-left: $sidebar-width;
  transition: all 0.3s ease;
  overflow: hidden;

  &--collapsed {
    width: calc(100% - #{$sidebar-collapsed-width});
    margin-left: $sidebar-collapsed-width;
  }

  &--mobile {
    width: 100%;
    margin-left: 0;
  }
}

.content-wrapper {
  flex: 1;
  padding: $spacing-lg;
  overflow-y: auto;
  background-color: $background-base;

  @include mobile {
    padding: $spacing-md;
  }
}
</style>
