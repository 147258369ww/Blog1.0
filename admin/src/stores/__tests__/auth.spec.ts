import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import { storage } from '@/utils/storage'
import { authApi } from '@/api/auth'

vi.mock('@/api/auth', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  },
}))

vi.mock('@/utils/storage', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}))

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    vi.mocked(storage.get).mockReturnValue(null)
  })

  describe('initialization', () => {
    it('should initialize with null values when no stored data', () => {
      const store = useAuthStore()

      expect(store.token).toBeNull()
      expect(store.refreshToken).toBeNull()
      expect(store.user).toBeNull()
    })

    it('should initialize with stored values', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'test',
        role: 'admin' as const,
        createdAt: '2025-01-15T00:00:00Z',
      }

      vi.mocked(storage.get).mockImplementation((key: string) => {
        if (key === 'token') return 'mock-token'
        if (key === 'refreshToken') return 'mock-refresh-token'
        if (key === 'user') return mockUser
        return null
      })

      const store = useAuthStore()

      expect(store.token).toBe('mock-token')
      expect(store.refreshToken).toBe('mock-refresh-token')
      expect(store.user).toEqual(mockUser)
    })
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'test',
        role: 'admin' as const,
        createdAt: '2025-01-15T00:00:00Z',
      }
      const mockResponse = {
        success: true,
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: mockUser,
        },
      }

      vi.mocked(authApi.login).mockResolvedValue(mockResponse)

      const store = useAuthStore()
      await store.login({ email: 'test@example.com', password: 'password' })

      expect(store.token).toBe('access-token')
      expect(store.refreshToken).toBe('refresh-token')
      expect(store.user).toEqual(mockUser)
      expect(storage.set).toHaveBeenCalledWith('token', 'access-token')
      expect(storage.set).toHaveBeenCalledWith('refreshToken', 'refresh-token')
      expect(storage.set).toHaveBeenCalledWith('user', mockUser)
    })

    it('should throw error on login failure', async () => {
      const mockResponse = {
        success: false,
        error: 'Invalid credentials',
      }

      vi.mocked(authApi.login).mockResolvedValue(mockResponse)

      const store = useAuthStore()

      await expect(store.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(
        'Invalid credentials'
      )
    })
  })

  describe('logout', () => {
    it('should clear auth data on logout', async () => {
      vi.mocked(authApi.logout).mockResolvedValue({ success: true })

      const store = useAuthStore()
      store.token = 'token'
      store.refreshToken = 'refresh-token'
      store.user = {
        id: 1,
        email: 'test@example.com',
        username: 'test',
        role: 'admin',
        createdAt: '2025-01-15T00:00:00Z',
      }

      await store.logout()

      expect(store.token).toBeNull()
      expect(store.refreshToken).toBeNull()
      expect(store.user).toBeNull()
      expect(storage.remove).toHaveBeenCalledWith('token')
      expect(storage.remove).toHaveBeenCalledWith('refreshToken')
      expect(storage.remove).toHaveBeenCalledWith('user')
    })

    it('should clear auth data even if API call fails', async () => {
      vi.mocked(authApi.logout).mockRejectedValue(new Error('API error'))

      const store = useAuthStore()
      store.token = 'token'

      await store.logout()

      expect(store.token).toBeNull()
      expect(storage.remove).toHaveBeenCalled()
    })
  })

  describe('refreshAccessToken', () => {
    it('should refresh access token successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          accessToken: 'new-access-token',
        },
      }

      vi.mocked(authApi.refresh).mockResolvedValue(mockResponse)

      const store = useAuthStore()
      store.refreshToken = 'refresh-token'

      const newToken = await store.refreshAccessToken()

      expect(newToken).toBe('new-access-token')
      expect(store.token).toBe('new-access-token')
      expect(storage.set).toHaveBeenCalledWith('token', 'new-access-token')
    })

    it('should throw error when no refresh token', async () => {
      const store = useAuthStore()
      store.refreshToken = null

      await expect(store.refreshAccessToken()).rejects.toThrow('没有可用的刷新令牌')
    })

    it('should logout on refresh failure', async () => {
      const mockResponse = {
        success: false,
        error: 'Invalid refresh token',
      }

      vi.mocked(authApi.refresh).mockResolvedValue(mockResponse)
      vi.mocked(authApi.logout).mockResolvedValue({ success: true })

      const store = useAuthStore()
      store.refreshToken = 'invalid-token'
      store.token = 'old-token'

      await expect(store.refreshAccessToken()).rejects.toThrow()
      expect(store.token).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      const store = useAuthStore()
      store.token = 'token'

      expect(store.isAuthenticated()).toBe(true)
    })

    it('should return false when token is null', () => {
      const store = useAuthStore()
      store.token = null

      expect(store.isAuthenticated()).toBe(false)
    })
  })
})
