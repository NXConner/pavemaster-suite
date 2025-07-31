/**
 * Test Setup Configuration
 * Comprehensive testing utilities including security testing, performance monitoring, and mocks
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';

// Security testing utilities
import { securityManager } from '@/security/SecurityManager';
import { performanceMonitor } from '@/services/AdvancedPerformanceMonitor';

// Global test configuration
declare global {
  interface Window {
    __TEST_ENV__: boolean;
    __SECURITY_TEST_MODE__: boolean;
    ResizeObserver: any;
    IntersectionObserver: any;
    requestIdleCallback: any;
    cancelIdleCallback: any;
  }
}

/**
 * Setup global test environment
 */
beforeAll(() => {
  // Mark test environment
  window.__TEST_ENV__ = true;
  window.__SECURITY_TEST_MODE__ = true;
  
  // Mock Web APIs not available in test environment
  setupWebApiMocks();
  
  // Setup security testing
  setupSecurityTesting();
  
  // Setup performance monitoring for tests
  setupTestPerformanceMonitoring();
  
  // Mock external services
  setupExternalServiceMocks();
  
  console.log('🧪 Test environment initialized');
});

/**
 * Cleanup after each test
 */
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.clearAllTimers();
});

/**
 * Cleanup after all tests
 */
afterAll(() => {
  performanceMonitor.stopMonitoring();
  console.log('🧪 Test environment cleaned up');
});

/**
 * Mock Web APIs not available in test environment
 */
function setupWebApiMocks(): void {
  // Mock ResizeObserver
  window.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock IntersectionObserver
  window.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock requestIdleCallback
  window.requestIdleCallback = vi.fn((callback) => {
    return setTimeout(callback, 0);
  });
  
  window.cancelIdleCallback = vi.fn((id) => {
    clearTimeout(id);
  });

  // Mock PerformanceObserver
  global.PerformanceObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock performance.memory
  Object.defineProperty(performance, 'memory', {
    value: {
      usedJSHeapSize: 10 * 1024 * 1024, // 10MB
      totalJSHeapSize: 20 * 1024 * 1024, // 20MB
      jsHeapSizeLimit: 100 * 1024 * 1024, // 100MB
    },
    configurable: true,
  });

  // Mock crypto.subtle for security tests
  Object.defineProperty(global, 'crypto', {
    value: {
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      },
      subtle: {
        importKey: vi.fn().mockResolvedValue({}),
        encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(16)),
        decrypt: vi.fn().mockResolvedValue(new ArrayBuffer(16)),
      }
    },
    configurable: true,
  });

  // Mock geolocation
  Object.defineProperty(navigator, 'geolocation', {
    value: {
      getCurrentPosition: vi.fn().mockImplementation((success) => {
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.0060,
            accuracy: 10,
          },
        });
      }),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    },
    configurable: true,
  });
}

/**
 * Setup security testing utilities
 */
function setupSecurityTesting(): void {
  // Mock security manager for testing
  vi.spyOn(securityManager, 'sanitizeInput');
  vi.spyOn(securityManager, 'validateFile');
  vi.spyOn(securityManager, 'isRateLimited');
  vi.spyOn(securityManager, 'auditSecurityEvent');

  // Global security test helpers
  globalThis.securityTestHelpers = {
    /**
     * Test XSS vulnerability
     */
    testXSSPrevention: (input: string): boolean => {
      const sanitized = securityManager.sanitizeInput(input);
      return !sanitized.includes('<script>') && !sanitized.includes('javascript:');
    },

    /**
     * Test file upload security
     */
    testFileUploadSecurity: (file: Partial<File>): boolean => {
      const testFile = new File(['test'], file.name || 'test.txt', {
        type: file.type || 'text/plain',
      });
      Object.defineProperty(testFile, 'size', {
        value: file.size || 1024,
        configurable: true,
      });
      
      const result = securityManager.validateFile(testFile);
      return result.valid;
    },

    /**
     * Test rate limiting
     */
    testRateLimit: (identifier: string, requests: number): boolean => {
      for (let i = 0; i < requests; i++) {
        if (securityManager.isRateLimited(identifier, 5, 60000)) {
          return true;
        }
      }
      return false;
    },

    /**
     * Generate test CSP header
     */
    generateTestCSP: (): string => {
      return securityManager.generateCSPHeader();
    }
  };
}

/**
 * Setup performance monitoring for tests
 */
