<template>
  <div class="skeleton-list">
    <div v-for="item in count" :key="item" class="skeleton-list-item">
      <el-skeleton animated :loading="true">
        <template #template>
          <div class="skeleton-list-item-content">
            <!-- 左侧图片 -->
            <el-skeleton-item v-if="showImage" variant="image" class="skeleton-image" />

            <!-- 右侧内容 -->
            <div class="skeleton-text">
              <el-skeleton-item variant="h3" style="width: 60%" />
              <el-skeleton-item variant="text" style="width: 100%" />
              <el-skeleton-item variant="text" style="width: 80%" />
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 骨架屏列表组件
 * 用于列表数据加载时的占位显示
 */

interface Props {
  count?: number
  showImage?: boolean
}

withDefaults(defineProps<Props>(), {
  count: 3,
  showImage: true,
})
</script>

<style scoped lang="scss">
.skeleton-list {
  &-item {
    background: #fff;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    &-content {
      display: flex;
      gap: 16px;
    }
  }
}

.skeleton-image {
  width: 120px;
  height: 80px;
  flex-shrink: 0;
}

.skeleton-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
