import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('Running global teardown...');
  
  // You can perform any global cleanup here
  // For example, stopping a test database, clearing temporary files, etc.
  
  return Promise.resolve();
}

export default globalTeardown;