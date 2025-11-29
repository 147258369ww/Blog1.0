<template>
  <el-card class="skeleton-card" :body-style="{ padding: '20px' }">
    <el-skeleton :rows="rows" animated :loading="true" />
  </el-card>
</template>

<script setup lang="ts">
/**
 * 骨架屏卡片组件
 * 用于数据加载时的占位显示
 */

interface Props {
  rows?: number
}

withDefaults(defineProps<Props>(), {
  rows: 3,
})
</script>

<style scoped lang="scss">
.skeleton-card {
  margin-bottom: 16px;
}
</style>
