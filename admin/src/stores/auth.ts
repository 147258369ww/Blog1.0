import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@/api/auth'
import { storage } from '@/utils/storage'
import { logger } from '@/utils/logger'
import type { User } from '@/types/models'
import type { LoginRequest } from '@/types/api'

export const useAuthStore = defineStore('auth', () => {
  // 从 localStorage 初始化状态
  const token = ref<string | null>(storage.get<string>('token'))
  const refreshToken = ref<string | null>(storage.get<string>('refreshToken'))
  const user = ref<User | null>(storage.get<User>('user'))

  /**
   * 设置访问令牌
   */
  const setToken = (newToken: string) => {
    token.value = newToken
    storage.set('token', newToken)
  }

  /**
   * 设置刷新令牌
   */
  const setRefreshToken = (newRefreshToken: string) => {
    refreshToken.value = newRefreshToken
    storage.set('refreshToken', newRefreshToken)
  }

  /**
   * 设置用户信息
   */
  const setUser = (newUser: User) => {
    user.value = newUser
    storage.set('user', newUser)
  }

  /**
   * 用户登录
   * 调用登录 API，保存 Token 和用户信息
   */
  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authApi.login(credentials)

      if (response.success && response.data) {
        const { accessToken, refreshToken: refreshTokenValue, user: userInfo } = response.data

        // 保存认证信息到状态和本地存储
        setToken(accessToken)
        setRefreshToken(refreshTokenValue)
        setUser(userInfo)

        // 记录登录成功事件
        logger.auth('用户登录成功', { userId: userInfo.id, email: userInfo.email })
      } else {
        throw new Error(response.error || '登录失败')
      }
    } catch (error) {
      // 记录登录失败事件
      logger.security('登录失败', { email: credentials.email })
      throw error
    }
  }

  /**
   * 用户登出
   * 清除 Token 和用户信息，重定向到登录页
   */
  const logout = async () => {
    const userId = user.value?.id

    // 先清除本地认证信息，避免后续请求使用过期token
    const hasToken = !!token.value
    token.value = null
    refreshToken.value = null
    user.value = null
    storage.remove('token')
    storage.remove('refreshToken')
    storage.remove('user')

    // 只有在有有效token时才调用登出API
    if (hasToken) {
      try {
        // 调用登出 API（可选，用于服务端清理）
        // 即使失败也不影响本地清理
        await authApi.logout()
        logger.auth('用户登出成功', { userId })
      } catch (error) {
        // 登出API失败（如401）不影响本地清理，静默处理
        logger.error('登出 API 调用失败（已忽略）', error)
      }
    } else {
      logger.auth('用户登出（仅本地清理）', { userId })
    }
  }

  /**
   * 刷新访问令牌
   * 使用 Refresh Token 获取新的 Access Token
   */
  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      logger.security('刷新令牌失败：没有可用的刷新令牌')
      throw new Error('没有可用的刷新令牌')
    }

    try {
      const response = await authApi.refresh({ refreshToken: refreshToken.value })

      if (response.success && response.data) {
        const { accessToken } = response.data
        setToken(accessToken)
        logger.auth('访问令牌刷新成功', { userId: user.value?.id })
        return accessToken
      } else {
        // 刷新失败，清除认证信息
        logger.security('刷新令牌失败：无效的响应')
        await logout()
        throw new Error(response.error || '刷新令牌失败')
      }
    } catch (error) {
      logger.security('刷新令牌失败', { error })
      await logout()
      throw error
    }
  }

  /**
   * 检查是否已认证
   */
  const isAuthenticated = () => {
    return !!token.value
  }

  return {
    token,
    refreshToken,
    user,
    setToken,
    setRefreshToken,
    setUser,
    login,
    logout,
    refreshAccessToken,
    isAuthenticated,
  }
})
