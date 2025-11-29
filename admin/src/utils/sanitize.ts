/**
 * XSS 防护工具
 * 使用 DOMPurify 清理 HTML 内容，防止 XSS 攻击
 */

import DOMPurify from 'dompurify'

/**
 * 清理 HTML 内容
 * 移除潜在的恶意脚本和标签
 *
 * @param html - 原始 HTML 字符串
 * @returns 清理后的安全 HTML 字符串
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      's',
      'del',
      'ins',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'code',
      'pre',
      'blockquote',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'div',
      'span',
    ],
    ALLOWED_ATTR: [
      'href',
      'src',
      'alt',
      'title',
      'class',
      'id',
      'width',
      'height',
      'style',
      'target',
      'rel',
    ],
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
  })
}

/**
 * 清理用户输入的文本
 * 移除所有 HTML 标签，只保留纯文本
 *
 * @param text - 原始文本
 * @returns 清理后的纯文本
 */
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}

/**
 * 清理 URL
 * 确保 URL 是安全的，防止 javascript: 等危险协议
 *
 * @param url - 原始 URL
 * @returns 清理后的安全 URL，如果不安全则返回空字符串
 */
export function sanitizeUrl(url: string): string {
  const cleaned = DOMPurify.sanitize(url, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })

  // 检查是否是安全的协议
  const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:']
  try {
    const urlObj = new URL(cleaned)
    if (safeProtocols.includes(urlObj.protocol)) {
      return cleaned
    }
  } catch {
    // 如果不是有效的 URL，检查是否是相对路径
    if (cleaned.startsWith('/') || cleaned.startsWith('./') || cleaned.startsWith('../')) {
      return cleaned
    }
  }

  return ''
}

/**
 * 转义 HTML 特殊字符
 * 用于在非 HTML 上下文中显示用户输入
 *
 * @param text - 原始文本
 * @returns 转义后的文本
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  return text.replace(/[&<>"'/]/g, char => map[char] || char)
}

/**
 * 反转义 HTML 特殊字符
 *
 * @param text - 转义后的文本
 * @returns 原始文本
 */
export function unescapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
  }
  return text.replace(/&(?:amp|lt|gt|quot|#x27|#x2F);/g, entity => map[entity] || entity)
}
