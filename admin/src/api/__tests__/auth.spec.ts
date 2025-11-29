import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authApi } from '../auth'
import request from '@/utils/request'

vi.mock('@/utils/request')

describe('auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should call login endpoint with credentials', async () => {
      const mockResponse = {
        success: true,
        data: {
          accessToken: 'token',
          refreshToken: 'refresh',
          user: { id: 1, email: 'test@example.com', username: 'test', role: 'admin' },
        },
      }

      vi.mocked(request).mockResolvedValue(mockResponse)

      const credentials = { email: 'test@example.com', password: 'password' }
      const result = await authApi.login(credentials)

      expect(request).toHaveBeenCalledWith({
        url: '/admin/auth/login',
        method: 'POST',
        data: credentials,
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('logout', () => {
    it('should call logout endpoint', async () => {
      const mockResponse = { success: true }
      vi.mocked(request).mockResolvedValue(mockResponse)

      const result = await authApi.logout()

      expect(request).toHaveBeenCalledWith({
        url: '/admin/auth/logout',
        method: 'POST',
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('refresh', () => {
    it('should call refresh endpoint with refresh token', async () => {
      const mockResponse = {
        success: true,
        data: { accessToken: 'new-token' },
      }

      vi.mocked(request).mockResolvedValue(mockResponse)

      const result = await authApi.refresh({ refreshToken: 'refresh-token' })

      expect(request).toHaveBeenCalledWith({
        url: '/admin/auth/refresh',
        method: 'POST',
        data: { refreshToken: 'refresh-token' },
      })
      expect(result).toEqual(mockResponse)
    })
  })
})
