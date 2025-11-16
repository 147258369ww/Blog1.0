import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/api/auth'
import type { User, LoginRequest, RegisterRequest } from '@/types'

/**
 * 认证状态管理 Store
 * 
 * 功能:
 * - 用户认证状态管理 (accessToken、refreshToken、user)
 * - 登录、注册、登出 actions
 * - 令牌刷新逻辑
 * - localStorage 持久化
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const user = ref<User | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Actions
  
  /**
   * 用户登录
   * @param credentials 登录凭证 (email, password)
   */
  const login = async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials)
    setTokens(response.data.accessToken, response.data.refreshToken)
    user.value = response.data.user
  }

  /**
   * 用户注册
   * @param data 注册数据 (username, email, password, verificationCode)
   */
  const register = async (data: RegisterRequest) => {
    await authApi.register(data)
    const loginRes = await authApi.login({ email: data.email, password: data.password })
    setTokens(loginRes.data.accessToken, loginRes.data.refreshToken)
    user.value = loginRes.data.user
  }

  /**
   * 用户登出
   */
  const logout = async () => {
    try {
      await authApi.logout()
    } finally {
      clearTokens()
      user.value = null
    }
  }

  /**
   * 刷新访问令牌
   * 当访问令牌过期时自动调用
   */
  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }
    
    const response = await authApi.refreshToken(refreshToken.value)
    setTokens(response.data.accessToken, response.data.refreshToken)
    
    // 如果响应中包含用户信息，更新用户数据
    if (response.data.user) {
      user.value = response.data.user
    }
  }

  /**
   * 获取当前用户信息
   */
  const fetchCurrentUser = async () => {
    if (!accessToken.value) return
    
    const response = await authApi.getCurrentUser()
    user.value = response.data
  }

  /**
   * 修改密码
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   */
  const changePassword = async (oldPassword: string, newPassword: string) => {
    await authApi.changePassword(oldPassword, newPassword)
  }

  /**
   * 设置令牌并持久化到 localStorage
   * @param access 访问令牌
   * @param refresh 刷新令牌
   */
  const setTokens = (access: string, refresh: string) => {
    accessToken.value = access
    refreshToken.value = refresh
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
  }

  /**
   * 清除令牌
   */
  const clearTokens = () => {
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  /**
   * 设置用户信息
   * @param userData 用户数据
   */
  const setUser = (userData: User) => {
    user.value = userData
  }

  return {
    // State
    accessToken,
    refreshToken,
    user,
    
    // Getters
    isAuthenticated,
    isAdmin,
    
    // Actions
    login,
    register,
    logout,
    refreshAccessToken,
    fetchCurrentUser,
    changePassword,
    setTokens,
    clearTokens,
    setUser,
  }
})
