import { defineConfig, devices } from '@playwright/test';

/**
 * Comprehensive Playwright configuration for PaveMaster Suite
 * Supports cross-browser testing, mobile testing, and visual regression testing
 */

export default defineConfig({
  // Test directory
  testDir: './src/test/e2e',

  // Global test timeout
  timeout: 30 * 1000,

  // Test configuration
  expect: {
    // Maximum time expect() should wait for the condition to be met
    timeout: 5000,
    // Visual comparison threshold
    threshold: 0.2,
    // Screenshot comparison mode
    toHaveScreenshot: { threshold: 0.2 },
    toMatchScreenshot: { threshold: 0.2 },
  },

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    // Add list reporter for local development
    process.env.CI ? null : ['list'],
  ].filter(Boolean),

  // Global setup and teardown
  globalSetup: './src/test/e2e/global-setup.ts',
  globalTeardown: './src/test/e2e/global-teardown.ts',

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Record video on failure
    video: 'retain-on-failure',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Browser context options
    ignoreHTTPSErrors: true,

    // Viewport size
    viewport: { width: 1280, height: 720 },

    // User agent
    userAgent: 'PaveMaster E2E Tests',

    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },

    // Geolocation (for location-based features)
    geolocation: { longitude: -122.4194, latitude: 37.7749 }, // San Francisco
    permissions: ['geolocation'],

    // Color scheme
    colorScheme: 'light',

    // Locale
    locale: 'en-US',

    // Timezone
    timezoneId: 'America/Los_Angeles',
  },

  // Configure projects for major browsers
  projects: [
    // Desktop browsers
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        // Enable experimental features for testing
        launchOptions: {
          args: [
            '--enable-experimental-web-platform-features',
            '--enable-features=VaapiVideoDecoder',
            '--disable-dev-shm-usage',
            '--no-sandbox',
          ],
        },
      },
    },

    {
      name: 'firefox-desktop',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit-desktop',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet
    {
      name: 'tablet-safari',
      use: { ...devices['iPad Pro'] },
    },

    // High DPI displays
    {
      name: 'chromium-hidpi',
      use: {
        ...devices['Desktop Chrome HiDPI'],
        deviceScaleFactor: 2,
      },
    },

    // Dark mode testing
    {
      name: 'chromium-dark',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
      },
    },

    // Slow network simulation
    {
      name: 'chromium-slow-network',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--enable-features=NetworkService'],
        },
        // Simulate slow 3G
        connectOptions: {
          timeout: 60000,
        },
      },
    },

    // Accessibility testing
    {
      name: 'chromium-accessibility',
      use: {
        ...devices['Desktop Chrome'],
        // Force high contrast mode
        forcedColors: 'active',
        // Reduce motion
        reducedMotion: 'reduce',
      },
    },

    // Performance testing
    {
      name: 'chromium-performance',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--enable-features=VaapiVideoDecoder',
            '--enable-gpu-rasterization',
            '--enable-zero-copy',
          ],
        },
      },
    },
  ],

  // Test match patterns
  testMatch: [
    '**/*.e2e.test.ts',
    '**/*.e2e.spec.ts',
    '**/e2e/**/*.test.ts',
    '**/e2e/**/*.spec.ts',
  ],

  // Global test configuration
  globalTimeout: 60 * 60 * 1000, // 1 hour

  // Folder for test artifacts
  outputDir: 'test-results/',

  // Whether to preserve test output between runs
  preserveOutput: 'failures-only',

  // Maximum number of test failures to report
  maxFailures: process.env.CI ? 10 : undefined,

  // Web server configuration (for local testing)
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 8080,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'test',
    },
  },
});