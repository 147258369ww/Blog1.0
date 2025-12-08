<script setup lang="ts">
import { useRoute } from 'vue-router'
import { House, Document, Folder, Setting } from '@element-plus/icons-vue'

interface Props {
  collapsed: boolean
  mobileVisible: boolean
  isMobile: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const route = useRoute()

// 菜单配置
const menuItems = [
  {
    title: '仪表盘',
    icon: House,
    path: '/dashboard',
  },
  {
    title: '内容管理',
    icon: Document,
    children: [
      { title: '文章列表', path: '/articles' },
      { title: '分类管理', path: '/categories' },
      { title: '标签管理', path: '/tags' },
    ],
  },
  {
    title: '资源管理',
    icon: Folder,
    children: [
      { title: '文件管理', path: '/files' },
      { title: '友情链接', path: '/links' },
    ],
  },
  {
    title: '系统设置',
    icon: Setting,
    children: [
      { title: '系统配置', path: '/config' },
      { title: '日志管理', path: '/logs' },
    ],
  },
]

// 判断菜单项是否激活
const isMenuActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

// 处理菜单点击
const handleMenuClick = () => {
  if (props.isMobile) {
    emit('close')
  }
}
</script>

<template>
  <aside
    class="app-sidebar"
    :class="{
      'app-sidebar--collapsed': collapsed && !isMobile,
      'app-sidebar--mobile': isMobile,
      'app-sidebar--mobile-visible': isMobile && mobileVisible,
    }"
  >
    <!-- Logo 区域 -->
    <div class="sidebar-logo">
      <transition name="fade">
        <span v-if="!collapsed || isMobile" class="logo-text">博客管理系统</span>
        <span v-else class="logo-text-short">博客</span>
      </transition>
    </div>

    <!-- 菜单区域 -->
    <el-scrollbar class="sidebar-menu-wrapper">
      <el-menu
        :default-active="route.path"
        :collapse="collapsed && !isMobile"
        :unique-opened="true"
        router
      >
        <template v-for="item in menuItems" :key="item.title">
          <!-- 单级菜单 -->
          <el-menu-item
            v-if="!item.children"
            :index="item.path"
            :class="{ 'is-active': isMenuActive(item.path!) }"
            @click="handleMenuClick"
          >
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>

          <!-- 多级菜单 -->
          <el-sub-menu v-else :index="item.title">
            <template #title>
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="child.path"
              :class="{ 'is-active': isMenuActive(child.path) }"
              @click="handleMenuClick"
            >
              {{ child.title }}
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-scrollbar>
  </aside>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.app-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: $sidebar-width;
  background-color: #ffffff;
  border-right: 1px solid $border-light;
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;

  &--collapsed {
    width: $sidebar-collapsed-width;
  }

  &--mobile {
    transform: translateX(-100%);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  }

  &--mobile-visible {
    transform: translateX(0);
  }
}

.sidebar-logo {
  @include flex-center;
  height: $header-height;
  padding: 0 $spacing-lg;
  border-bottom: 1px solid $border-light;
  font-size: $font-size-xl;
  font-weight: 600;
  color: $primary-color;
  white-space: nowrap;
  overflow: hidden;

  .logo-text,
  .logo-text-short {
    transition: opacity 0.3s;
  }
}

.sidebar-menu-wrapper {
  flex: 1;
  overflow-y: auto;

  :deep(.el-menu) {
    border-right: none;
  }

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    height: 50px;
    line-height: 50px;
    min-height: $touch-target-min-size;

    &:hover {
      background-color: rgba($primary-color, 0.1);
    }

    &.is-active {
      color: $primary-color;
      background-color: rgba($primary-color, 0.1);
    }
  }

  // 移动端增大触摸目标
  @include mobile {
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      height: 56px;
      line-height: 56px;
      font-size: $font-size-lg;
    }
  }

  :deep(.el-sub-menu .el-menu-item) {
    min-width: auto;
    padding-left: 50px !important;

    &:hover {
      background-color: rgba($primary-color, 0.05);
    }

    &.is-active {
      color: $primary-color;
      background-color: rgba($primary-color, 0.1);
    }
  }
}
</style>
