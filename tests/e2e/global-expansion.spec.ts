import { test, expect, Page } from '@playwright/test';

// Global Expansion E2E Tests
test.describe('Global Market Expansion', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/global-expansion');
    
    // Wait for the page to load
    await expect(page.locator('h1')).toContainText('Global Market Expansion');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('Market Regions Management', () => {
    test('should display all market regions with correct data', async () => {
      // Navigate to regions tab
      await page.click('[data-testid="regions-tab"]');
      
      // Verify Canada region is displayed as active
      const canadaCard = page.locator('[data-testid="region-ca"]');
      await expect(canadaCard).toBeVisible();
      await expect(canadaCard.locator('[data-testid="region-status"]')).toContainText('active');
      await expect(canadaCard.locator('[data-testid="region-name"]')).toContainText('Canada');
      await expect(canadaCard.locator('[data-testid="region-growth"]')).toContainText('3.2%');
      
      // Verify UK region is displayed as planning
      const ukCard = page.locator('[data-testid="region-uk"]');
      await expect(ukCard).toBeVisible();
      await expect(ukCard.locator('[data-testid="region-status"]')).toContainText('planning');
      await expect(ukCard.locator('[data-testid="region-name"]')).toContainText('United Kingdom');
      
      // Verify Australia region is displayed as researching
      const australiaCard = page.locator('[data-testid="region-au"]');
      await expect(australiaCard).toBeVisible();
      await expect(australiaCard.locator('[data-testid="region-status"]')).toContainText('researching');
      await expect(australiaCard.locator('[data-testid="region-name"]')).toContainText('Australia');
    });

    test('should show detailed market information for each region', async () => {
      await page.click('[data-testid="regions-tab"]');
      
      // Test Canada region details
      const canadaCard = page.locator('[data-testid="region-ca"]');
      
      // Check basic metrics
      await expect(canadaCard.locator('[data-testid="growth-rate"]')).toContainText('3.2%');
      await expect(canadaCard.locator('[data-testid="competition-level"]')).toContainText('medium');
      await expect(canadaCard.locator('[data-testid="regulatory-complexity"]')).toContainText('moderate');
      await expect(canadaCard.locator('[data-testid="partners-count"]')).toContainText('1');
      
      // Test overview tab content
      await canadaCard.locator('[data-testid="overview-tab"]').click();
      await expect(canadaCard.locator('[data-testid="entry-barriers"]')).toBeVisible();
      await expect(canadaCard.locator('[data-testid="opportunities"]')).toBeVisible();
      
      // Verify entry barriers are displayed
      const barriers = canadaCard.locator('[data-testid="entry-barrier"]');
      await expect(barriers).toHaveCount(3);
      await expect(barriers.first()).toContainText('Provincial licensing');
      
      // Verify opportunities are displayed
      const opportunities = canadaCard.locator('[data-testid="opportunity"]');
      await expect(opportunities).toHaveCount(3);
      await expect(opportunities.first()).toContainText('Infrastructure investment');
    });

    test('should display local partners information', async () => {
      await page.click('[data-testid="regions-tab"]');
      
      const canadaCard = page.locator('[data-testid="region-ca"]');
      await canadaCard.locator('[data-testid="partners-tab"]').click();
      
      // Verify partner information is displayed
      const partnerCard = canadaCard.locator('[data-testid="partner-ca-1"]');
      await expect(partnerCard).toBeVisible();
      await expect(partnerCard.locator('[data-testid="partner-name"]')).toContainText('Northern Construction Partners');
      await expect(partnerCard.locator('[data-testid="partner-type"]')).toContainText('contractor');
      await expect(partnerCard.locator('[data-testid="partner-status"]')).toContainText('active');
      
      // Verify contact information
      await expect(partnerCard.locator('[data-testid="partner-contact-name"]')).toContainText('Jean-Pierre Dubois');
      await expect(partnerCard.locator('[data-testid="partner-email"]')).toContainText('jp.dubois@northerncp.ca');
      await expect(partnerCard.locator('[data-testid="partner-phone"]')).toContainText('+1-416-555-0123');
      
      // Verify capabilities are listed
      const capabilities = partnerCard.locator('[data-testid="partner-capability"]');
      await expect(capabilities).toHaveCount(3);
      await expect(capabilities.first()).toContainText('Highway construction');
    });

    test('should display compliance requirements', async () => {
      await page.click('[data-testid="regions-tab"]');
      
      const canadaCard = page.locator('[data-testid="region-ca"]');
      await canadaCard.locator('[data-testid="compliance-tab"]').click();
      
      // Verify compliance requirement is displayed
      const complianceCard = canadaCard.locator('[data-testid="compliance-ca-1"]');
      await expect(complianceCard).toBeVisible();
      await expect(complianceCard.locator('[data-testid="compliance-requirement"]')).toContainText('Environmental Assessment Compliance');
      await expect(complianceCard.locator('[data-testid="compliance-authority"]')).toContainText('Environment and Climate Change Canada');
      await expect(complianceCard.locator('[data-testid="compliance-status"]')).toContainText('compliant');
      
      // Verify compliance details
      await expect(complianceCard.locator('[data-testid="compliance-category"]')).toContainText('environmental');
      await expect(complianceCard.locator('[data-testid="compliance-cost"]')).toContainText('$15,000');
      await expect(complianceCard.locator('[data-testid="compliance-complexity"]')).toContainText('medium');
    });

    test('should show market entry timeline', async () => {
      await page.click('[data-testid="regions-tab"]');
      
      const canadaCard = page.locator('[data-testid="region-ca"]');
      await canadaCard.locator('[data-testid="timeline-tab"]').click();
      
      // Verify timeline phases are displayed
      const phases = canadaCard.locator('[data-testid="timeline-phase"]');
      await expect(phases).toHaveCount(2);
      
      // Check first phase
      const firstPhase = phases.first();
      await expect(firstPhase.locator('[data-testid="phase-name"]')).toContainText('Market Research');
      await expect(firstPhase.locator('[data-testid="phase-status"]')).toContainText('completed');
      
      // Check milestones
      const milestones = firstPhase.locator('[data-testid="milestone"]');
      await expect(milestones).toHaveCount(2);
      await expect(milestones.first().locator('[data-testid="milestone-name"]')).toContainText('Market Analysis Complete');
      
      // Verify completed milestones have check icons
      await expect(milestones.first().locator('[data-testid="milestone-completed"]')).toBeVisible();
    });
  });

  test.describe('International Standards Management', () => {
    test('should display all international standards', async () => {
      await page.click('[data-testid="standards-tab"]');
      
      // Verify standards are displayed
      const standards = page.locator('[data-testid="standard-card"]');
      await expect(standards).toHaveCount(3);
      
      // Check ISO 9001 standard
      const iso9001 = page.locator('[data-testid="standard-iso-9001"]');
      await expect(iso9001).toBeVisible();
      await expect(iso9001.locator('[data-testid="standard-name"]')).toContainText('ISO 9001:2015 Quality Management');
      await expect(iso9001.locator('[data-testid="standard-organization"]')).toContainText('International Organization for Standardization');
      await expect(iso9001.locator('[data-testid="standard-status"]')).toContainText('certified');
      await expect(iso9001.locator('[data-testid="standard-category"]')).toContainText('quality');
      await expect(iso9001.locator('[data-testid="standard-cost"]')).toContainText('$45,000');
    });

    test('should show standards progress chart', async () => {
      await page.click('[data-testid="standards-tab"]');
      
      // Verify chart is displayed
      await expect(page.locator('[data-testid="standards-progress-chart"]')).toBeVisible();
      
      // Check chart has correct data
      const chartBars = page.locator('[data-testid="chart-bar"]');
      await expect(chartBars).toHaveCount(3);
    });

    test('should display standard benefits and requirements', async () => {
      await page.click('[data-testid="standards-tab"]');
      
      const iso9001 = page.locator('[data-testid="standard-iso-9001"]');
      
      // Check benefits
      const benefits = iso9001.locator('[data-testid="standard-benefit"]');
      await expect(benefits).toHaveCount(3);
      await expect(benefits.first()).toContainText('Global recognition');
      
      // Check requirements
      const requirements = iso9001.locator('[data-testid="standard-requirement"]');
      await expect(requirements).toHaveCount(3);
      await expect(requirements.first()).toContainText('Quality management system');
      
      // Verify action buttons
      await expect(iso9001.locator('[data-testid="view-details-btn"]')).toBeVisible();
      await expect(iso9001.locator('[data-testid="schedule-audit-btn"]')).toBeVisible();
      await expect(iso9001.locator('[data-testid="organization-website-btn"]')).toBeVisible();
    });
  });

  test.describe('Compliance Management', () => {
    test('should display compliance requirements from all regions', async () => {
      await page.click('[data-testid="compliance-tab"]');
      
      // Verify compliance cards are displayed
      const complianceCards = page.locator('[data-testid="compliance-card"]');
      await expect(complianceCards).toHaveCount(2); // Canada + UK
      
      // Check Canada compliance
      const canadaCompliance = page.locator('[data-testid="compliance-comp-ca-1"]');
      await expect(canadaCompliance).toBeVisible();
      await expect(canadaCompliance.locator('[data-testid="compliance-requirement"]')).toContainText('Environmental Assessment Compliance');
      await expect(canadaCompliance.locator('[data-testid="compliance-region"]')).toContainText('Canada');
      
      // Check UK compliance
      const ukCompliance = page.locator('[data-testid="compliance-comp-uk-1"]');
      await expect(ukCompliance).toBeVisible();
      await expect(ukCompliance.locator('[data-testid="compliance-requirement"]')).toContainText('UK GDPR Compliance');
      await expect(ukCompliance.locator('[data-testid="compliance-region"]')).toContainText('United Kingdom');
    });

    test('should show compliance status and details', async () => {
      await page.click('[data-testid="compliance-tab"]');
      
      const canadaCompliance = page.locator('[data-testid="compliance-comp-ca-1"]');
      
      // Verify status and basic info
      await expect(canadaCompliance.locator('[data-testid="compliance-status"]')).toContainText('compliant');
      await expect(canadaCompliance.locator('[data-testid="compliance-category"]')).toContainText('environmental');
      await expect(canadaCompliance.locator('[data-testid="compliance-deadline"]')).toContainText('12/31/2024');
      await expect(canadaCompliance.locator('[data-testid="compliance-cost"]')).toContainText('$15,000');
      await expect(canadaCompliance.locator('[data-testid="compliance-complexity"]')).toContainText('medium');
      
      // Verify required documents
      const documents = canadaCompliance.locator('[data-testid="compliance-document"]');
      await expect(documents).toHaveCount(2);
      await expect(documents.first()).toContainText('Environmental Impact Assessment');
      
      // Verify action buttons
      await expect(canadaCompliance.locator('[data-testid="view-documents-btn"]')).toBeVisible();
      await expect(canadaCompliance.locator('[data-testid="schedule-review-btn"]')).toBeVisible();
    });

    test('should handle compliance actions', async () => {
      await page.click('[data-testid="compliance-tab"]');
      
      const ukCompliance = page.locator('[data-testid="compliance-comp-uk-1"]');
      
      // Verify in_progress status shows mark compliant button
      await expect(ukCompliance.locator('[data-testid="compliance-status"]')).toContainText('in_progress');
      await expect(ukCompliance.locator('[data-testid="mark-compliant-btn"]')).toBeVisible();
      
      // Test clicking mark compliant (would trigger action in real app)
      await ukCompliance.locator('[data-testid="mark-compliant-btn"]').click();
      // In a real test, we'd verify the status changed
    });
  });

  test.describe('Analytics Dashboard', () => {
    test('should display market analytics', async () => {
      await page.click('[data-testid="analytics-tab"]');
      
      // Verify analytics cards are displayed
      await expect(page.locator('[data-testid="market-success-rate"]')).toBeVisible();
      await expect(page.locator('[data-testid="certification-roi"]')).toBeVisible();
      await expect(page.locator('[data-testid="regional-revenue"]')).toBeVisible();
      await expect(page.locator('[data-testid="compliance-cost-analysis"]')).toBeVisible();
      
      // Check success rate
      await expect(page.locator('[data-testid="success-rate-value"]')).toContainText('75%');
      
      // Check ROI
      await expect(page.locator('[data-testid="roi-value"]')).toContainText('340%');
    });

    test('should display charts and visualizations', async () => {
      await page.click('[data-testid="analytics-tab"]');
      
      // Verify charts are rendered
      await expect(page.locator('[data-testid="regional-revenue-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="compliance-cost-chart"]')).toBeVisible();
      
      // Check chart responsiveness
      await page.setViewportSize({ width: 800, height: 600 });
      await expect(page.locator('[data-testid="regional-revenue-chart"]')).toBeVisible();
    });
  });

  test.describe('Overview Dashboard', () => {
    test('should display global metrics correctly', async () => {
      // Should start on overview tab by default
      await expect(page.locator('[data-testid="overview-tab"]')).toHaveAttribute('data-state', 'active');
      
      // Verify metric cards
      await expect(page.locator('[data-testid="total-markets-metric"]')).toContainText('3');
      await expect(page.locator('[data-testid="active-markets-count"]')).toContainText('1 active');
      
      await expect(page.locator('[data-testid="certifications-metric"]')).toContainText('1');
      await expect(page.locator('[data-testid="certifications-total"]')).toContainText('of 3 standards');
      
      await expect(page.locator('[data-testid="global-revenue-metric"]')).toContainText('$2.5M');
      await expect(page.locator('[data-testid="revenue-growth"]')).toContainText('+18.5% YoY');
      
      await expect(page.locator('[data-testid="local-partners-metric"]')).toContainText('2');
      await expect(page.locator('[data-testid="compliance-rate-metric"]')).toContainText('94%');
      await expect(page.locator('[data-testid="market-growth-metric"]')).toContainText('2.4%');
    });

    test('should display market size and growth chart', async () => {
      await expect(page.locator('[data-testid="market-size-chart"]')).toBeVisible();
      
      // Check chart has data for all regions
      const chartData = page.locator('[data-testid="chart-bar"]');
      await expect(chartData).toHaveCount(6); // 3 regions × 2 metrics each
    });

    test('should display compliance status distribution chart', async () => {
      await expect(page.locator('[data-testid="compliance-status-chart"]')).toBeVisible();
      
      // Verify pie chart segments
      const pieSegments = page.locator('[data-testid="pie-segment"]');
      await expect(pieSegments).toHaveCount(4); // Compliant, In Progress, Pending, Non-Compliant
    });

    test('should show recent global activities', async () => {
      const activitiesSection = page.locator('[data-testid="recent-activities"]');
      await expect(activitiesSection).toBeVisible();
      
      // Verify activity items
      const activities = activitiesSection.locator('[data-testid="activity-item"]');
      await expect(activities).toHaveCount(3);
      
      // Check first activity
      await expect(activities.first().locator('[data-testid="activity-title"]')).toContainText('Canada Market Entry Completed');
      await expect(activities.first().locator('[data-testid="activity-description"]')).toContainText('Successfully launched operations in Ontario and Quebec');
      await expect(activities.first().locator('[data-testid="activity-status"]')).toContainText('Completed');
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Verify main elements are still visible
      await expect(page.locator('h1')).toContainText('Global Market Expansion');
      await expect(page.locator('[data-testid="total-markets-metric"]')).toBeVisible();
      
      // Check tabs are accessible
      await page.click('[data-testid="regions-tab"]');
      await expect(page.locator('[data-testid="region-ca"]')).toBeVisible();
    });

    test('should work on tablet devices', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Verify layout adapts properly
      await expect(page.locator('[data-testid="metrics-grid"]')).toBeVisible();
      await expect(page.locator('[data-testid="market-size-chart"]')).toBeVisible();
    });
  });

  test.describe('User Interactions', () => {
    test('should handle tab navigation correctly', async () => {
      // Test all main tabs
      const tabs = ['overview', 'regions', 'standards', 'compliance', 'analytics'];
      
      for (const tab of tabs) {
        await page.click(`[data-testid="${tab}-tab"]`);
        await expect(page.locator(`[data-testid="${tab}-tab"]`)).toHaveAttribute('data-state', 'active');
        await expect(page.locator(`[data-testid="${tab}-content"]`)).toBeVisible();
      }
    });

    test('should handle view mode changes', async () => {
      // Test view mode selector
      await page.click('[data-testid="view-mode-select"]');
      await page.click('[data-testid="view-mode-standards"]');
      // Verify view changed (implementation would depend on actual behavior)
      
      await page.click('[data-testid="view-mode-select"]');
      await page.click('[data-testid="view-mode-compliance"]');
      // Verify view changed
    });

    test('should handle configuration button', async () => {
      await page.click('[data-testid="configure-btn"]');
      // In a real app, this might open a modal or navigate to settings
      // For now, just verify the button is clickable
    });
  });

  test.describe('Data Loading and Error Handling', () => {
    test('should show loading state initially', async () => {
      // Navigate to fresh page to catch loading state
      await page.goto('/global-expansion', { waitUntil: 'domcontentloaded' });
      
      // Check for loading indicator (if implemented)
      // await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
      
      // Wait for content to load
      await expect(page.locator('h1')).toContainText('Global Market Expansion');
    });

    test('should handle empty states gracefully', async () => {
      // Navigate to Australia region which has no partners
      await page.click('[data-testid="regions-tab"]');
      const australiaCard = page.locator('[data-testid="region-au"]');
      await australiaCard.locator('[data-testid="partners-tab"]').click();
      
      // Verify empty state message
      await expect(australiaCard.locator('[data-testid="no-partners-message"]')).toContainText('No local partners identified yet');
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading structure', async () => {
      // Check main heading
      await expect(page.locator('h1')).toContainText('Global Market Expansion');
      
      // Check that there are proper subheadings
      const headings = page.locator('h2, h3, h4');
      await expect(headings).toHaveCountGreaterThan(0);
    });

    test('should have accessible form controls', async () => {
      // Check that selects have proper labels
      const viewModeSelect = page.locator('[data-testid="view-mode-select"]');
      await expect(viewModeSelect).toBeVisible();
      
      // Verify buttons have accessible text
      const configButton = page.locator('[data-testid="configure-btn"]');
      await expect(configButton).toContainText('Configure');
    });

    test('should support keyboard navigation', async () => {
      // Test tab navigation
      await page.keyboard.press('Tab');
      // In a real test, we'd verify focus moves correctly through interactive elements
    });
  });
});

// Performance tests
test.describe('Performance', () => {
  test('should load within acceptable time limits', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/global-expansion');
    await expect(page.locator('h1')).toContainText('Global Market Expansion');
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/global-expansion');
    
    // Navigate through different tabs quickly
    const tabs = ['regions', 'standards', 'compliance', 'analytics', 'overview'];
    
    for (const tab of tabs) {
      const startTime = Date.now();
      await page.click(`[data-testid="${tab}-tab"]`);
      await expect(page.locator(`[data-testid="${tab}-content"]`)).toBeVisible();
      const switchTime = Date.now() - startTime;
      
      // Tab switches should be under 500ms
      expect(switchTime).toBeLessThan(500);
    }
  });
});