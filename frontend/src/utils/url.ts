/**
 * 统一的 URL 处理服务
 * 由于后端已返回完整 URL，前端只需做兜底处理
 */
export class UrlService {
  /**
   * 获取完整的资源 URL
   * 后端应该返回完整 URL，这里只做兜底处理
   */
  static getFullUrl(url: string | undefined | null): string {
    if (!url) return ''
    
    // 后端返回的完整 URL，直接使用
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    // 兜底：如果后端返回相对路径，前端拼接
    // 这种情况理论上不应该发生，但作为容错处理
    console.warn('收到相对路径，建议后端返回完整 URL:', url)
    const baseUrl = this.getStaticBaseUrl()
    return baseUrl ? `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}` : url
  }
  
  /**
   * 获取静态资源基础 URL（仅用于兜底）
   */
  private static getStaticBaseUrl(): string {
    return import.meta.env.VITE_STATIC_BASE_URL 
      || import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v\d+$/, '') 
      || ''
  }
  
  /**
   * 批量转换 URL
   */
  static getFullUrls(urls: (string | undefined | null)[]): string[] {
    return urls.map(url => this.getFullUrl(url)).filter(url => url !== '')
  }
}

// 便捷函数
export const getFullUrl = UrlService.getFullUrl.bind(UrlService)
export const getFullUrls = UrlService.getFullUrls.bind(UrlService)
