import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  test: {
    // Environment configuration
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      
      // Coverage thresholds - enforce quality gates
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        // Critical files require higher coverage
        './src/security/**/*.ts': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        './src/services/**/*.ts': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      },
      
      // Include/exclude patterns
      include: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/test/**/*',
        '!src/**/*.stories.{ts,tsx}',
        '!src/**/*.config.{ts,tsx}'
      ],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/vendor/**',
        '**/test/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}'
      ]
    },
    
    // Test execution configuration
    testTimeout: 10000, // 10 seconds
    hookTimeout: 10000,
    teardownTimeout: 5000,
    
    // Performance monitoring during tests
    benchmark: {
      include: ['**/*.{bench,benchmark}.{js,mjs,ts}'],
      exclude: ['node_modules', 'dist', '.git'],
      reporters: ['default', 'json']
    },
    
    // Parallel execution
    threads: true,
    maxThreads: 4,
    minThreads: 1,
    
    // Watch mode configuration
    watch: true,
    watchExclude: ['**/node_modules/**', '**/dist/**'],
    
    // Reporter configuration
    reporter: [
      'default',
      'verbose',
      'json',
      'html'
    ],
    outputFile: {
      json: './test-results/results.json',
      html: './test-results/index.html'
    },
    
    // Mock configuration
    clearMocks: true,
    restoreMocks: true,
    
    // File patterns
    include: [
      'src/**/*.{test,spec}.{js,mjs,ts,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,ts,tsx}'
    ],
    exclude: [
      'node_modules',
      'dist',
      '.git',
      'coverage',
      '**/*.d.ts'
    ]
  },
  
  // Resolve configuration (matching main app)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@security': path.resolve(__dirname, './src/security'),
      '@config': path.resolve(__dirname, './src/config')
    }
  },
  
  // Define configuration for different test types
  define: {
    __DEV__: true,
    __TEST__: true
  },
  
  // Esbuild configuration for test files
  esbuild: {
    target: 'node14'
  }
});