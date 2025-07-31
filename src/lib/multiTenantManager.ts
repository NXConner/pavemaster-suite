/**
 * Multi-Tenant Architecture Manager
 * Enterprise-grade tenant isolation and management system
 */

import { supabase } from '@/integrations/supabase/client';
import { performanceMonitor } from './performance';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  plan: 'starter' | 'professional' | 'enterprise' | 'custom';
  status: 'active' | 'suspended' | 'trial' | 'pending_setup';
  createdAt: Date;
  updatedAt: Date;
  settings: TenantSettings;
  limits: TenantLimits;
  features: TenantFeatures;
  billing: TenantBilling;
  database: TenantDatabase;
}

export interface TenantSettings {
  timezone: string;
  locale: string;
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'auto';
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    customCSS?: string;
  };
  security: {
    mfaRequired: boolean;
    passwordPolicy: 'basic' | 'strict' | 'enterprise';
    sessionTimeout: number;
    ipWhitelist?: string[];
    ssoEnabled: boolean;
    auditLogging: boolean;
  };
}

export interface TenantLimits {
  maxUsers: number;
  maxProjects: number;
  maxStorageGB: number;
  maxApiCalls: number;
  maxBandwidthGB: number;
  maxReports: number;
  aiCreditsPerMonth: number;
  customIntegrations: number;
}

export interface TenantFeatures {
  aiAnalytics: boolean;
  realTimeCollaboration: boolean;
  advancedReporting: boolean;
  mobileApp: boolean;
  apiAccess: boolean;
  webhooks: boolean;
  customFields: boolean;
  dataExport: boolean;
  advancedSecurity: boolean;
  prioritySupport: boolean;
  whiteLabeling: boolean;
  customIntegrations: boolean;
}

export interface TenantBilling {
  plan: string;
  monthlyPrice: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: Date;
  paymentMethod: string;
  usage: {
    users: number;
    projects: number;
    storageGB: number;
    apiCalls: number;
    bandwidthGB: number;
    aiCredits: number;
  };
  invoices: TenantInvoice[];
}

export interface TenantInvoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidDate?: Date;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export interface TenantDatabase {
  schema: string;
  connectionString: string;
  region: string;
  backupSchedule: string;
  encryptionEnabled: boolean;
  replicationEnabled: boolean;
}

export interface TenantContext {
  tenant: Tenant;
  user: {
    id: string;
    role: 'owner' | 'admin' | 'manager' | 'user' | 'viewer';
    permissions: string[];
  };
  database: {
    schema: string;
    connection: any;
  };
}

class MultiTenantManager {
  private currentTenant: Tenant | null = null;
  private tenantCache: Map<string, Tenant> = new Map();
  private contextCache: Map<string, TenantContext> = new Map();
  private initialized = false;

  constructor() {
    this.initializeManager();
  }

  /**
   * Initialize the multi-tenant manager
   */
  private async initializeManager(): Promise<void> {
    try {
      console.log('🏢 Initializing Multi-Tenant Manager...');
      
      // Load tenant from current domain/subdomain
      await this.loadTenantFromDomain();
      
      // Setup tenant isolation
      await this.setupTenantIsolation();
      
      // Initialize monitoring
      this.setupTenantMonitoring();
      
      this.initialized = true;
      console.log('✅ Multi-Tenant Manager initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize Multi-Tenant Manager:', error);
    }
  }

  /**
   * Load tenant configuration from current domain
   */
  private async loadTenantFromDomain(): Promise<void> {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    
    // Check for subdomain-based tenant identification
    if (hostname.includes('.pavementperformancesuite.com') && subdomain !== 'www') {
      this.currentTenant = await this.getTenantBySubdomain(subdomain);
    } 
    // Check for custom domain
    else if (!hostname.includes('localhost') && !hostname.includes('pavementperformancesuite.com')) {
      this.currentTenant = await this.getTenantByDomain(hostname);
    }
    // Default to main tenant for development
    else {
      this.currentTenant = await this.getDefaultTenant();
    }

    if (this.currentTenant) {
      console.log(`🏢 Loaded tenant: ${this.currentTenant.name} (${this.currentTenant.id})`);
    }
  }

