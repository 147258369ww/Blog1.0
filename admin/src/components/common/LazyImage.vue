<template>
  <div ref="imgRef" class="lazy-image" :class="{ 'lazy-image--loading': isLoading }">
    <img
      v-if="!isError"
      :src="imageSrc"
      :alt="alt"
      :class="imageClass"
      :style="imageStyle"
      @load="handleLoad"
      @error="handleError"
    />
    <div v-else class="lazy-image__error">
      <el-icon :size="40"><Picture /></el-icon>
      <span>图片加载失败</span>
    </div>
    <div v-if="isLoading && showLoading" class="lazy-image__loading">
      <el-icon class="is-loading" :size="30"><Loading /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Picture, Loading } from '@element-plus/icons-vue'
import { useLazyImage } from '@/composables/useLazyImage'

interface Props {
  /**
   * 图片源地址
   */
  src: string
  /**
   * 图片 alt 属性
   */
  alt?: string
  /**
   * 占位图 URL
   */
  placeholder?: string
  /**
   * 是否显示加载动画
   */
  showLoading?: boolean
  /**
   * 图片类名
   */
  imageClass?: string
  /**
   * 图片样式
   */
  imageStyle?: Record<string, string>
  /**
   * 根元素边距（用于提前加载）
   */
  rootMargin?: string
  /**
   * 可见度阈值
   */
  threshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  placeholder: undefined,
  showLoading: true,
  imageClass: '',
  imageStyle: () => ({}),
  rootMargin: '50px',
  threshold: 0.01,
})

const emit = defineEmits<{
  load: []
  error: []
}>()

const { imgRef, imageSrc, isLoading, isError } = useLazyImage(
  computed(() => props.src),
  {
    placeholder: props.placeholder,
    rootMargin: props.rootMargin,
    threshold: props.threshold,
  }
)

const handleLoad = () => {
  emit('load')
}

const handleError = () => {
  emit('error')
}
</script>

<style scoped lang="scss">
.lazy-image {
  position: relative;
  display: inline-block;
  overflow: hidden;
  background-color: #f5f7fa;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &--loading {
    img {
      opacity: 0;
      transition: opacity 0.3s;
    }
  }

  &__loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #909399;
  }

  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 100px;
    color: #c0c4cc;
    background-color: #f5f7fa;

    span {
      margin-top: 8px;
      font-size: 12px;
    }
  }
}
</style>
