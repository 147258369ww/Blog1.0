/**
 * 博客统计数据（来自后端 /stats 接口）
 */
export interface BlogStats {
  /** 已发布文章总数 */
  totalPosts: number
  /** 标签总数 */
  totalTags: number
  /** 总访问量 */
  totalViews: number
}

/**
 * 文章统计数据（来自后端 /stats/posts 接口）
 */
export interface PostStats {
  /** 草稿文章数 */
  draft: number
  /** 已发布文章数 */
  published: number
  /** 已归档文章数 */
  archived: number
}

/**
 * 仪表盘统计数据（前端组合使用）
 */
export interface DashboardStats extends BlogStats {
  /** 分类总数（需要单独获取） */
  totalCategories?: number
  /** 文章状态统计 */
  postStats?: PostStats
}

/**
 * 仪表盘趋势数据（暂未实现）
 */
export interface DashboardTrends {
  /** 日期 */
  date: string
  /** 访问量 */
  views: number
}
