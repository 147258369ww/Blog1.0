/**
 * 图片懒加载 Composable
 * 提供图片懒加载功能，优化首屏加载性能
 */
import { ref, onMounted, onUnmounted, type Ref } from 'vue'

interface UseLazyImageOptions {
  /**
   * 占位图 URL
   */
  placeholder?: string
  /**
   * 根元素边距（用于提前加载）
   */
  rootMargin?: string
  /**
   * 可见度阈值
   */
  threshold?: number
}

/**
 * 图片懒加载 Hook
 * @param src 图片源地址
 * @param options 配置选项
 * @returns 当前显示的图片 URL 和加载状态
 */
export function useLazyImage(src: Ref<string> | string, options: UseLazyImageOptions = {}) {
  const {
    placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E',
    rootMargin = '50px',
    threshold = 0.01,
  } = options

  const imageSrc = ref(placeholder)
  const isLoading = ref(true)
  const isError = ref(false)
  const imgRef = ref<HTMLImageElement | null>(null)

  let observer: IntersectionObserver | null = null

  const loadImage = () => {
    const actualSrc = typeof src === 'string' ? src : src.value
    if (!actualSrc) return

    const img = new Image()
    img.onload = () => {
      imageSrc.value = actualSrc
      isLoading.value = false
    }
    img.onerror = () => {
      isError.value = true
      isLoading.value = false
    }
    img.src = actualSrc
  }

  onMounted(() => {
    if (!imgRef.value) return

    // 检查浏览器是否支持 IntersectionObserver
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              loadImage()
              if (observer && imgRef.value) {
                observer.unobserve(imgRef.value)
              }
            }
          })
        },
        {
          rootMargin,
          threshold,
        }
      )

      observer.observe(imgRef.value)
    } else {
      // 不支持 IntersectionObserver，直接加载
      loadImage()
    }
  })

  onUnmounted(() => {
    if (observer && imgRef.value) {
      observer.unobserve(imgRef.value)
      observer.disconnect()
    }
  })

  return {
    imgRef,
    imageSrc,
    isLoading,
    isError,
  }
}

/**
 * 检查浏览器是否支持 WebP 格式
 * @returns 是否支持 WebP
 */
export function checkWebPSupport(): Promise<boolean> {
  return new Promise(resolve => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}

/**
 * 将图片 URL 转换为 WebP 格式（如果支持）
 * @param url 原始图片 URL
 * @param supportsWebP 是否支持 WebP
 * @returns 转换后的 URL
 */
export function convertToWebP(url: string, supportsWebP: boolean): string {
  if (!supportsWebP || !url) return url

  // 如果 URL 已经是 WebP 格式，直接返回
  if (url.endsWith('.webp')) return url

  // 如果是外部 CDN 或支持格式转换的服务，可以添加参数
  // 例如：阿里云 OSS、七牛云等
  // 这里提供一个通用的示例
  const urlObj = new URL(url, window.location.origin)

  // 检查是否是图片文件
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  const hasImageExtension = imageExtensions.some(ext => urlObj.pathname.toLowerCase().endsWith(ext))

  if (hasImageExtension) {
    // 如果使用 CDN，可以添加格式转换参数
    // 例如：url + '?x-oss-process=image/format,webp'
    // 这里返回原始 URL，实际使用时根据 CDN 服务调整
    return url
  }

  return url
}
