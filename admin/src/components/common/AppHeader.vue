<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Expand, Fold, Bell, User, SwitchButton, Search } from '@element-plus/icons-vue'
import AppBreadcrumb from './AppBreadcrumb.vue'

interface Props {
  isMobile: boolean
}

interface Notification {
  id: number
  title: string
  content: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

defineProps<Props>()
const emit = defineEmits<{
  toggleSidebar: []
}>()

const router = useRouter()
const authStore = useAuthStore()

// 用户信息
const userInfo = computed(() => authStore.user)

// 搜索相关
const searchVisible = ref(false)
const searchKeyword = ref('')
const searchInputRef = ref<HTMLInputElement>()

// 通知相关
const notifications = ref<Notification[]>([
  // 模拟通知数据
  {
    id: 1,
    title: '系统通知',
    content: '欢迎使用博客后台管理系统',
    type: 'info',
    read: false,
    createdAt: new Date().toISOString(),
  },
])

// 未读通知数量
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

// 处理退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    authStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 用户取消
  }
}

// 切换侧边栏
const toggleSidebar = () => {
  emit('toggleSidebar')
}

// 显示搜索框
const showSearch = () => {
  searchVisible.value = true
  // 等待 DOM 更新后聚焦输入框
  setTimeout(() => {
    searchInputRef.value?.focus()
  }, 100)
}

// 隐藏搜索框
const hideSearch = () => {
  searchVisible.value = false
  searchKeyword.value = ''
}

// 执行搜索
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    return
  }

  // 跳转到文章列表页面并传递搜索关键词
  router.push({
    path: '/articles',
    query: { search: searchKeyword.value },
  })

  hideSearch()
  ElMessage.success(`搜索: ${searchKeyword.value}`)
}

// 标记通知为已读
const markAsRead = (notification: Notification) => {
  notification.read = true
}

// 标记所有通知为已读
const markAllAsRead = () => {
  notifications.value.forEach(n => {
    n.read = true
  })
  ElMessage.success('已标记所有通知为已读')
}

// 清空所有通知
const clearAllNotifications = () => {
  notifications.value = []
  ElMessage.success('已清空所有通知')
}

// 处理通知点击
const handleNotificationClick = (notification: Notification) => {
  markAsRead(notification)
  // 可以根据通知类型跳转到相应页面
  ElMessage.info(`查看通知: ${notification.title}`)
}

