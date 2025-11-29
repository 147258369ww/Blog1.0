/**
 * Vite 插件：在 HTML 中注入环境变量
 */
import type { Plugin } from 'vite'

export function htmlEnvPlugin(): Plugin {
  return {
    name: 'html-env-plugin',
    transformIndexHtml(html, ctx) {
      // 获取环境变量
      const apiBaseUrl = ctx.server?.config.env.VITE_API_BASE_URL || ''

      // 提取 API 的域名用于预连接
      let apiDomain = ''
      try {
        const url = new URL(apiBaseUrl)
        apiDomain = `${url.protocol}//${url.host}`
      } catch {
        apiDomain = apiBaseUrl
      }

      // 替换 HTML 中的环境变量占位符
      return html.replace('%VITE_API_BASE_URL%', apiDomain)
    },
  }
}
