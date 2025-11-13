/**
 * 图片处理工具函数
 */
import { getFullUrl } from './url'

// 默认占位图
export const DEFAULT_PLACEHOLDER = '/images/placeholder.svg'
export const DEFAULT_AVATAR = '/images/avatar-default.svg'
export const DEFAULT_COVER = '/images/cover-default.svg'

/**
 * 获取图片 URL，如果为空则返回占位图
 */
export function getImageUrl(url?: string, fallback = DEFAULT_PLACEHOLDER): string {
  if (!url) return fallback
  return getFullUrl(url)
}

/**
 * 处理图片加载错误
 */
export function handleImageError(event: Event, fallback = DEFAULT_PLACEHOLDER) {
  const img = event.target as HTMLImageElement
  if (img.src !== fallback) {
    img.src = fallback
  }
}

/**
 * 获取响应式图片 URL
 */
export function getResponsiveImageUrl(
  url: string,
  width: number,
  quality = 80
): string {
  if (!url) return DEFAULT_PLACEHOLDER
  
  // 如果是外部 URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // 添加图片处理参数（假设后端支持）
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}w=${width}&q=${quality}`
}

/**
 * 预加载图片
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = url
  })
}

/**
 * 批量预加载图片
 */
export async function preloadImages(urls: string[]): Promise<void> {
  await Promise.all(urls.map(url => preloadImage(url)))
}

/**
 * 获取图片尺寸
 */
export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = reject
    img.src = url
  })
}

/**
 * 压缩图片（客户端）
 */
export function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        // 计算缩放比例
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('无法获取 canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('图片压缩失败'))
            }
          },
          file.type,
          quality
        )
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 验证图片文件
 */
export function validateImageFile(
  file: File,
  options: {
    maxSize?: number // 最大文件大小（字节）
    allowedTypes?: string[] // 允许的文件类型
  } = {}
): { valid: boolean; error?: string } {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] } = options

  // 检查文件类型
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `不支持的文件类型。允许的类型: ${allowedTypes.join(', ')}`
    }
  }

  // 检查文件大小
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2)
    return {
      valid: false,
      error: `文件大小超过限制。最大允许: ${maxSizeMB}MB`
    }
  }

  return { valid: true }
}

/**
 * 生成缩略图 URL
 */
export function getThumbnailUrl(url: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
  const sizes = {
    small: 200,
    medium: 400,
    large: 800
  }
  
  return getResponsiveImageUrl(url, sizes[size])
}
