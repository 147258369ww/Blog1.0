// SEO Meta 标签管理组合式函数

import { watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import type { SEOConfig } from '@/types'

/**
 * Meta 标签配置接口
 */
export interface MetaConfig {
  title?: string
  description?: string
  keywords?: string | string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
  ogType?: string
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  canonical?: string
  robots?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
}

/**
 * 结构化数据配置接口
 */
export interface StructuredData {
  '@context': string
  '@type': string
  [key: string]: any
}

/**
 * 默认 SEO 配置
 */
const defaultSEOConfig: SEOConfig = {
  defaultTitle: 'THE BLOG',
  defaultDescription: 'A modern blog built with Vue 3 and TypeScript',
  defaultKeywords: ['blog', 'vue', 'typescript'],
  ogImage: '/images/og-default.jpg'
}

/**
 * 设置或更新 meta 标签
 */
function setMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  if (!content) return

  let element = document.querySelector(`meta[${attribute}="${name}"]`)
  
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }
  
  element.setAttribute('content', content)
}

/**
 * 移除 meta 标签
 */
function removeMetaTag(name: string, attribute: 'name' | 'property' = 'name') {
  const element = document.querySelector(`meta[${attribute}="${name}"]`)
  if (element) {
    element.remove()
  }
}

/**
 * 设置 link 标签
 */
function setLinkTag(rel: string, href: string) {
  if (!href) return

  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement
  
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }
  
  element.setAttribute('href', href)
}

/**
 * 设置结构化数据 (JSON-LD)
 */
function setStructuredData(data: StructuredData) {
  // 移除旧的结构化数据
  const oldScript = document.querySelector('script[type="application/ld+json"]')
  if (oldScript) {
    oldScript.remove()
  }

  // 添加新的结构化数据
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

/**
 * 移除结构化数据
 */
function removeStructuredData() {
  const script = document.querySelector('script[type="application/ld+json"]')
  if (script) {
    script.remove()
  }
}

/**
 * 使用 Meta 标签管理
 */
export function useMeta(config?: MetaConfig, seoConfig?: SEOConfig) {
  const route = useRoute()
  const activeSEOConfig = seoConfig || defaultSEOConfig

  /**
   * 更新所有 meta 标签
   */
  const updateMeta = (metaConfig: MetaConfig) => {
    const {
      title,
      description,
      keywords,
      ogTitle,
      ogDescription,
      ogImage,
      ogUrl,
      ogType = 'website',
      twitterCard = 'summary_large_image',
      twitterTitle,
      twitterDescription,
      twitterImage,
      canonical,
      robots,
      author,
      publishedTime,
      modifiedTime
    } = metaConfig

    // 设置页面标题
    const fullTitle = title 
      ? `${title} - ${activeSEOConfig.defaultTitle}`
      : activeSEOConfig.defaultTitle
    document.title = fullTitle

    // 基础 meta 标签
    setMetaTag('description', description || activeSEOConfig.defaultDescription)
    
    const keywordsStr = Array.isArray(keywords) 
      ? keywords.join(', ') 
      : keywords || activeSEOConfig.defaultKeywords.join(', ')
    setMetaTag('keywords', keywordsStr)

    if (author) {
      setMetaTag('author', author)
    }

    if (robots) {
      setMetaTag('robots', robots)
    }

    // Open Graph 标签
    setMetaTag('og:title', ogTitle || title || activeSEOConfig.defaultTitle, 'property')
    setMetaTag('og:description', ogDescription || description || activeSEOConfig.defaultDescription, 'property')
    setMetaTag('og:image', ogImage || activeSEOConfig.ogImage || '', 'property')
    setMetaTag('og:url', ogUrl || window.location.href, 'property')
    setMetaTag('og:type', ogType, 'property')
    setMetaTag('og:site_name', activeSEOConfig.defaultTitle, 'property')

    if (publishedTime) {
      setMetaTag('article:published_time', publishedTime, 'property')
    }

    if (modifiedTime) {
      setMetaTag('article:modified_time', modifiedTime, 'property')
    }

    // Twitter Card 标签
    setMetaTag('twitter:card', twitterCard)
    setMetaTag('twitter:title', twitterTitle || ogTitle || title || activeSEOConfig.defaultTitle)
    setMetaTag('twitter:description', twitterDescription || ogDescription || description || activeSEOConfig.defaultDescription)
    setMetaTag('twitter:image', twitterImage || ogImage || activeSEOConfig.ogImage || '')

    // Canonical URL
    if (canonical) {
      setLinkTag('canonical', canonical)
    } else {
      setLinkTag('canonical', window.location.href)
    }
  }

  /**
   * 设置文章页面的结构化数据
   */
  const setArticleStructuredData = (article: {
    title: string
    description: string
    image?: string
    author: string
    publishedTime: string
    modifiedTime?: string
    url?: string
  }) => {
    const structuredData: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      image: article.image || activeSEOConfig.ogImage,
      author: {
        '@type': 'Person',
        name: article.author
      },
      publisher: {
        '@type': 'Organization',
        name: activeSEOConfig.defaultTitle,
        logo: {
          '@type': 'ImageObject',
          url: activeSEOConfig.ogImage
        }
      },
      datePublished: article.publishedTime,
      dateModified: article.modifiedTime || article.publishedTime,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': article.url || window.location.href
      }
    }

    setStructuredData(structuredData)
  }

  /**
   * 设置网站/组织的结构化数据
   */
  const setWebsiteStructuredData = (website: {
    name: string
    description: string
    url: string
    logo?: string
  }) => {
    const structuredData: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: website.name,
      description: website.description,
      url: website.url,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${website.url}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    }

    if (website.logo) {
      structuredData.publisher = {
        '@type': 'Organization',
        name: website.name,
        logo: {
          '@type': 'ImageObject',
          url: website.logo
        }
      }
    }

    setStructuredData(structuredData)
  }

  /**
   * 设置面包屑导航的结构化数据
   */
  const setBreadcrumbStructuredData = (breadcrumbs: Array<{ name: string; url: string }>) => {
    const structuredData: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    }

    setStructuredData(structuredData)
  }

  /**
   * 清除所有动态 meta 标签
   */
  const clearMeta = () => {
    // 清除基础 meta 标签
    removeMetaTag('description')
    removeMetaTag('keywords')
    removeMetaTag('author')
    removeMetaTag('robots')

    // 清除 Open Graph 标签
    removeMetaTag('og:title', 'property')
    removeMetaTag('og:description', 'property')
    removeMetaTag('og:image', 'property')
    removeMetaTag('og:url', 'property')
    removeMetaTag('og:type', 'property')
    removeMetaTag('article:published_time', 'property')
    removeMetaTag('article:modified_time', 'property')

    // 清除 Twitter Card 标签
    removeMetaTag('twitter:card')
    removeMetaTag('twitter:title')
    removeMetaTag('twitter:description')
    removeMetaTag('twitter:image')

    // 清除结构化数据
    removeStructuredData()
  }

  // 初始化时更新 meta 标签
  onMounted(() => {
    if (config) {
      updateMeta(config)
    }
  })

  // 监听路由变化
  watch(
    () => route.fullPath,
    () => {
      if (config) {
        updateMeta(config)
      }
    }
  )

  // 组件卸载时清除 meta 标签
  onUnmounted(() => {
    clearMeta()
  })

  return {
    updateMeta,
    setArticleStructuredData,
    setWebsiteStructuredData,
    setBreadcrumbStructuredData,
    clearMeta
  }
}
