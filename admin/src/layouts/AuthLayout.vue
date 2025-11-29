<script setup lang="ts">
// 认证页面布局 - 用于登录页面
</script>

<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.auth-layout {
  @include flex-center;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: $spacing-lg;

  @include mobile {
    padding: $spacing-md;
  }
}

.auth-container {
  width: 100%;
  max-width: 1000px;
  background-color: #ffffff;
  border-radius: $border-radius-lg;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  @include mobile {
    max-width: 100%;
    border-radius: $border-radius-base;
  }
}

.auth-content {
  width: 100%;
  padding: $spacing-xl;

  @include mobile {
    padding: $spacing-lg;
  }
}
</style>
