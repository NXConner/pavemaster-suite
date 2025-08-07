import { test, expect, Page } from '@playwright/test';

// Helper function to login
async function loginUser(page: Page, email = 'test@example.com', password = 'password') {
  await page.goto('/auth');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
}

// Helper function to wait for loading to complete
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[data-testid="page-loaded"]', { timeout: 10000 });
}

test.describe('Complete PaveMaster Suite Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.goto('/');
  });

  test('Complete Project Creation Workflow', async ({ page }) => {
    // Login
    await loginUser(page);

    // Navigate to Projects
    await page.click('[data-testid="nav-projects"]');
    await waitForPageLoad(page);

    // Create new project
    await page.click('[data-testid="create-project-button"]');
    await page.fill('[data-testid="project-name"]', 'Highway 101 Resurfacing');
    await page.fill('[data-testid="project-address"]', '123 Main St, Anytown, ST 12345');
    await page.selectOption('[data-testid="project-type"]', 'resurfacing');
    await page.fill('[data-testid="project-description"]', 'Complete resurfacing of Highway 101 section');

    // Set project details
    await page.fill('[data-testid="project-area"]', '50000');
    await page.selectOption('[data-testid="surface-type"]', 'asphalt');
    await page.fill('[data-testid="project-budget"]', '250000');

    // Add crew assignment
    await page.click('[data-testid="assign-crew-button"]');
    await page.selectOption('[data-testid="crew-select"]', 'crew-1');

    // Schedule project
    await page.fill('[data-testid="start-date"]', '2024-06-01');
    await page.fill('[data-testid="end-date"]', '2024-06-15');

    // Save project
    await page.click('[data-testid="save-project-button"]');

    // Verify project created
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Project created successfully');
    await expect(page.locator('[data-testid="project-title"]')).toContainText('Highway 101 Resurfacing');

    // Verify project appears in list
    await page.click('[data-testid="projects-list-link"]');
    await expect(page.locator('[data-testid="project-item"]').first()).toContainText('Highway 101 Resurfacing');
  });

  test('Material Calculation and Estimation Workflow', async ({ page }) => {
    await loginUser(page);

    // Navigate to Materials/Calculators
    await page.click('[data-testid="nav-materials"]');
    await waitForPageLoad(page);

    // Test Asphalt Calculator
    await page.click('[data-testid="asphalt-calculator-tab"]');

    // Input project dimensions
    await page.fill('[data-testid="length-input"]', '1000');
    await page.fill('[data-testid="width-input"]', '24');
    await page.fill('[data-testid="thickness-input"]', '3');

    // Select material type
    await page.selectOption('[data-testid="asphalt-type"]', 'hot-mix');
    await page.selectOption('[data-testid="aggregate-type"]', 'limestone');

    // Calculate
    await page.click('[data-testid="calculate-button"]');

    // Verify calculations
    await expect(page.locator('[data-testid="total-area"]')).toContainText('24,000');
    await expect(page.locator('[data-testid="total-tonnage"]')).toBeVisible();
    await expect(page.locator('[data-testid="estimated-cost"]')).toBeVisible();

    // Test Sealcoating Calculator
    await page.click('[data-testid="sealcoating-calculator-tab"]');
    await page.fill('[data-testid="seal-area"]', '50000');
    await page.selectOption('[data-testid="seal-type"]', 'coal-tar');
    await page.fill('[data-testid="coats-number"]', '2');

    await page.click('[data-testid="calculate-sealcoat"]');
    await expect(page.locator('[data-testid="gallons-needed"]')).toBeVisible();
    await expect(page.locator('[data-testid="seal-cost"]')).toBeVisible();
  });

  test('Equipment Management and Tracking Workflow', async ({ page }) => {
    await loginUser(page);

    // Navigate to Equipment
    await page.click('[data-testid="nav-equipment"]');
    await waitForPageLoad(page);

    // Add new equipment
    await page.click('[data-testid="add-equipment-button"]');
    await page.fill('[data-testid="equipment-name"]', 'Caterpillar Paver 1');
    await page.selectOption('[data-testid="equipment-type"]', 'paver');
    await page.fill('[data-testid="equipment-model"]', 'CAT AP555F');
    await page.fill('[data-testid="year"]', '2020');
    await page.fill('[data-testid="hours"]', '2500');

    // Save equipment
    await page.click('[data-testid="save-equipment"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Equipment added successfully');

    // Test maintenance scheduling
    await page.click('[data-testid="schedule-maintenance"]');
    await page.selectOption('[data-testid="maintenance-type"]', 'routine');
    await page.fill('[data-testid="maintenance-date"]', '2024-06-15');
    await page.fill('[data-testid="maintenance-notes"]', 'Regular 250-hour service');

    await page.click('[data-testid="schedule-maintenance-save"]');
    await expect(page.locator('[data-testid="maintenance-scheduled"]')).toBeVisible();

    // Test GPS tracking
    await page.click('[data-testid="track-equipment"]');
    await expect(page.locator('[data-testid="equipment-map"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-location"]')).toBeVisible();
  });

  test('Weather Integration and Work Planning', async ({ page }) => {
    await loginUser(page);

    // Navigate to Weather
    await page.click('[data-testid="nav-weather"]');
    await waitForPageLoad(page);

    // Check current conditions
    await expect(page.locator('[data-testid="current-temperature"]')).toBeVisible();
    await expect(page.locator('[data-testid="workability-score"]')).toBeVisible();

    // Test location-based weather
    await page.fill('[data-testid="location-input"]', 'New York, NY');
    await page.click('[data-testid="get-weather"]');

    await expect(page.locator('[data-testid="location-weather"]')).toContainText('New York');

    // Check 7-day forecast
    await page.click('[data-testid="forecast-tab"]');
    await expect(page.locator('[data-testid="forecast-day"]')).toHaveCount(7);

    // Verify workability recommendations
    await expect(page.locator('[data-testid="work-recommendations"]')).toBeVisible();
    await expect(page.locator('[data-testid="material-recommendations"]')).toBeVisible();

    // Test alerts
    await page.click('[data-testid="alerts-tab"]');
    // Weather alerts may or may not be present, so we just check the tab loads
    await expect(page.locator('[data-testid="alerts-container"]')).toBeVisible();
  });

  test('Employee Management and Tracking Workflow', async ({ page }) => {
    await loginUser(page);

    // Navigate to Team/Employees
    await page.click('[data-testid="nav-team"]');
    await waitForPageLoad(page);

    // Add new employee
    await page.click('[data-testid="add-employee-button"]');
    await page.fill('[data-testid="employee-name"]', 'John Smith');
    await page.fill('[data-testid="employee-email"]', 'john.smith@company.com');
    await page.selectOption('[data-testid="employee-role"]', 'crew_member');
    await page.fill('[data-testid="employee-phone"]', '555-123-4567');

    // Add certifications
    await page.click('[data-testid="add-certification"]');
    await page.selectOption('[data-testid="certification-type"]', 'forklift');
    await page.fill('[data-testid="certification-date"]', '2024-01-15');
    await page.fill('[data-testid="expiration-date"]', '2026-01-15');

    await page.click('[data-testid="save-employee"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Employee added successfully');

    // Test employee tracking
    await page.click('[data-testid="track-employees"]');
    await expect(page.locator('[data-testid="employee-map"]')).toBeVisible();

    // Test time tracking
    await page.click('[data-testid="time-tracking-tab"]');
    await page.click('[data-testid="clock-in-button"]');
    await expect(page.locator('[data-testid="clock-status"]')).toContainText('Clocked In');
  });

  test('Complete Estimate to Invoice Workflow', async ({ page }) => {
    await loginUser(page);

    // Start with creating an estimate
    await page.click('[data-testid="nav-estimates"]');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-estimate-button"]');

    // Client information
    await page.fill('[data-testid="client-name"]', 'ABC Corporation');
    await page.fill('[data-testid="client-email"]', 'contact@abccorp.com');
    await page.fill('[data-testid="project-address"]', '456 Business Ave, City, ST 54321');

    // Add line items
    await page.click('[data-testid="add-line-item"]');
    await page.fill('[data-testid="item-description-0"]', 'Asphalt Resurfacing');
    await page.fill('[data-testid="item-quantity-0"]', '1000');
    await page.selectOption('[data-testid="item-unit-0"]', 'sq_ft');
    await page.fill('[data-testid="item-rate-0"]', '2.50');

    // Add second line item
    await page.click('[data-testid="add-line-item"]');
    await page.fill('[data-testid="item-description-1"]', 'Line Striping');
    await page.fill('[data-testid="item-quantity-1"]', '500');
    await page.selectOption('[data-testid="item-unit-1"]', 'linear_ft');
    await page.fill('[data-testid="item-rate-1"]', '1.25');

    // Verify calculations
    await expect(page.locator('[data-testid="subtotal"]')).toContainText('3,125.00');
    await expect(page.locator('[data-testid="total"]')).toBeVisible();

    // Save estimate
    await page.click('[data-testid="save-estimate"]');
    await expect(page.locator('[data-testid="estimate-saved"]')).toBeVisible();

    // Convert to project
    await page.click('[data-testid="convert-to-project"]');
    await expect(page.locator('[data-testid="project-created"]')).toBeVisible();

    // Track project progress
    await page.click('[data-testid="track-progress"]');
    await page.selectOption('[data-testid="progress-status"]', '50');
    await page.fill('[data-testid="progress-notes"]', 'Asphalt work completed, striping in progress');
    await page.click('[data-testid="update-progress"]');

    // Generate invoice
    await page.click('[data-testid="generate-invoice"]');
    await expect(page.locator('[data-testid="invoice-generated"]')).toBeVisible();
    await expect(page.locator('[data-testid="invoice-total"]')).toContainText('3,125.00');
  });

  test('Mobile Command Center Workflow', async ({ page }) => {
    await loginUser(page);

    // Navigate to Mobile Command
    await page.click('[data-testid="nav-mobile"]');
    await waitForPageLoad(page);

    // Test field reporting
    await page.click('[data-testid="field-report-tab"]');
    await page.fill('[data-testid="report-title"]', 'Daily Progress Report');
    await page.fill('[data-testid="report-location"]', 'Highway 101, Mile Marker 15');

    // Add photos
    await page.click('[data-testid="add-photo-button"]');
    // Simulate photo upload
    await page.setInputFiles('[data-testid="photo-input"]', 'test-image.jpg');
    await page.fill('[data-testid="photo-description"]', 'Completed section of resurfacing');

    // Add measurements
    await page.fill('[data-testid="area-completed"]', '2500');
    await page.fill('[data-testid="material-used"]', '45');
    await page.selectOption('[data-testid="material-unit"]', 'tons');

    // Submit report
    await page.click('[data-testid="submit-report"]');
    await expect(page.locator('[data-testid="report-submitted"]')).toBeVisible();

    // Test offline capability
    await page.evaluate(() => {
      // Simulate going offline
      window.navigator.onLine = false;
    });

    await page.fill('[data-testid="offline-note"]', 'Working offline - will sync when connected');
    await page.click('[data-testid="save-offline"]');
    await expect(page.locator('[data-testid="saved-offline"]')).toBeVisible();
  });

  test('AI-Powered Analytics and Recommendations', async ({ page }) => {
    await loginUser(page);

    // Navigate to Analytics
    await page.click('[data-testid="nav-analytics"]');
    await waitForPageLoad(page);

    // Test computer vision quality analysis
    await page.click('[data-testid="quality-analysis-tab"]');
    await page.setInputFiles('[data-testid="analysis-image"]', 'pavement-sample.jpg');
    await page.click('[data-testid="analyze-quality"]');

    // Wait for AI analysis
    await expect(page.locator('[data-testid="analysis-loading"]')).toBeVisible();
    await expect(page.locator('[data-testid="quality-score"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="defect-analysis"]')).toBeVisible();

    // Test predictive maintenance
    await page.click('[data-testid="predictive-maintenance-tab"]');
    await page.selectOption('[data-testid="equipment-select"]', 'equipment-1');
    await page.click('[data-testid="predict-failure"]');

    await expect(page.locator('[data-testid="failure-risk"]')).toBeVisible();
    await expect(page.locator('[data-testid="maintenance-recommendations"]')).toBeVisible();

    // Test cost optimization
    await page.click('[data-testid="cost-optimization-tab"]');
    await page.selectOption('[data-testid="project-select"]', 'project-1');
    await page.click('[data-testid="optimize-costs"]');

    await expect(page.locator('[data-testid="cost-savings"]')).toBeVisible();
    await expect(page.locator('[data-testid="optimization-suggestions"]')).toBeVisible();
  });

  test('Complete System Integration Test', async ({ page }) => {
    await loginUser(page);

    // Test dashboard overview
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="weather-widget"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-status"]')).toBeVisible();

    // Test navigation between all major sections
    const navItems = [
      'nav-projects',
      'nav-materials',
      'nav-equipment',
      'nav-weather',
      'nav-team',
      'nav-estimates',
      'nav-analytics',
      'nav-mobile',
    ];

    for (const navItem of navItems) {
      await page.click(`[data-testid="${navItem}"]`);
      await waitForPageLoad(page);
      await expect(page.locator('[data-testid="page-content"]')).toBeVisible();
    }

    // Test search functionality
    await page.fill('[data-testid="global-search"]', 'Highway 101');
    await page.press('[data-testid="global-search"]', 'Enter');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();

    // Test notification system
    await page.click('[data-testid="notifications-bell"]');
    await expect(page.locator('[data-testid="notifications-panel"]')).toBeVisible();

    // Test user profile and settings
    await page.click('[data-testid="user-profile"]');
    await expect(page.locator('[data-testid="profile-menu"]')).toBeVisible();

    await page.click('[data-testid="settings-link"]');
    await expect(page.locator('[data-testid="settings-page"]')).toBeVisible();
  });

  test('Performance and Load Testing', async ({ page }) => {
    await loginUser(page);

    // Test large data set handling
    await page.click('[data-testid="nav-projects"]');

    // Simulate creating multiple projects rapidly
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="create-project-button"]');
      await page.fill('[data-testid="project-name"]', `Load Test Project ${i + 1}`);
      await page.fill('[data-testid="project-address"]', `${i + 1}00 Test St`);
      await page.click('[data-testid="save-project-button"]');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    }

    // Test pagination and filtering
    await page.click('[data-testid="projects-list-link"]');
    await expect(page.locator('[data-testid="project-item"]')).toHaveCount.toBeGreaterThan(5);

    // Test filtering
    await page.fill('[data-testid="project-filter"]', 'Load Test');
    await expect(page.locator('[data-testid="project-item"]')).toHaveCount(5);

    // Test sorting
    await page.click('[data-testid="sort-by-name"]');
    await expect(page.locator('[data-testid="project-item"]').first()).toContainText('Load Test Project 1');
  });
});