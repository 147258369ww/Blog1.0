import { describe, it, expect, beforeEach, vi } from 'vitest'
import { storage } from '../storage'

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('set and get', () => {
    it('should store and retrieve string values', () => {
      storage.set('test', 'value')
      expect(storage.get('test')).toBe('value')
    })

    it('should store and retrieve object values', () => {
      const obj = { name: 'test', value: 123 }
      storage.set('obj', obj)
      expect(storage.get('obj')).toEqual(obj)
    })

    it('should store and retrieve array values', () => {
      const arr = [1, 2, 3]
      storage.set('arr', arr)
      expect(storage.get('arr')).toEqual(arr)
    })

    it('should return null for non-existent keys', () => {
      expect(storage.get('nonexistent')).toBeNull()
    })
  })

  describe('remove', () => {
    it('should remove stored values', () => {
      storage.set('test', 'value')
      expect(storage.get('test')).toBe('value')

      storage.remove('test')
      expect(storage.get('test')).toBeNull()
    })
  })

  describe('clear', () => {
    it('should clear all stored values with prefix', () => {
      // Clear any existing items first
      localStorage.clear()

      storage.set('key1', 'value1')
      storage.set('key2', 'value2')

      // Verify items were set
      expect(storage.get('key1')).toBe('value1')
      expect(storage.get('key2')).toBe('value2')

      // Verify the keys exist in localStorage with prefix
      expect(localStorage.getItem('blog_admin_key1')).toBeTruthy()
      expect(localStorage.getItem('blog_admin_key2')).toBeTruthy()

      storage.clear()

      // Verify keys are removed from localStorage
      expect(localStorage.getItem('blog_admin_key1')).toBeNull()
      expect(localStorage.getItem('blog_admin_key2')).toBeNull()

      expect(storage.get('key1')).toBeNull()
      expect(storage.get('key2')).toBeNull()
    })
  })

  describe('has', () => {
    it('should return true for existing keys', () => {
      storage.set('test', 'value')
      expect(storage.has('test')).toBe(true)
    })

    it('should return false for non-existent keys', () => {
      expect(storage.has('nonexistent')).toBe(false)
    })
  })

  describe('cache methods', () => {
    it('should store and retrieve cached values', () => {
      const value = { data: 'test' }
      storage.setCache('test', value, 1000)

      expect(storage.getCache('test')).toEqual(value)
    })

    it('should return null for expired cache', () => {
      vi.useFakeTimers()

      storage.setCache('test', 'value', 100)
      expect(storage.getCache('test')).toBe('value')

      vi.advanceTimersByTime(150)
      expect(storage.getCache('test')).toBeNull()

      vi.useRealTimers()
    })

    it('should remove cache items', () => {
      storage.setCache('test', 'value', 1000)
      expect(storage.getCache('test')).toBe('value')

      storage.removeCache('test')
      expect(storage.getCache('test')).toBeNull()
    })
  })
})
