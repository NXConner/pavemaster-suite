/**
 * Integration Hub - Modular Architecture
 * Breaking down the large integrationHub.ts into manageable modules
 */

// Core exports - lazy loaded for performance
export type { IntegrationHub, SoftwareConnector } from './types/core';
export type { IntegrationWorkflow, DataMapping } from './types/workflows';
export type { IntegrationMarketplace, IntegrationMonitoring } from './types/marketplace';

// Lazy-loaded modules for better performance
export const createIntegrationHub = () => import('./core/IntegrationHubManager').then(m => m.IntegrationHubManager);
export const createSoftwareConnector = () => import('./connectors/SoftwareConnectorFactory').then(m => m.SoftwareConnectorFactory);
export const createWorkflowEngine = () => import('./workflows/WorkflowEngine').then(m => m.WorkflowEngine);
export const createMarketplace = () => import('./marketplace/IntegrationMarketplace').then(m => m.IntegrationMarketplace);

// Performance optimized exports
export { IntegrationHubClient } from './client/IntegrationHubClient';
export { IntegrationUtils } from './utils/IntegrationUtils';