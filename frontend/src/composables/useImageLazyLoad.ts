import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * 图片懒加载组合式函数
 * 使用 IntersectionObserver 实现图片懒加载
 * 
 * @param imageRef - 图片元素的引用
 * @returns 加载状态和错误状态
 */
export function useImageLazyLoad(imageRef: Ref<HTMLImageElement | null>) {
  const isLoaded = ref(false)
  const hasError = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!imageRef.value) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const src = img.dataset.src

            if (src) {
              img.src = src
              img.onload = () => {
                isLoaded.value = true
              }
              img.onerror = () => {
                hasError.value = true
              }
            }

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

  return { isLoaded, hasError }
}
