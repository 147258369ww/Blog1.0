/**
 * Vitest 测试环境配置
 */

import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
    // Add method to get all keys for testing
    _getStore: () => store,
  }
})()

// Override Object.keys to work with localStorage
const originalObjectKeys = Object.keys
Object.keys = function (obj: any) {
  if (obj === localStorage) {
    return originalObjectKeys((localStorage as any)._getStore())
  }
  return originalObjectKeys(obj)
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock console methods to reduce noise in tests
globalThis.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
} as Console
