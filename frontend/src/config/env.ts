/**
 * 环境变量配置和验证
 */

// 必需的环境变量
const requiredEnvVars = [
  'VITE_API_BASE_URL',
  'VITE_STATIC_BASE_URL',
  'VITE_APP_TITLE'
] as const

// 可选的环境变量及其默认值
const optionalEnvVars = {
  VITE_APP_PORT: '5173',
  VITE_MAX_RETRIES: '3',
  VITE_RETRY_DELAY: '1000',
  VITE_CACHE_TTL: '300000', // 5分钟
} as const

/**
 * 验证必需的环境变量
 */
function validateEnv() {
  const missing: string[] = []
  
  requiredEnvVars.forEach(key => {
    if (!import.meta.env[key]) {
      missing.push(key)
    }
  })
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n\n` +
      `Please check your .env file.`
    )
  }
}

// 开发环境验证
if (import.meta.env.DEV) {
  validateEnv()
}

/**
 * 应用配置
 */
export const config = {
  // API 配置
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  staticBaseUrl: import.meta.env.VITE_STATIC_BASE_URL,
  
  // 应用配置
  appTitle: import.meta.env.VITE_APP_TITLE,
  appPort: parseInt(import.meta.env.VITE_APP_PORT || optionalEnvVars.VITE_APP_PORT),
  
  // 性能配置
  maxRetries: parseInt(import.meta.env.VITE_MAX_RETRIES || optionalEnvVars.VITE_MAX_RETRIES),
  retryDelay: parseInt(import.meta.env.VITE_RETRY_DELAY || optionalEnvVars.VITE_RETRY_DELAY),
  cacheTTL: parseInt(import.meta.env.VITE_CACHE_TTL || optionalEnvVars.VITE_CACHE_TTL),
  
  // 环境标识
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const

// 类型导出
export type Config = typeof config
