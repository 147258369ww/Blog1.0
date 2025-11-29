import { describe, it, expect } from 'vitest'
import {
  required,
  email,
  url,
  minLength,
  maxLength,
  lengthRange,
  phone,
  slug,
  hexColor,
} from '../validation'

describe('validation utils', () => {
  describe('required', () => {
    it('should create required rule', () => {
      const rule = required('Field is required')
      expect(rule.required).toBe(true)
      expect(rule.message).toBe('Field is required')
      expect(rule.trigger).toBe('blur')
    })
  })

  describe('email', () => {
    it('should create email validation rule', () => {
      const rule = email()
      expect(rule.type).toBe('email')
      expect(rule.trigger).toBe('blur')
    })
  })

  describe('url', () => {
    it('should create URL validation rule', () => {
      const rule = url()
      expect(rule.type).toBe('url')
      expect(rule.trigger).toBe('blur')
    })
  })

  describe('minLength', () => {
    it('should create min length rule', () => {
      const rule = minLength(6)
      expect(rule.min).toBe(6)
      expect(rule.message).toBe('至少需要 6 个字符')
    })

    it('should accept custom message', () => {
      const rule = minLength(6, 'Custom message')
      expect(rule.message).toBe('Custom message')
    })
  })

  describe('maxLength', () => {
    it('should create max length rule', () => {
      const rule = maxLength(100)
      expect(rule.max).toBe(100)
      expect(rule.message).toBe('最多允许 100 个字符')
    })
  })

  describe('lengthRange', () => {
    it('should create length range rule', () => {
      const rule = lengthRange(3, 20)
      expect(rule.min).toBe(3)
      expect(rule.max).toBe(20)
      expect(rule.message).toBe('长度在 3 到 20 个字符之间')
    })
  })

  describe('phone', () => {
    it('should create phone validation rule', () => {
      const rule = phone()
      expect(rule.pattern).toBeInstanceOf(RegExp)
      expect(rule.message).toBe('请输入有效的手机号')
    })

    it('should validate valid phone numbers', () => {
      const rule = phone()
      const pattern = rule.pattern as RegExp
      expect(pattern.test('13800138000')).toBe(true)
      expect(pattern.test('15912345678')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      const rule = phone()
      const pattern = rule.pattern as RegExp
      expect(pattern.test('12345678901')).toBe(false)
      expect(pattern.test('1234567890')).toBe(false)
    })
  })

  describe('slug', () => {
    it('should create slug validation rule', () => {
      const rule = slug()
      expect(rule.pattern).toBeInstanceOf(RegExp)
    })

    it('should validate valid slugs', () => {
      const rule = slug()
      const pattern = rule.pattern as RegExp
      expect(pattern.test('hello-world')).toBe(true)
      expect(pattern.test('test123')).toBe(true)
      expect(pattern.test('my-slug-123')).toBe(true)
    })

    it('should reject invalid slugs', () => {
      const rule = slug()
      const pattern = rule.pattern as RegExp
      expect(pattern.test('Hello-World')).toBe(false)
      expect(pattern.test('test_123')).toBe(false)
      expect(pattern.test('test 123')).toBe(false)
    })
  })

  describe('hexColor', () => {
    it('should create hex color validation rule', () => {
      const rule = hexColor()
      expect(rule.pattern).toBeInstanceOf(RegExp)
    })

    it('should validate valid hex colors', () => {
      const rule = hexColor()
      const pattern = rule.pattern as RegExp
      expect(pattern.test('#FF0000')).toBe(true)
      expect(pattern.test('#fff')).toBe(true)
      expect(pattern.test('#123ABC')).toBe(true)
    })

    it('should reject invalid hex colors', () => {
      const rule = hexColor()
      const pattern = rule.pattern as RegExp
      expect(pattern.test('FF0000')).toBe(false)
      expect(pattern.test('#GG0000')).toBe(false)
      expect(pattern.test('#12')).toBe(false)
    })
  })
})
