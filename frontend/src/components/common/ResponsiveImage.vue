<template>
  <picture class="responsive-image">
    <!-- Mobile -->
    <source 
      v-if="!disableLazyLoad"
      :data-srcset="getSrcset(390)"
      media="(max-width: 390px)"
    >
    <source 
      v-else
      :srcset="getSrcset(390)"
      media="(max-width: 390px)"
    >
    
    <!-- Tablet -->
    <source 
      v-if="!disableLazyLoad"
      :data-srcset="getSrcset(834)"
      media="(max-width: 834px)"
    >
    <source 
      v-else
      :srcset="getSrcset(834)"
      media="(max-width: 834px)"
    >
    
    <!-- Desktop -->
    <source 
      v-if="!disableLazyLoad"
      :data-srcset="getSrcset(1440)"
      media="(max-width: 1440px)"
    >
    <source 
      v-else
      :srcset="getSrcset(1440)"
      media="(max-width: 1440px)"
    >
    
    <!-- Default image -->
    <img
      ref="imageRef"
      :data-src="disableLazyLoad ? undefined : src"
      :src="disableLazyLoad ? src : placeholderSrc"
      :alt="alt"
      :class="imageClasses"
      @error="handleError"
      :loading="disableLazyLoad ? 'eager' : 'lazy'"
    >
    
    <!-- Loading placeholder -->
    <div v-if="!isLoaded && !hasError && !disableLazyLoad" class="responsive-image__placeholder">
      <div class="responsive-image__skeleton"></div>
    </div>
    
    <!-- Error state -->
    <div v-if="hasError" class="responsive-image__error">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" stroke="currentColor" stroke-width="2"/>
        <path d="M24 16V26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M24 32H24.02" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span>Failed to load image</span>
    </div>
  </picture>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  src: string
  alt: string
  placeholderSrc?: string
  disableLazyLoad?: boolean
  aspectRatio?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholderSrc: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E',
  disableLazyLoad: false,
  aspectRatio: '16/9'
})

const imageRef = ref<HTMLImageElement | null>(null)
const isLoaded = ref(false)
const hasError = ref(false)
const retryCount = ref(0)
const MAX_RETRY = 5
const isRetrying = ref(false)
let observer: IntersectionObserver | null = null

const imageClasses = computed(() => [
  'responsive-image__img',
  {
    'responsive-image__img--loaded': isLoaded.value,
    'responsive-image__img--error': hasError.value
  }
])

const getSrcset = (width: number) => {
  // If src already has query params, append with &, otherwise use ?
  const separator = props.src.includes('?') ? '&' : '?'
  return `${props.src}${separator}w=${width}`
}

const handleError = () => {
  // 如果已经在重试中或已经显示错误，不再处理
  if (isRetrying.value || hasError.value) {
    return
  }
  
  retryCount.value++
  
  if (retryCount.value < MAX_RETRY) {
    // 重试加载
    isRetrying.value = true
    setTimeout(() => {
      if (imageRef.value) {
        const baseSrc = imageRef.value.src.split('?')[0]
        imageRef.value.src = baseSrc + '?retry=' + retryCount.value
      }
      isRetrying.value = false
    }, 1000 * retryCount.value) // 递增延迟
  } else {
    // 超过重试次数，显示错误状态
    hasError.value = true
    isLoaded.value = false
  }
}

const loadImage = () => {
  if (!imageRef.value || props.disableLazyLoad) return

  const img = imageRef.value
  const src = img.dataset.src

  if (src) {
    // Load all source elements
    const sources = img.parentElement?.querySelectorAll('source[data-srcset]')
    sources?.forEach(source => {
      const srcset = source.getAttribute('data-srcset')
      if (srcset) {
        source.setAttribute('srcset', srcset)
        source.removeAttribute('data-srcset')
      }
    })

    // Load main image
    img.src = src
    img.onload = () => {
      isLoaded.value = true
    }
    img.onerror = () => {
      handleError()
    }
  }
}

onMounted(() => {
  if (props.disableLazyLoad) {
    isLoaded.value = true
    return
  }

  if (!imageRef.value) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadImage()
          observer?.unobserve(entry.target)
        }
      })
    },
    {
      rootMargin: '50px'
    }
  )

  observer.observe(imageRef.value)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.responsive-image {
  position: relative;
  display: block;
  width: 100%;
  overflow: hidden;
  background-color: var(--color-gray-50, #F9FAFB);
}

.responsive-image__img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.responsive-image__img--loaded {
  opacity: 1;
}

.responsive-image__img--error {
  display: none;
}

.responsive-image__placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.responsive-image__skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-gray-50, #F9FAFB) 25%,
    var(--color-gray-300, #D0D5DD) 50%,
    var(--color-gray-50, #F9FAFB) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.responsive-image__error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background-color: var(--color-gray-50, #F9FAFB);
  color: var(--text-secondary, #667085);
}

.responsive-image__error svg {
  width: 48px;
  height: 48px;
  color: var(--color-gray-300, #D0D5DD);
}

.responsive-image__error span {
  font-size: 14px;
  font-weight: 500;
}

/* Dark theme */
[data-theme="dark"] .responsive-image {
  background-color: var(--bg-secondary, #121212);
}

[data-theme="dark"] .responsive-image__skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200% 100%;
}

[data-theme="dark"] .responsive-image__error {
  background-color: var(--bg-secondary, #121212);
  color: var(--text-secondary, #C0C5D0);
}

[data-theme="dark"] .responsive-image__error svg {
  color: rgba(255, 255, 255, 0.2);
}

/* Aspect ratio support */
.responsive-image {
  aspect-ratio: v-bind(aspectRatio);
}

@supports not (aspect-ratio: 16/9) {
  .responsive-image::before {
    content: '';
    display: block;
    padding-top: 56.25%; /* 16:9 fallback */
  }
  
  .responsive-image__img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
