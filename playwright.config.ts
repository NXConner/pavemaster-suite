import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['github'], // GitHub Actions integration
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video recording */
    video: 'retain-on-failure',
    
    /* Viewport size */
    viewport: { width: 1280, height: 720 },
    
    /* Global timeout for all actions */
    actionTimeout: 30000,
    
    /* Global timeout for navigation */
    navigationTimeout: 30000,
    
    /* Global test timeout */
    testTimeout: 120000,
    
    /* Ignore HTTPS errors */
    ignoreHTTPSErrors: true,
    
    /* Extra HTTP headers */
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    
    /* User agent */
    userAgent: 'PaveMaster-E2E-Tests/1.0',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    
    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome']
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      dependencies: ['setup'],
    },

    /* Test against tablet viewports. */
    {
      name: 'Tablet Chrome',
      use: { ...devices['Galaxy Tab S4'] },
      dependencies: ['setup'],
    },
    {
      name: 'Tablet Safari',
      use: { ...devices['iPad Pro'] },
      dependencies: ['setup'],
    },

    /* High DPI displays */
    {
      name: 'High DPI',
      use: {
        ...devices['Desktop Chrome'],
        deviceScaleFactor: 2,
        viewport: { width: 1920, height: 1080 },
      },
      dependencies: ['setup'],
    },

    /* Accessibility testing */
    {
      name: 'accessibility',
      testMatch: /.*\.a11y\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    /* Performance testing */
    {
      name: 'performance',
      testMatch: /.*\.perf\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        // Enable performance metrics
        extraHTTPHeaders: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
      },
      dependencies: ['setup'],
    },

    /* API testing */
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        // No browser context for API tests
        baseURL: process.env.API_BASE_URL || 'http://localhost:3000/api',
      },
    },

    /* Visual regression testing */
    {
      name: 'visual',
      testMatch: /.*\.visual\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome']
      },
      dependencies: ['setup'],
    },

    /* Cross-browser compatibility testing */
    {
      name: 'edge',
      use: { ...devices['Desktop Edge'] },
      dependencies: ['setup'],
    },

    /* Legacy browser support */
    {
      name: 'chrome-old',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome-beta', // Test against beta version
      },
      dependencies: ['setup'],
    },
  ],

  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: 'test',
      VITE_ENVIRONMENT: 'test',
    },
  },

  /* Test configuration overrides for CI */
  ...(process.env.CI && {
    workers: 1,
    retries: 3,
    timeout: 300000, // 5 minutes for CI
    use: {
      video: 'on-failure',
      screenshot: 'only-on-failure',
      trace: 'retain-on-failure',
    },
  }),

  /* Expect options */
  expect: {
    /* Timeout for expect assertions */
    timeout: 10000,
    
    /* Animation handling */
    toHaveScreenshot: {
      animations: 'disabled'
    }
  },

  /* Test metadata */
  metadata: {
    testType: 'e2e',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    browser: 'multi-browser',
    platform: process.platform,
  },
});