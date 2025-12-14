import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * 图片懒加载配置选项
 */
interface ImageLazyLoadOptions {
  placeholder?: string
  srcset?: string
  retryCount?: number
  retryDelay?: number
}

/**
 * 图片懒加载组合式函数
 * 使用 IntersectionObserver 实现图片懒加载
 * 
 * @param imageRef - 图片元素的引用
 * @param options - 配置选项
 * @returns 加载状态、错误状态和重试次数
 */
export function useImageLazyLoad(
  imageRef: Ref<HTMLImageElement | null>,
  options: ImageLazyLoadOptions = {}
) {
  const { 
    placeholder, 
    srcset, 
    retryCount = 3, 
    retryDelay = 1000 
  } = options
  
  const isLoaded = ref(false)
  const hasError = ref(false)
  const currentRetry = ref(0)
  let observer: IntersectionObserver | null = null

  const loadImage = (img: HTMLImageElement) => {
    const src = img.dataset.src
    const dataSrcset = img.dataset.srcset || srcset

    if (!src) return

    // 设置占位图
    if (placeholder && !img.src) {
      img.src = placeholder
    }

    // 设置 srcset（响应式图片）
    if (dataSrcset) {
      img.srcset = dataSrcset
    }

    // 加载图片
    img.src = src

    img.onload = () => {
      isLoaded.value = true
      currentRetry.value = 0
    }

    img.onerror = () => {
      if (currentRetry.value < retryCount) {
        currentRetry.value++
        // 指数退避重试
        setTimeout(() => loadImage(img), retryDelay * currentRetry.value)
      } else {
        hasError.value = true
      }
    }
  }

  onMounted(() => {
    if (!imageRef.value) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            loadImage(img)
            observer?.unobserve(img)
          }
        })
      },
      {
        rootMargin: '50px', // 提前 50px 开始加载
        threshold: 0.01,
      }
    )

    observer.observe(imageRef.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { isLoaded, hasError, currentRetry }
}
