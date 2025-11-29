import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useDebounce, useDebounceFn, useThrottle, useThrottleFn } from '../useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('useDebounce', () => {
    it('should debounce value changes', async () => {
      const value = ref('initial')
      const debouncedValue = useDebounce(value, 300)

      expect(debouncedValue.value).toBe('initial')

      value.value = 'changed'
      expect(debouncedValue.value).toBe('initial')

      vi.advanceTimersByTime(150)
      await vi.waitFor(() => {
        expect(debouncedValue.value).toBe('initial')
      })

      vi.advanceTimersByTime(150)
      await vi.waitFor(() => {
        expect(debouncedValue.value).toBe('changed')
      })
    })

    it('should reset timer on rapid changes', async () => {
      const value = ref(0)
      const debouncedValue = useDebounce(value, 300)

      value.value = 1
      vi.advanceTimersByTime(100)

      value.value = 2
      vi.advanceTimersByTime(100)

      value.value = 3
      vi.advanceTimersByTime(100)

      expect(debouncedValue.value).toBe(0)

      vi.advanceTimersByTime(200)
      await vi.waitFor(() => {
        expect(debouncedValue.value).toBe(3)
      })
    })
  })

  describe('useDebounceFn', () => {
    it('should debounce function calls', () => {
      const fn = vi.fn()
      const debouncedFn = useDebounceFn(fn, 300)

      debouncedFn('arg1')
      debouncedFn('arg2')
      debouncedFn('arg3')

      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(300)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('arg3')
    })
  })

  describe('useThrottle', () => {
    it('should throttle value changes', async () => {
      const value = ref(0)
      const throttledValue = useThrottle(value, 300)

      expect(throttledValue.value).toBe(0)

      value.value = 1
      vi.advanceTimersByTime(100)
      expect(throttledValue.value).toBe(0)

      value.value = 2
      vi.advanceTimersByTime(200)
      expect(throttledValue.value).toBe(0)

      value.value = 3
      vi.advanceTimersByTime(100)
      await vi.waitFor(() => {
        expect(throttledValue.value).toBe(3)
      })
    })
  })

  describe('useThrottleFn', () => {
    it('should throttle function calls', () => {
      const fn = vi.fn()
      const throttledFn = useThrottleFn(fn, 300)

      throttledFn('call1')
      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)
      throttledFn('call2')
      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(200)
      throttledFn('call3')
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })
})
