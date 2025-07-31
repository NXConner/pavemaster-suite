/**
 * Core Integration Hub Types
 * Extracted from the main integrationHub.ts for better modularity
 */

export interface IntegrationHub {
  id: string;
  name: string;
  connectors: SoftwareConnector[];
  workflows: IntegrationWorkflow[];
  mappings: DataMapping[];
  marketplace: IntegrationMarketplace;
  monitoring: IntegrationMonitoring;
  security: IntegrationSecurity;
  governance: IntegrationGovernance;
  analytics: IntegrationAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftwareConnector {
  id: string;
  name: string;
  vendor: SoftwareVendor;
  category: SoftwareCategory;
  configuration: ConnectorConfig;
  authentication: ConnectorAuth;
  endpoints: ConnectorEndpoint[];
  capabilities: ConnectorCapabilities;
  status: ConnectorStatus;
  metadata: ConnectorMetadata;
  testing: ConnectorTesting;
  documentation: ConnectorDocumentation;
  support: ConnectorSupport;
  lifecycle: ConnectorLifecycle;
}

export interface SoftwareVendor {
  name: string;
  website: string;
  contact: VendorContact;
  certification: VendorCertification;
  partnership: PartnershipLevel;
  support: VendorSupport;
  compliance: VendorCompliance;
}

export interface VendorContact {
  technical: ContactInfo;
  business: ContactInfo;
  support: ContactInfo;
  emergency: ContactInfo;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  role: string;
  timezone: string;
  availability: string;
}

// Additional core types
export type SoftwareCategory = 'accounting' | 'project-management' | 'design' | 'field-management' | 'hr' | 'fleet' | 'other';
export type ConnectorStatus = 'active' | 'inactive' | 'testing' | 'deprecated' | 'error';
export type PartnershipLevel = 'basic' | 'certified' | 'premium' | 'strategic';

// Forward declarations for complex types
export interface IntegrationWorkflow {}
export interface DataMapping {}
export interface IntegrationMarketplace {}
export interface IntegrationMonitoring {}
export interface IntegrationSecurity {}
export interface IntegrationGovernance {}
export interface IntegrationAnalytics {}
export interface ConnectorConfig {}
export interface ConnectorAuth {}
export interface ConnectorEndpoint {}
export interface ConnectorCapabilities {}
export interface ConnectorMetadata {}
export interface ConnectorTesting {}
export interface ConnectorDocumentation {}
export interface ConnectorSupport {}
export interface ConnectorLifecycle {}
export interface VendorCertification {}
export interface VendorSupport {}
export interface VendorCompliance {}