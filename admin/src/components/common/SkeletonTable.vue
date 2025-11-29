<template>
  <div class="skeleton-table">
    <el-skeleton :rows="rows" animated :loading="true">
      <template #template>
        <!-- 表格头部 -->
        <div class="skeleton-table-header">
          <el-skeleton-item
            v-for="col in columns"
            :key="col"
            variant="text"
            style="width: 100%; height: 40px"
          />
        </div>

        <!-- 表格行 -->
        <div v-for="row in rows" :key="row" class="skeleton-table-row">
          <el-skeleton-item
            v-for="col in columns"
            :key="col"
            variant="text"
            style="width: 100%; height: 50px"
          />
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
/**
 * 骨架屏表格组件
 * 用于表格数据加载时的占位显示
 */

interface Props {
  rows?: number
  columns?: number
}

withDefaults(defineProps<Props>(), {
  rows: 5,
  columns: 5,
})
</script>

<style scoped lang="scss">
.skeleton-table {
  width: 100%;
  background: #fff;
  border-radius: 4px;
  padding: 16px;

  &-header {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &-row {
    display: flex;
    gap: 12px;
    margin-bottom: 8px;
    padding: 8px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
