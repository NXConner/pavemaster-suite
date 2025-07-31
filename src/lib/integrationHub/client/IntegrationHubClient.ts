/**
 * Integration Hub Client - Lightweight Interface
 * Provides essential functionality without loading the entire hub
 */

import { performanceMonitor } from '../../performance';
import type { IntegrationHub, SoftwareConnector } from '../types/core';

export class IntegrationHubClient {
  private static instance: IntegrationHubClient;
  private loadedModules = new Map<string, any>();

  private constructor() {
    performanceMonitor.recordMetric('integration_hub_client_init', performance.now(), 'ms');
  }

  public static getInstance(): IntegrationHubClient {
    if (!IntegrationHubClient.instance) {
      IntegrationHubClient.instance = new IntegrationHubClient();
    }
    return IntegrationHubClient.instance;
  }

  /**
   * Lazy load integration hub manager
   */
  async getIntegrationHub(): Promise<any> {
    if (!this.loadedModules.has('hub')) {
      const startTime = performance.now();
      const { IntegrationHubManager } = await import('../core/IntegrationHubManager');
      this.loadedModules.set('hub', new IntegrationHubManager());
      performanceMonitor.recordMetric('integration_hub_lazy_load', performance.now() - startTime, 'ms');
    }
    return this.loadedModules.get('hub');
  }

  /**
   * Lazy load connector factory
   */
  async getConnectorFactory(): Promise<any> {
    if (!this.loadedModules.has('connectors')) {
      const startTime = performance.now();
      const { SoftwareConnectorFactory } = await import('../connectors/SoftwareConnectorFactory');
      this.loadedModules.set('connectors', new SoftwareConnectorFactory());
      performanceMonitor.recordMetric('connector_factory_lazy_load', performance.now() - startTime, 'ms');
    }
    return this.loadedModules.get('connectors');
  }

  /**
   * Lazy load workflow engine
   */
  async getWorkflowEngine(): Promise<any> {
    if (!this.loadedModules.has('workflows')) {
      const startTime = performance.now();
      const { WorkflowEngine } = await import('../workflows/WorkflowEngine');
      this.loadedModules.set('workflows', new WorkflowEngine());
      performanceMonitor.recordMetric('workflow_engine_lazy_load', performance.now() - startTime, 'ms');
    }
    return this.loadedModules.get('workflows');
  }

  /**
   * Get basic connector information without loading full implementation
   */
  getBasicConnectorInfo(): { name: string; category: string; status: string }[] {
    // Return cached basic info without loading full connectors
    return [
      { name: 'QuickBooks', category: 'accounting', status: 'active' },
      { name: 'Procore', category: 'project-management', status: 'active' },
      { name: 'AutoCAD', category: 'design', status: 'active' },
      { name: 'FieldLens', category: 'field-management', status: 'active' },
    ];
  }

  /**
   * Preload critical modules for better performance
   */
  async preloadCriticalModules(): Promise<void> {
    const startTime = performance.now();
    
    // Preload in parallel for better performance
    await Promise.all([
      this.getIntegrationHub(),
      this.getConnectorFactory()
    ]);

    performanceMonitor.recordMetric('integration_hub_preload', performance.now() - startTime, 'ms');
  }

  /**
   * Clear loaded modules to free memory
   */
  clearCache(): void {
    this.loadedModules.clear();
    performanceMonitor.recordMetric('integration_hub_cache_clear', performance.now(), 'ms');
  }
}