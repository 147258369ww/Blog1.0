<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled } from '@element-plus/icons-vue'

const route = useRoute()

// 生成面包屑数据
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  const breadcrumbList = matched.map(item => ({
    title: item.meta.title as string,
    path: item.path,
  }))

  // 如果不是首页，添加首页链接
  if (route.path !== '/dashboard') {
    breadcrumbList.unshift({
      title: '首页',
      path: '/dashboard',
    })
  }

  return breadcrumbList
})
</script>

<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbs"
      :key="item.path"
      :to="index < breadcrumbs.length - 1 ? item.path : undefined"
    >
      <el-icon v-if="index === 0"><HomeFilled /></el-icon>
      <span>{{ item.title }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

:deep(.el-breadcrumb__item) {
  .el-breadcrumb__inner {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: $text-regular;
    font-weight: normal;

    &:hover {
      color: $primary-color;
    }
  }

  &:last-child .el-breadcrumb__inner {
    color: $text-primary;
    font-weight: 500;
  }
}
</style>
