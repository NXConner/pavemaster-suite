import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Global test utilities and configurations
afterEach(() => {
  cleanup()
})

// Extend Vitest's expect with custom matchers if needed
expect.extend({
  // Add custom matchers here if needed in the future
})

// Mock environment variables
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {
      // Mock implementation
    },
    removeListener: () => {
      // Mock implementation
    },
    addEventListener: () => {
      // Mock implementation
    },
    removeEventListener: () => {
      // Mock implementation
    },
    dispatchEvent: () => {
      // Mock implementation
      return false
    },
  }),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(
    _callback: IntersectionObserverCallback,
    _options?: IntersectionObserverInit
  ) {
    // Mock constructor
  }
  
  disconnect() {
    // Mock implementation
  }
  
  observe(_target: Element) {
    // Mock implementation
  }
  
  unobserve(_target: Element) {
    // Mock implementation
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {
    // Mock constructor
  }
  
  disconnect() {
    // Mock implementation
  }
  
  observe(_target: Element, _options?: ResizeObserverOptions) {
    // Mock implementation
  }
  
  unobserve(_target: Element) {
    // Mock implementation
  }
}