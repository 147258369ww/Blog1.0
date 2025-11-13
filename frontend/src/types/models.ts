// 数据模型类型定义

// 枚举类型 (使用字符串字面量类型)
export type PostStatus = 'published' | 'draft'

export type UserRole = 'admin' | 'user'

// 用户模型
export interface User {
  id: number
  username: string
  email: string
  avatar?: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

// 文章模型
export interface Post {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage?: string
  status: PostStatus
  viewCount: number
  publishedAt: string
  createdAt: string
  updatedAt: string
  author: User
  category: Category
  tags: Tag[]
}

// 分类模型
export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  color: string
  postCount: number
  createdAt: string
  updatedAt: string
}

// 标签模型
export interface Tag {
  id: number
  name: string
  slug: string
  color: string
  postCount: number
  createdAt: string
  updatedAt: string
}

// 友情链接模型
export interface Link {
  id: number
  name: string
  url: string
  logo?: string
  description?: string
  order: number
  createdAt: string
  updatedAt: string
}

// 网站配置模型
export interface SiteConfig {
  siteName: string
  siteDescription: string
  siteLogo?: string
  siteUrl: string
  footerText: string
  socialLinks: {
    twitter?: string
    linkedin?: string
    email?: string
    rss?: string
    feedly?: string
  }
}

// SEO配置模型
export interface SEOConfig {
  defaultTitle: string
  defaultDescription: string
  defaultKeywords: string[]
  ogImage?: string
}

// 统计数据模型
export interface Stats {
  totalPosts: number
  totalCategories: number
  totalTags: number
  totalViews: number
}
