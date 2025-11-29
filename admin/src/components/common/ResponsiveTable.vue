<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  data: any[]
  loading?: boolean
  mobileCardView?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  mobileCardView: true,
})

// 检测是否为移动设备
const isMobile = computed(() => {
  return window.innerWidth < 768
})

// 是否使用卡片视图
const useCardView = computed(() => {
  return isMobile.value && props.mobileCardView
})
</script>

<template>
  <div class="responsive-table">
    <!-- 桌面/平板: 表格视图 -->
    <div v-if="!useCardView" class="table-view">
      <slot name="table" :data="data" :loading="loading" />
    </div>

    <!-- 移动端: 卡片视图 -->
    <div v-else class="card-view">
      <slot name="mobile-card" :data="data" :loading="loading">
        <!-- 默认卡片视图 -->
        <div v-if="loading" class="card-loading">
          <el-skeleton :rows="3" animated />
        </div>
        <div v-else-if="data.length === 0" class="card-empty">
          <el-empty description="暂无数据" />
        </div>
        <div v-else class="card-list">
          <div v-for="(item, index) in data" :key="index" class="card-item">
            <slot name="card-item" :item="item" :index="index">
              <!-- 默认卡片内容 -->
              <div class="card-content">
                {{ item }}
              </div>
            </slot>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.responsive-table {
  width: 100%;
}

.table-view {
  width: 100%;
  overflow-x: auto;

  @include mobile {
    @include scrollbar;
  }
}

.card-view {
  width: 100%;
}

.card-loading,
.card-empty {
  padding: $spacing-xl;
  background-color: #ffffff;
  border-radius: $border-radius-lg;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.card-item {
  @include card-view;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }
}

.card-content {
  width: 100%;
}
</style>