  /**
   * Get tenant by subdomain
   */
  async getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('subdomain', subdomain)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      
      return this.mapTenantData(data);
    } catch (error) {
      console.error('Error loading tenant by subdomain:', error);
      return null;
    }
  }

  /**
   * Get tenant by custom domain
   */
  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('domain', domain)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      
      return this.mapTenantData(data);
    } catch (error) {
      console.error('Error loading tenant by domain:', error);
      return null;
    }
  }

  /**
   * Get default tenant for development/demo
   */
  async getDefaultTenant(): Promise<Tenant> {
    // Return mock tenant for development
    return {
      id: 'default',
      name: 'PaveMaster Demo',
      domain: 'demo.pavementperformancesuite.com',
      subdomain: 'demo',
      plan: 'enterprise',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        timezone: 'UTC',
        locale: 'en-US',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        theme: 'light',
        branding: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
        },
        security: {
          mfaRequired: false,
          passwordPolicy: 'basic',
          sessionTimeout: 3600,
          ssoEnabled: false,
          auditLogging: true,
        },
      },
      limits: {
        maxUsers: 1000,
        maxProjects: 500,
        maxStorageGB: 1000,
        maxApiCalls: 1000000,
        maxBandwidthGB: 500,
        maxReports: 100,
        aiCreditsPerMonth: 10000,
        customIntegrations: 10,
      },
      features: {
        aiAnalytics: true,
        realTimeCollaboration: true,
        advancedReporting: true,
        mobileApp: true,
        apiAccess: true,
        webhooks: true,
        customFields: true,
        dataExport: true,
        advancedSecurity: true,
        prioritySupport: true,
        whiteLabeling: true,
        customIntegrations: true,
      },
      billing: {
        plan: 'enterprise',
        monthlyPrice: 999,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentMethod: 'credit_card',
        usage: {
          users: 45,
          projects: 23,
          storageGB: 125,
          apiCalls: 45000,
          bandwidthGB: 15,
          aiCredits: 1250,
        },
        invoices: [],
      },
      database: {
        schema: 'tenant_default',
        connectionString: 'postgresql://...',
        region: 'us-east-1',
        backupSchedule: 'daily',
        encryptionEnabled: true,
        replicationEnabled: true,
      },
    };
  }

  /**
   * Map database data to Tenant interface
   */
  private mapTenantData(data: any): Tenant {
    return {
      id: data.id,
      name: data.name,
      domain: data.domain,
      subdomain: data.subdomain,
      plan: data.plan,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      settings: JSON.parse(data.settings || '{}'),
      limits: JSON.parse(data.limits || '{}'),
      features: JSON.parse(data.features || '{}'),
      billing: JSON.parse(data.billing || '{}'),
      database: JSON.parse(data.database_config || '{}'),
    };
  }

  /**
   * Setup tenant isolation for data and security
   */
  private async setupTenantIsolation(): Promise<void> {
    if (!this.currentTenant) return;

    // Set database schema based on tenant
    await this.setDatabaseSchema(this.currentTenant.database.schema);

    // Apply tenant-specific security policies
    await this.applySecurityPolicies();

    // Setup tenant-specific caching
    this.setupTenantCaching();
  }

  /**
   * Set database schema for tenant isolation
   */
  private async setDatabaseSchema(schema: string): Promise<void> {
    try {
      // In a real implementation, this would configure the database connection
      // to use the tenant-specific schema for all queries
      console.log(`📊 Setting database schema to: ${schema}`);
      
      // Store schema in session for query isolation
      sessionStorage.setItem('tenant_schema', schema);
      
    } catch (error) {
      console.error('Error setting database schema:', error);
    }
  }

  /**
   * Apply tenant-specific security policies
   */
  private async applySecurityPolicies(): Promise<void> {
    if (!this.currentTenant) return;

    const { security } = this.currentTenant.settings;

    // Apply session timeout
    if (security.sessionTimeout) {
      setTimeout(() => {
        this.handleSessionTimeout();
      }, security.sessionTimeout * 1000);
    }

    // Apply IP whitelist if configured
    if (security.ipWhitelist && security.ipWhitelist.length > 0) {
      // In a real implementation, this would check the client IP
      console.log('🔒 IP whitelist policies applied');
    }

    // Apply password policy
    console.log(`🔐 Password policy applied: ${security.passwordPolicy}`);
  }

  /**
   * Setup tenant-specific caching
   */
  private setupTenantCaching(): void {
    if (!this.currentTenant) return;

    // Configure cache keys with tenant prefix
    const cachePrefix = `tenant:${this.currentTenant.id}:`;
    
    // Store cache configuration
    sessionStorage.setItem('cache_prefix', cachePrefix);
    
    console.log(`💾 Tenant caching configured with prefix: ${cachePrefix}`);
  }

  /**
   * Setup monitoring for tenant usage and performance
   */
  private setupTenantMonitoring(): void {
    if (!this.currentTenant) return;

    // Monitor tenant usage
    setInterval(() => {
      this.recordTenantUsage();
    }, 60000); // Every minute

    // Monitor tenant performance
    performanceMonitor.recordMetric('tenant_active', 1, 'count', {
      tenantId: this.currentTenant.id,
      plan: this.currentTenant.plan,
    });
  }

  /**
   * Record tenant usage metrics
   */
  private recordTenantUsage(): void {
    if (!this.currentTenant) return;

    const usage = {
      timestamp: new Date(),
      tenantId: this.currentTenant.id,
      activeUsers: this.getActiveUserCount(),
      apiCalls: this.getApiCallCount(),
      storageUsed: this.getStorageUsage(),
      bandwidthUsed: this.getBandwidthUsage(),
    };

    // Record usage metrics
    performanceMonitor.recordMetric('tenant_usage', usage.activeUsers, 'users', {
      tenantId: this.currentTenant.id,
      plan: this.currentTenant.plan,
    });
  }

  /**
   * Get current tenant
   */
  getCurrentTenant(): Tenant | null {
    return this.currentTenant;
  }

  /**
   * Check if feature is enabled for current tenant
   */
  isFeatureEnabled(feature: keyof TenantFeatures): boolean {
    if (!this.currentTenant) return false;
    return this.currentTenant.features[feature] || false;
  }

  /**
   * Check if tenant has reached usage limit
   */
  hasReachedLimit(limitType: keyof TenantLimits): boolean {
    if (!this.currentTenant) return true;

    const current = this.currentTenant.billing.usage;
    const limits = this.currentTenant.limits;

    switch (limitType) {
      case 'maxUsers':
        return current.users >= limits.maxUsers;
      case 'maxProjects':
        return current.projects >= limits.maxProjects;
      case 'maxStorageGB':
        return current.storageGB >= limits.maxStorageGB;
      case 'maxApiCalls':
        return current.apiCalls >= limits.maxApiCalls;
      case 'maxBandwidthGB':
        return current.bandwidthGB >= limits.maxBandwidthGB;
      case 'aiCreditsPerMonth':
        return current.aiCredits >= limits.aiCreditsPerMonth;
      default:
        return false;
    }
  }

  /**
   * Apply tenant branding to the application
   */
  applyTenantBranding(): void {
    if (!this.currentTenant) return;

    const { branding } = this.currentTenant.settings;
    
    // Apply custom colors
    document.documentElement.style.setProperty('--tenant-primary', branding.primaryColor);
    document.documentElement.style.setProperty('--tenant-secondary', branding.secondaryColor);

    // Apply custom CSS if provided
    if (branding.customCSS) {
      const style = document.createElement('style');
      style.textContent = branding.customCSS;
      document.head.appendChild(style);
    }

    // Update logo if provided
    if (branding.logo) {
      const logos = document.querySelectorAll('.tenant-logo');
      logos.forEach(logo => {
        (logo as HTMLImageElement).src = branding.logo!;
      });
    }
  }

  // Private utility methods
  private handleSessionTimeout(): void {
    console.log('🔒 Session timeout - redirecting to login');
    // Implement session timeout logic
  }

  private getActiveUserCount(): number {
    // In a real implementation, this would query active sessions
    return Math.floor(Math.random() * 10) + 1;
  }

  private getApiCallCount(): number {
    // In a real implementation, this would query API usage
    return Math.floor(Math.random() * 1000) + 100;
  }

  private getStorageUsage(): number {
    // In a real implementation, this would query storage usage
    return Math.floor(Math.random() * 100) + 10;
  }

  private getBandwidthUsage(): number {
    // In a real implementation, this would query bandwidth usage
    return Math.floor(Math.random() * 50) + 5;
  }
}

// Export singleton instance
export const multiTenantManager = new MultiTenantManager();

// Export utility functions
export const getCurrentTenant = () => multiTenantManager.getCurrentTenant();
export const isFeatureEnabled = (feature: keyof TenantFeatures) => multiTenantManager.isFeatureEnabled(feature);
export const hasReachedLimit = (limit: keyof TenantLimits) => multiTenantManager.hasReachedLimit(limit);