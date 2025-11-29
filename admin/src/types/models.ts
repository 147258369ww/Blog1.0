// 用户类型
export interface User {
  id: number
  email: string
  username: string
  role: 'admin' | 'user'
  avatar?: string
  createdAt: string
}

// 文章状态
export type ArticleStatus = 'draft' | 'published' | 'archived'

// 文章类型
export interface Article {
  id: number
  title: string
  content: string
  coverImage?: string
  categoryId: number
  status: ArticleStatus
  views: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

// 分类类型
export interface Category {
  id: number
  name: string
  slug: string
  parentId?: number
  description?: string
  sort: number
  articleCount: number
  children?: Category[]
  createdAt: string
  updatedAt: string
}

// 标签类型
export interface Tag {
  id: number
  name: string
  slug: string
  color?: string
  description?: string
  articleCount: number
  createdAt: string
  updatedAt: string
}

// 文件类型
export interface File {
  id: number
  filename: string
  original_name: string
  mime_type: string
  size: number
  url: string
  thumbnail_url?: string
  createdAt: string
}

// 友情链接类型
export interface Link {
  id: number
  name: string
  url: string
  logo?: string
  description?: string
  sort: number
  createdAt: string
  updatedAt: string
}

// 系统配置类型（前端使用的扁平对象）
export interface Config {
  siteName?: string
  siteSubtitle?: string
  siteDescription?: string
  siteLogo?: string
  siteFavicon?: string
  siteUrl?: string
  adminEmail?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  googleAnalyticsId?: string
  baiduAnalyticsId?: string
  wechat?: string
  weibo?: string
  github?: string
  twitter?: string
}
