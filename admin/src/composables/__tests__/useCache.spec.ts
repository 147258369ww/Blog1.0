import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCache, cachedFn, clearAllCache } from '../useCache'

describe('useCache', () => {
  beforeEach(() => {
    clearAllCache()
    vi.clearAllMocks()
  })

  describe('useCache', () => {
    it('should fetch and cache data', async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: 'test' })
      const { data, loading, fetch } = useCache('test-key', fetcher)

      expect(data.value).toBeNull()
      expect(loading.value).toBe(false)

      await fetch()

      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(data.value).toEqual({ data: 'test' })
      expect(loading.value).toBe(false)
    })

    it('should use cached data on second fetch', async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: 'test' })
      const { fetch } = useCache('test-key', fetcher)

      await fetch()
      expect(fetcher).toHaveBeenCalledTimes(1)

      await fetch()
      expect(fetcher).toHaveBeenCalledTimes(1)
    })

    it('should force refresh when requested', async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: 'test' })
      const { fetch, refresh } = useCache('test-key', fetcher)

      await fetch()
      expect(fetcher).toHaveBeenCalledTimes(1)

      await refresh()
      expect(fetcher).toHaveBeenCalledTimes(2)
    })

    it('should handle errors', async () => {
      const error = new Error('Fetch failed')
      const fetcher = vi.fn().mockRejectedValue(error)
      const { data, error: errorRef, fetch } = useCache('test-key', fetcher)

      await fetch()

      expect(data.value).toBeNull()
      expect(errorRef.value).toEqual(error)
    })

    it('should clear cache', async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: 'test' })
      const { data, fetch, clear } = useCache('test-key', fetcher)

      await fetch()
      expect(data.value).toEqual({ data: 'test' })

      clear()
      expect(data.value).toBeNull()
    })

    it('should fetch immediately when immediate is true', async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: 'test' })
      useCache('test-key', fetcher, { immediate: true })

      await vi.waitFor(() => {
        expect(fetcher).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('cachedFn', () => {
    it('should cache function results', async () => {
      const fn = vi.fn().mockResolvedValue('result')
      const cached = cachedFn(fn)

      const result1 = await cached('arg1')
      expect(result1).toBe('result')
      expect(fn).toHaveBeenCalledTimes(1)

      const result2 = await cached('arg1')
      expect(result2).toBe('result')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should cache different arguments separately', async () => {
      const fn = vi.fn((arg: string) => Promise.resolve(`result-${arg}`))
      const cached = cachedFn(fn)

      await cached('arg1')
      await cached('arg2')

      expect(fn).toHaveBeenCalledTimes(2)
    })
  })
})
