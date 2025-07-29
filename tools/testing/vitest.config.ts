import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: 'jsdom',
    
    // Global setup
    globals: true,
    setupFiles: ['./setup.ts'],
    
    // File patterns
    include: [
      '**/*.{test,spec}.{js,ts,jsx,tsx}',
      '**/tests/**/*.{js,ts,jsx,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**'
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/tests/**',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // Performance
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4
      }
    },
    
    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Reporter
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results.json',
      html: './test-results.html'
    },
    
    // Watch mode
    watch: false,
    
    // Retry failed tests
    retry: 2,
    
    // Bail on first failure in CI
    bail: process.env.CI ? 1 : 0
  },
  
  // Resolve aliases
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../src'),
      '@/ui': resolve(__dirname, '../../ui'),
      '@/components': resolve(__dirname, '../../src/components'),
      '@/features': resolve(__dirname, '../../features'),
      '@/packages': resolve(__dirname, '../../packages'),
      '@/utils': resolve(__dirname, '../../src/utils'),
      '@/hooks': resolve(__dirname, '../../src/hooks'),
      '@/types': resolve(__dirname, '../../src/types'),
      '@/stores': resolve(__dirname, '../../src/stores'),
      '@/services': resolve(__dirname, '../../src/services')
    }
  },
  
  // Define global variables
  define: {
    __TEST__: true,
    __DEV__: true
  }
});