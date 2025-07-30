import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('Running global setup...');
  
  // You can perform any global setup here
  // For example, starting a test database, clearing cache, etc.
  
  return Promise.resolve();
}

export default globalSetup;