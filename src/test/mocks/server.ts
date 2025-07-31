// MSW Server Setup for Testing
// Provides API mocking for unit and integration tests

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server with request handlers
export const server = setupServer(...handlers);