function setupTestPerformanceMonitoring(): void {
  // Mock performance monitoring methods
  vi.spyOn(performanceMonitor, 'measureComponentRender');
  vi.spyOn(performanceMonitor, 'measureApiCall');
  
  // Global performance test helpers
  globalThis.performanceTestHelpers = {
    /**
     * Measure test execution time
     */
    measureTestPerformance: async (testFn: () => Promise<void> | void): Promise<number> => {
      const startTime = performance.now();
      await testFn();
      const endTime = performance.now();
      return endTime - startTime;
    },

    /**
     * Assert performance budget
     */
    assertPerformanceBudget: (actualTime: number, budgetMs: number): void => {
      if (actualTime > budgetMs) {
        throw new Error(`Performance budget exceeded: ${actualTime}ms > ${budgetMs}ms`);
      }
    },

    /**
     * Mock slow operation
     */
    mockSlowOperation: (delayMs: number): Promise<void> => {
      return new Promise(resolve => setTimeout(resolve, delayMs));
    }
  };
}

/**
 * Setup external service mocks
 */
function setupExternalServiceMocks(): void {
  // Mock fetch for API calls
  global.fetch = vi.fn();

  // Mock Supabase client
  vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
      auth: {
        signIn: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    })),
  }));

  // Mock Capacitor plugins
  vi.mock('@capacitor/core', () => ({
    Capacitor: {
      isNativePlatform: vi.fn().mockReturnValue(false),
      getPlatform: vi.fn().mockReturnValue('web'),
    },
  }));

  // Mock React Router
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useNavigate: vi.fn(() => vi.fn()),
      useLocation: vi.fn(() => ({ pathname: '/test' })),
      useParams: vi.fn(() => ({})),
    };
  });
}

/**
 * Custom render function with providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options: {
    initialEntries?: string[];
    preloadedState?: any;
  } = {}
) {
  const { render } = require('@testing-library/react');
  const { BrowserRouter } = require('react-router-dom');
  const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');
  
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
}

/**
 * Security test utilities
 */
export const securityTestUtils = {
  /**
   * Test for XSS vulnerabilities
   */
  testXSSInjection: (component: React.ReactElement, maliciousInput: string) => {
    const { container } = renderWithProviders(component);
    const hasScript = container.innerHTML.includes('<script>');
    const hasJavaScript = container.innerHTML.includes('javascript:');
    const hasOnEvent = /on\w+\s*=/.test(container.innerHTML);
    
    return !hasScript && !hasJavaScript && !hasOnEvent;
  },

  /**
   * Test CSP compliance
   */
  testCSPCompliance: (html: string): boolean => {
    // Check for inline scripts without nonce
    const inlineScripts = /<script(?![^>]*nonce)[^>]*>/.test(html);
    // Check for inline styles without nonce
    const inlineStyles = /<style(?![^>]*nonce)[^>]*>/.test(html);
    // Check for javascript: URLs
    const javascriptUrls = /javascript:/.test(html);
    
    return !inlineScripts && !inlineStyles && !javascriptUrls;
  },
};

/**
 * Performance test utilities
 */
export const performanceTestUtils = {
  /**
   * Measure component render time
   */
  measureRenderTime: async (component: React.ReactElement): Promise<number> => {
    const startTime = performance.now();
    renderWithProviders(component);
    const endTime = performance.now();
    return endTime - startTime;
  },

  /**
   * Test memory leaks
   */
  testMemoryLeak: async (componentFactory: () => React.ReactElement, iterations: number = 100): Promise<boolean> => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    for (let i = 0; i < iterations; i++) {
      const { unmount } = renderWithProviders(componentFactory());
      unmount();
    }
    
    // Force garbage collection if available
    if ((global as any).gc) {
      (global as any).gc();
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be less than 1MB for 100 iterations
    return memoryIncrease < 1024 * 1024;
  },
};

/**
 * Accessibility test utilities
 */
export const a11yTestUtils = {
  /**
   * Test keyboard navigation
   */
  testKeyboardNavigation: async (container: HTMLElement): Promise<boolean> => {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    
    // Test Tab navigation
    await user.tab();
    const activeElement = document.activeElement;
    
    return activeElement !== document.body;
  },

  /**
   * Test ARIA attributes
   */
  testARIACompliance: (container: HTMLElement): boolean => {
    const requiredARIA = container.querySelectorAll('[aria-required="true"]');
    const labels = container.querySelectorAll('[aria-label], [aria-labelledby]');
    const roles = container.querySelectorAll('[role]');
    
    return requiredARIA.length > 0 || labels.length > 0 || roles.length > 0;
  },
};

// Export test utilities
export {
  securityManager,
  performanceMonitor,
};

// Global type declarations for test helpers
declare global {
  var securityTestHelpers: {
    testXSSPrevention: (input: string) => boolean;
    testFileUploadSecurity: (file: Partial<File>) => boolean;
    testRateLimit: (identifier: string, requests: number) => boolean;
    generateTestCSP: () => string;
  };
  
  var performanceTestHelpers: {
    measureTestPerformance: (testFn: () => Promise<void> | void) => Promise<number>;
    assertPerformanceBudget: (actualTime: number, budgetMs: number) => void;
    mockSlowOperation: (delayMs: number) => Promise<void>;
  };
}