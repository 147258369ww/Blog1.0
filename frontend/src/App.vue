<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Suspense } from 'vue'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Loading from '@/components/common/Loading.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import NetworkStatus from '@/components/common/NetworkStatus.vue'
import LoadingScreen from '@/components/common/LoadingScreen.vue'

/**
 * 主应用组件
 * 
 * 功能:
 * - 首次加载动画（Dome Gallery）
 * - 使用 Suspense 处理异步路由组件加载
 * - 显示加载状态
 * - 全局错误边界
 * - 网络状态监控
 * - 主题初始化已在 main.ts 中完成
 */
</script>

<template>
  <div id="app">
    <!-- 首次加载屏幕 -->
    <LoadingScreen />
    
    <!-- 网络状态指示器 -->
    <NetworkStatus />
    
    <!-- 全局错误边界 -->
    <ErrorBoundary>
      <Header />
      <main class="main-content">
        <Suspense>
          <!-- 主要内容 -->
          <template #default>
            <RouterView />
          </template>
          
          <!-- 加载状态 -->
          <template #fallback>
            <div class="suspense-loading">
              <Loading />
            </div>
          </template>
        </Suspense>
      </main>
      <Footer />
    </ErrorBoundary>
  </div>
</template>

<style scoped>
#app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.main-content {
  flex: 1;
  width: 100%;
  padding-top: 72px; /* Header 高度 + 一些间距 */
  overflow: visible;
}

@media (max-width: 834px) {
  .main-content {
    padding-top: 64px; /* 移动端 Header 稍小 */
  }
}

@media (max-width: 390px) {
  .main-content {
    padding-top: 60px; /* 小屏幕 Header 更小 */
  }
}

.suspense-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  width: 100%;
}
</style>
