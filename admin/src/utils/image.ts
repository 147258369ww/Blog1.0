/**
 * 图片URL处理工具
 * 使用统一的 URL 处理服务
 */
import { getFullUrl, getFullUrls } from './url'

/**
 * 获取完整的图片URL
 * @param url 图片URL（可能是相对路径或完整URL）
 * @returns 完整的图片URL
 * @deprecated 请使用 getFullUrl 代替
 */
export function getFullImageUrl(url: string | undefined | null): string {
  return getFullUrl(url)
}

/**
 * 批量转换图片URL
 * @param urls 图片URL数组
 * @returns 完整的图片URL数组
 * @deprecated 请使用 getFullUrls 代替
 */
export function getFullImageUrls(urls: (string | undefined | null)[]): string[] {
  return getFullUrls(urls)
}

// 导出统一的 URL 处理函数
export { getFullUrl, getFullUrls }
