import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'

/**
 * 后端配置项类型
 */
export interface ConfigItem {
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'json'
  description?: string
  is_public?: boolean
}

/**
 * 前端配置对象类型
 */
export interface ConfigData {
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

// 关于页配置（与后端 about_profile 对齐，暂选常用字段）
export interface AboutProfile {
  name: string
  title: string
  avatar: string
  bio: string[]
  location?: string
  website?: string
  resumeUrl?: string
  contacts: { email?: string; phone?: string; wechat?: string }
  interests?: string[]
  languages?: string[]
  projects?: Array<{ name: string; link?: string; description?: string }>
  socialLinks?: Array<{ name: string; url: string }>
  skills?: Array<{ category: string; items: string[] }>
  experience?: Array<{ position: string; company: string; period: string; description: string }>
  education?: Array<{ degree: string; school: string; period: string; description?: string }>
}

/**
 * 配置键名映射（前端驼峰 -> 后端下划线）
 */
const CONFIG_KEY_MAP: Record<string, string> = {
  siteName: 'site_name',
  siteSubtitle: 'site_subtitle',
  siteDescription: 'site_description',
  siteLogo: 'site_logo',
  siteFavicon: 'site_favicon',
  siteUrl: 'site_url',
  adminEmail: 'admin_email',
  seoTitle: 'seo_title',
  seoDescription: 'seo_description',
  seoKeywords: 'seo_keywords',
  googleAnalyticsId: 'google_analytics_id',
  baiduAnalyticsId: 'baidu_analytics_id',
  wechat: 'wechat',
  weibo: 'weibo',
  github: 'github',
  twitter: 'twitter',
}

/**
 * 反向映射（后端下划线 -> 前端驼峰）
 */
const REVERSE_CONFIG_KEY_MAP: Record<string, string> = Object.entries(CONFIG_KEY_MAP).reduce(
  (acc, [key, value]) => {
    acc[value] = key
    return acc
  },
  {} as Record<string, string>
)

/**
 * 将后端配置数组转换为前端配置对象
 */
function transformConfigArrayToObject(configs: ConfigItem[]): ConfigData {
  const result: ConfigData = {}

  configs.forEach(config => {
    const frontendKey = REVERSE_CONFIG_KEY_MAP[config.key]
    if (frontendKey) {
      result[frontendKey as keyof ConfigData] = config.value
    }
  })

  return result
}

/**
 * 将前端配置对象转换为后端配置数组
 */
function transformConfigObjectToArray(configData: ConfigData): ConfigItem[] {
  const configs: ConfigItem[] = []

  Object.entries(configData).forEach(([key, value]) => {
    const backendKey = CONFIG_KEY_MAP[key]
    if (backendKey && value !== undefined) {
      configs.push({
        key: backendKey,
        value: value || '',
        type: 'string',
      })
    }
  })

  return configs
}

/**
 * 系统配置管理 API
 */
export const configApi = {
  /**
   * 获取系统配置
   * 获取当前系统的所有配置信息
   */
  async getConfig(): Promise<ApiResponse<ConfigData>> {
    const response = (await request({
      url: '/admin/config',
      method: 'GET',
    })) as ApiResponse<ConfigItem[]>

    // 转换配置数组为对象
    const configData = transformConfigArrayToObject(response.data || [])

    return {
      success: response.success,
      data: configData,
      message: response.message,
      error: response.error,
    }
  },

  /**
   * 更新系统配置
   * 更新系统配置信息
   */
  async updateConfig(data: ConfigData): Promise<ApiResponse<ConfigData>> {
    // 转换配置对象为数组
    const configs = transformConfigObjectToArray(data)

    const response = (await request({
      url: '/admin/config',
      method: 'PUT',
      data: configs,
    })) as ApiResponse<ConfigItem[]>

    // 转换返回的配置数组为对象
    const configData = transformConfigArrayToObject(response.data || [])

    return {
      success: response.success,
      data: configData,
      message: response.message,
      error: response.error,
    }
  },

  /**
   * 获取关于页配置（about_profile）
   */
  async getAbout(): Promise<ApiResponse<AboutProfile | null>> {
    const response = (await request({
      url: '/admin/config/about_profile',
      method: 'GET',
    })) as ApiResponse<any>
    return {
      success: response.success,
      data: (response.data?.value ?? null) as AboutProfile | null,
      message: response.message,
      error: response.error,
    }
  },

  /**
   * 更新关于页配置（全量覆盖）
   */
  async setAbout(payload: AboutProfile): Promise<ApiResponse<AboutProfile>> {
    const response = (await request({
      url: '/admin/config',
      method: 'PUT',
      data: [
        {
          key: 'about_profile',
          value: payload,
          type: 'json',
          description: '关于页面配置数据',
          is_public: true,
        },
      ],
    })) as ApiResponse<any>
    const updated = Array.isArray(response.data)
      ? response.data.find((i: any) => i.key === 'about_profile')
      : null
    return {
      success: response.success,
      data: (updated?.value ?? payload) as AboutProfile,
      message: response.message,
      error: response.error,
    }
  },
}
