<template>
  <div class="image-upload-demo">
    <el-card header="图片上传组件测试">
      <el-space direction="vertical" :size="20" style="width: 100%">
        <!-- 单图上传 -->
        <div>
          <h3>单图上传</h3>
          <ImageUpload v-model="singleImage" :multiple="false" :limit="1" />
          <div v-if="singleImage" style="margin-top: 10px">
            <strong>已上传图片 URL:</strong>
            <p>{{ singleImage }}</p>
          </div>
        </div>

        <el-divider />

        <!-- 多图上传 -->
        <div>
          <h3>多图上传（最多3张）</h3>
          <ImageUpload v-model="multipleImages" :multiple="true" :limit="3" />
          <div v-if="multipleImages.length > 0" style="margin-top: 10px">
            <strong>已上传图片 URLs:</strong>
            <ul>
              <li v-for="(url, index) in multipleImages" :key="index">{{ url }}</li>
            </ul>
          </div>
        </div>

        <el-divider />

        <!-- 禁用状态 -->
        <div>
          <h3>禁用状态</h3>
          <ImageUpload v-model="disabledImage" :disabled="true" />
        </div>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ImageUpload from '@/components/upload/ImageUpload.vue'

const singleImage = ref('')
const multipleImages = ref<string[]>([])
const disabledImage = ref('https://via.placeholder.com/300')
</script>

<style scoped lang="scss">
.image-upload-demo {
  padding: 20px;

  h3 {
    margin-bottom: 16px;
    color: var(--el-text-color-primary);
  }

  p,
  li {
    color: var(--el-text-color-regular);
    word-break: break-all;
  }
}
</style>