// 键盘快捷键处理
const handleKeydown = (event: KeyboardEvent) => {
  // 按下 / 键显示搜索框
  if (event.key === '/' && !searchVisible.value) {
    // 如果焦点在输入框中，不触发快捷键
    const activeElement = document.activeElement
    if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') {
      return
    }

    event.preventDefault()
    showSearch()
  }

  // 按下 ESC 键隐藏搜索框
  if (event.key === 'Escape' && searchVisible.value) {
    hideSearch()
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <!-- 折叠按钮 -->
      <el-button
        class="toggle-button"
        :icon="isMobile ? Expand : Fold"
        text
        @click="toggleSidebar"
      />

      <!-- 面包屑导航 (桌面端显示) -->
      <AppBreadcrumb v-if="!isMobile" class="breadcrumb" />
    </div>

    <div class="header-right">
      <!-- 全局搜索框 -->
      <div v-if="!isMobile" class="search-wrapper">
        <el-button
          v-if="!searchVisible"
          :icon="Search"
          text
          class="search-trigger"
          @click="showSearch"
        >
          <span class="search-hint">搜索 /</span>
        </el-button>
        <transition name="search-expand">
          <div v-if="searchVisible" class="search-input-wrapper">
            <el-input
              ref="searchInputRef"
              v-model="searchKeyword"
              placeholder="搜索文章..."
              :prefix-icon="Search"
              clearable
              @keyup.enter="handleSearch"
              @blur="hideSearch"
            />
          </div>
        </transition>
      </div>

      <!-- 通知图标和下拉菜单 -->
      <el-dropdown trigger="click" placement="bottom-end">
        <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
          <el-button :icon="Bell" circle text />
        </el-badge>
        <template #dropdown>
          <el-dropdown-menu class="notification-dropdown">
            <div class="notification-header">
              <span class="notification-title">通知中心</span>
              <el-button v-if="notifications.length > 0" text size="small" @click="markAllAsRead">
                全部已读
              </el-button>
            </div>
            <el-scrollbar max-height="300px">
              <div v-if="notifications.length === 0" class="notification-empty">
                <el-empty description="暂无通知" :image-size="80" />
              </div>
              <div v-else class="notification-list">
                <div
                  v-for="notification in notifications"
                  :key="notification.id"
                  class="notification-item"
                  :class="{ 'notification-item--unread': !notification.read }"
                  @click="handleNotificationClick(notification)"
                >
                  <div class="notification-item-header">
                    <span class="notification-item-title">{{ notification.title }}</span>
                    <el-tag v-if="!notification.read" size="small" type="danger" effect="dark">
                      未读
                    </el-tag>
                  </div>
                  <div class="notification-item-content">
                    {{ notification.content }}
                  </div>
                  <div class="notification-item-time">
                    {{ new Date(notification.createdAt).toLocaleString() }}
                  </div>
                </div>
              </div>
            </el-scrollbar>
            <div v-if="notifications.length > 0" class="notification-footer">
              <el-button text size="small" @click="clearAllNotifications"> 清空通知 </el-button>
            </div>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 用户下拉菜单 -->
      <el-dropdown trigger="click" @command="handleLogout">
        <div class="user-info">
          <el-avatar :size="32" :icon="User" />
          <span v-if="!isMobile" class="username">{{ userInfo?.username || '管理员' }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item disabled>
              <el-icon><User /></el-icon>
              <span>{{ userInfo?.email || 'admin@example.com' }}</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.app-header {
  @include flex-between;
  height: $header-height;
  padding: 0 $spacing-lg;
  background-color: #ffffff;
  border-bottom: 1px solid $border-light;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

  @include mobile {
    padding: 0 $spacing-md;
  }
}

.header-left {
  @include flex-start;
  gap: $spacing-md;
  flex: 1;
}

.toggle-button {
  font-size: 20px;
  @include touch-target;

  @include mobile {
    font-size: 24px;
  }
}

.breadcrumb {
  flex: 1;
}

.header-right {
  @include flex-start;
  gap: $spacing-md;
}

// 搜索框样式
.search-wrapper {
  position: relative;
}

.search-trigger {
  @include flex-start;
  gap: $spacing-xs;

  .search-hint {
    padding: 2px 6px;
    font-size: 12px;
    color: $text-secondary;
    background-color: $background-base;
    border: 1px solid $border-light;
    border-radius: $border-radius-sm;
  }
}

.search-input-wrapper {
  width: 240px;

  :deep(.el-input__wrapper) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

// 搜索框展开动画
.search-expand-enter-active,
.search-expand-leave-active {
  transition: all 0.3s ease;
}

.search-expand-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.search-expand-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

// 通知样式
.notification-badge {
  :deep(.el-badge__content) {
    top: 8px;
    right: 12px;
  }

  :deep(.el-button) {
    @include touch-target;
  }
}

.notification-dropdown {
  width: 360px;
  padding: 0;

  :deep(.el-dropdown-menu__item) {
    padding: 0;
    height: auto;
    line-height: normal;

    &:hover {
      background-color: transparent;
    }
  }
}

.notification-header {
  @include flex-between;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1px solid $border-light;

  .notification-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $text-primary;
  }
}

.notification-empty {
  padding: $spacing-xl 0;
}

.notification-list {
  .notification-item {
    padding: $spacing-md $spacing-lg;
    cursor: pointer;
    border-bottom: 1px solid $border-lighter;
    transition: background-color 0.3s;

    &:hover {
      background-color: $background-base;
    }

    &--unread {
      background-color: rgba($primary-color, 0.05);
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .notification-item-header {
    @include flex-between;
    margin-bottom: $spacing-xs;

    .notification-item-title {
      font-size: $font-size-base;
      font-weight: 500;
      color: $text-primary;
    }
  }

  .notification-item-content {
    font-size: $font-size-sm;
    color: $text-regular;
    margin-bottom: $spacing-xs;
    line-height: 1.5;
  }

  .notification-item-time {
    font-size: $font-size-xs;
    color: $text-secondary;
  }
}

.notification-footer {
  padding: $spacing-sm $spacing-lg;
  border-top: 1px solid $border-light;
  text-align: center;
}

// 用户信息样式
.user-info {
  @include flex-start;
  gap: $spacing-sm;
  padding: $spacing-xs $spacing-sm;
  cursor: pointer;
  border-radius: $border-radius-base;
  transition: background-color 0.3s;
  @include touch-target;

  &:hover {
    background-color: $background-base;
  }

  .username {
    font-size: $font-size-base;
    color: $text-primary;
  }

  @include mobile {
    padding: $spacing-sm;

    :deep(.el-avatar) {
      width: 36px;
      height: 36px;
    }
  }
}
</style>
