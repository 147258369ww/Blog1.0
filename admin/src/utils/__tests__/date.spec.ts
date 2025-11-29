import { describe, it, expect } from 'vitest'
import { formatDate, formatRelativeTime, formatDateOnly, formatTimeOnly } from '../date'

describe('date utils', () => {
  describe('formatDate', () => {
    it('should format date with default format', () => {
      const date = new Date('2025-01-15T10:30:45')
      const result = formatDate(date)
      expect(result).toBe('2025-01-15 10:30:45')
    })

    it('should format date with custom format', () => {
      const date = new Date('2025-01-15T10:30:45')
      const result = formatDate(date, 'YYYY/MM/DD')
      expect(result).toBe('2025/01/15')
    })

    it('should format date string', () => {
      const result = formatDate('2025-01-15T10:30:45')
      expect(result).toBe('2025-01-15 10:30:45')
    })

    it('should return empty string for null', () => {
      expect(formatDate(null)).toBe('')
    })

    it('should return empty string for undefined', () => {
      expect(formatDate(undefined)).toBe('')
    })

    it('should return empty string for invalid date', () => {
      expect(formatDate('invalid')).toBe('')
    })
  })

  describe('formatRelativeTime', () => {
    it('should return "刚刚" for recent time', () => {
      const now = new Date()
      const recent = new Date(now.getTime() - 30 * 1000)
      expect(formatRelativeTime(recent)).toBe('刚刚')
    })

    it('should return minutes ago', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 5 * 60 * 1000)
      expect(formatRelativeTime(past)).toBe('5分钟前')
    })

    it('should return hours ago', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 3 * 60 * 60 * 1000)
      expect(formatRelativeTime(past)).toBe('3小时前')
    })

    it('should return days ago', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      expect(formatRelativeTime(past)).toBe('5天前')
    })

    it('should return empty string for null', () => {
      expect(formatRelativeTime(null)).toBe('')
    })
  })

  describe('formatDateOnly', () => {
    it('should format date without time', () => {
      const date = new Date('2025-01-15T10:30:45')
      expect(formatDateOnly(date)).toBe('2025-01-15')
    })
  })

  describe('formatTimeOnly', () => {
    it('should format time without date', () => {
      const date = new Date('2025-01-15T10:30:45')
      expect(formatTimeOnly(date)).toBe('10:30:45')
    })
  })
})
