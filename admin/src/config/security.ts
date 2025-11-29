/**
 * 安全配置
 * 集中管理所有安全相关的配置
 */

/**
 * 密码策略配置
 */
export const passwordPolicy = {
  // 最小长度
  minLength: 8,
  // 是否要求大写字母
  requireUppercase: true,
  // 是否要求小写字母
  requireLowercase: true,
  // 是否要求数字
  requireNumber: true,
  // 是否要求特殊字符
  requireSpecialChar: false,
  // 密码过期天数（0 表示不过期）
  expiryDays: 0,
}

/**
 * Token 配置
 */
export const tokenConfig = {
  // Token 存储键名
  storageKey: 'token',
  // Refresh Token 存储键名
  refreshTokenKey: 'refreshToken',
  // Token 过期前多久刷新（毫秒）
  refreshBeforeExpiry: 5 * 60 * 1000, // 5 分钟
}

/**
 * 请求频率限制配置
 */
export const rateLimitConfig = {
  // 登录请求限制：5 次/分钟
  login: {
    limit: 5,
    window: 60 * 1000,
  },
  // 一般 API 请求限制：100 次/分钟
  api: {
    limit: 100,
    window: 60 * 1000,
  },
  // 文件上传限制：10 次/分钟
  upload: {
    limit: 10,
    window: 60 * 1000,
  },
}

/**
 * 文件上传安全配置
 */
export const uploadConfig = {
  // 图片文件
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  },
  // 普通文件
  file: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ],
    allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
  },
}

/**
 * XSS 防护配置
 */
export const xssConfig = {
  // 允许的 HTML 标签
  allowedTags: [
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
  // 允许的 HTML 属性
  allowedAttributes: [
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
}

/**
 * CORS 配置
 */
export const corsConfig = {
  // 允许的域名列表
  allowedOrigins: [
    window.location.origin,
    // 可以添加其他允许的域名
  ],
}

/**
 * 会话配置
 */
export const sessionConfig = {
  // 会话超时时间（毫秒）
  timeout: 30 * 60 * 1000, // 30 分钟
  // 是否在用户活动时延长会话
  extendOnActivity: true,
  // 警告用户会话即将过期的时间（毫秒）
  warningTime: 5 * 60 * 1000, // 5 分钟
}

/**
 * 内容安全策略（CSP）配置
 */
export const cspConfig = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'", import.meta.env.VITE_API_BASE_URL || ''],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
}

/**
 * 安全头配置
 */
export const securityHeaders = {
  // 防止点击劫持
  'X-Frame-Options': 'DENY',
  // 防止 MIME 类型嗅探
  'X-Content-Type-Options': 'nosniff',
  // XSS 防护
  'X-XSS-Protection': '1; mode=block',
  // 引用策略
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // 权限策略
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
}

/**
 * 输入验证配置
 */
export const validationConfig = {
  // 用户名
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
  // 邮箱
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  // URL
  url: {
    protocols: ['http:', 'https:'],
  },
  // Slug
  slug: {
    pattern: /^[a-z0-9-]+$/,
  },
}

/**
 * 日志配置
 */
export const loggingConfig = {
  // 是否启用日志
  enabled: import.meta.env.DEV,
  // 日志级别
  level: import.meta.env.DEV ? 'debug' : 'error',
  // 敏感字段（不记录到日志）
  sensitiveFields: [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'apiKey',
    'authorization',
  ],
}
