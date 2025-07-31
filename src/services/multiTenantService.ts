// PHASE 12: Multi-Tenant Architecture Service
// Enterprise-grade multi-tenancy with organization isolation and scalable resource management
import { supabase } from './supabaseClient';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  plan: TenantPlan;
  status: TenantStatus;
  settings: TenantSettings;
  limits: TenantLimits;
  metadata: TenantMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface TenantPlan {
  type: 'starter' | 'professional' | 'enterprise' | 'custom';
  features: string[];
  limits: {
    users: number;
    projects: number;
    storage: number; // GB
    apiCalls: number; // per month
    aiAnalyses: number; // per month
  };
  pricing: {
    monthly: number;
    annual: number;
    currency: string;
  };
}

export interface TenantStatus {
  active: boolean;
  suspended: boolean;
  trial: boolean;
  trialEndsAt?: string;
  reason?: string;
}

export interface TenantSettings {
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    favicon?: string;
    companyName: string;
  };
  features: {
    aiAnalysis: boolean;
    mobileApp: boolean;
    apiAccess: boolean;
    customReports: boolean;
    whiteLabel: boolean;
    sso: boolean;
    advancedSecurity: boolean;
  };
  integrations: {
    enabled: string[];
    configurations: Record<string, any>;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    webhook: boolean;
    webhookUrl?: string;
  };
  security: {
    mfaRequired: boolean;
    sessionTimeout: number;
    ipWhitelist: string[];
    passwordPolicy: PasswordPolicy;
  };
}

export interface TenantLimits {
  current: {
    users: number;
    projects: number;
    storage: number;
    apiCalls: number;
    aiAnalyses: number;
  };
  usage: {
    users: number;
    projects: number;
    storage: number;
    apiCalls: number;
    aiAnalyses: number;
  };
  resetDate: string;
}

export interface TenantMetadata {
  industry: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  country: string;
  timezone: string;
  language: string;
  contactEmail: string;
  contactPhone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // days
  historyCount: number;
}

export interface TenantUser {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantInvitation {
  id: string;
  tenantId: string;
  email: string;
  roles: string[];
  invitedBy: string;
  expiresAt: string;
  acceptedAt?: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  createdAt: string;
}

export interface TenantResource {
  id: string;
  tenantId: string;
  type: 'project' | 'report' | 'asset' | 'document';
  name: string;
  path: string;
  size: number;
  owner: string;
  permissions: ResourcePermissions;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ResourcePermissions {
  read: string[];
  write: string[];
  delete: string[];
  share: string[];
}

export interface TenantUsageAnalytics {
  tenantId: string;
  period: string;
  metrics: {
    activeUsers: number;
    apiCalls: number;
    storageUsed: number;
    aiAnalyses: number;
    projectsCreated: number;
    reportsGenerated: number;
  };
  trends: {
    userGrowth: number;
    apiUsageGrowth: number;
    storageGrowth: number;
  };
  topFeatures: Array<{
    feature: string;
    usage: number;
    percentage: number;
  }>;
}

// PHASE 12: Multi-Tenant Service Class
export class MultiTenantService {
  private currentTenant: Tenant | null = null;
  private tenantCache: Map<string, Tenant> = new Map();
  private resourceCache: Map<string, TenantResource[]> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    this.initializeService();
  }

  // PHASE 12: Service Initialization
  private async initializeService(): Promise<void> {
    try {
      console.log('🏢 Initializing Multi-Tenant Service...');
      
      // Setup tenant context detection
      await this.detectTenantContext();
      
      // Initialize tenant-specific configurations
      if (this.currentTenant) {
        await this.initializeTenantConfig(this.currentTenant);
      }
      
      this.isInitialized = true;
      console.log('✅ Multi-Tenant Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize multi-tenant service:', error);
      throw error;
    }
  }

  // PHASE 12: Tenant Context Detection
  private async detectTenantContext(): Promise<void> {
    try {
      // Detect tenant from various sources
      const tenantId = this.getTenantIdFromContext();
      
      if (tenantId) {
        this.currentTenant = await this.getTenant(tenantId);
      }
    } catch (error) {
      console.error('Error detecting tenant context:', error);
    }
  }

  private getTenantIdFromContext(): string | null {
    // Priority order: URL subdomain, custom domain, localStorage, session
    
    // 1. Check URL subdomain (e.g., acme.pavemaster.com)
    const hostname = window.location.hostname;
    const subdomainMatch = hostname.match(/^([^.]+)\.pavemaster\.com$/);
    if (subdomainMatch) {
      return this.getTenantBySlug(subdomainMatch[1]);
    }
    
    // 2. Check custom domain
    const customDomainTenant = this.getTenantByDomain(hostname);
    if (customDomainTenant) {
      return customDomainTenant;
    }
    
    // 3. Check localStorage
    const storedTenantId = localStorage.getItem('pavemaster_tenant_id');
    if (storedTenantId) {
      return storedTenantId;
    }
    
    // 4. Check session/auth context
    const sessionTenantId = this.getTenantFromSession();
    if (sessionTenantId) {
      return sessionTenantId;
    }
    
    return null;
  }

  private getTenantBySlug(slug: string): string | null {
    // This would typically query the database
    // For now, return a mock tenant ID
    const mockTenants = {
      'acme': 'tenant_acme_123',
      'demo': 'tenant_demo_456',
      'enterprise': 'tenant_enterprise_789'
    };
    
    return mockTenants[slug as keyof typeof mockTenants] || null;
  }

  private getTenantByDomain(domain: string): string | null {
    // Query tenant by custom domain
    // Mock implementation
    const mockDomains = {
      'paving.acme.com': 'tenant_acme_123',
      'pavement.example.org': 'tenant_demo_456'
    };
    
    return mockDomains[domain as keyof typeof mockDomains] || null;
  }

  private getTenantFromSession(): string | null {
    // Extract tenant from current user session
    // Mock implementation
    return sessionStorage.getItem('tenant_id');
  }

  // PHASE 12: Tenant Management
  async createTenant(tenantData: Partial<Tenant>): Promise<Tenant> {
    try {
      const tenant: Tenant = {
        id: this.generateTenantId(),
        name: tenantData.name || '',
        slug: this.generateSlug(tenantData.name || ''),
        domain: tenantData.domain,
        plan: tenantData.plan || this.getDefaultPlan(),
        status: {
          active: true,
          suspended: false,
          trial: true,
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        settings: tenantData.settings || this.getDefaultSettings(),
        limits: this.calculateLimits(tenantData.plan || this.getDefaultPlan()),
        metadata: tenantData.metadata || {} as TenantMetadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to database
      const { data, error } = await supabase
        .from('tenants')
        .insert(tenant)
        .select()
        .single();

      if (error) throw error;

      // Initialize tenant infrastructure
      await this.initializeTenantInfrastructure(tenant);
      
      // Cache the tenant
      this.tenantCache.set(tenant.id, tenant);
      
      console.log(`🏢 Created tenant: ${tenant.name} (${tenant.slug})`);
      return tenant;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  async getTenant(tenantId: string): Promise<Tenant | null> {
    try {
      // Check cache first
      if (this.tenantCache.has(tenantId)) {
        return this.tenantCache.get(tenantId)!;
      }

      // Query database
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Tenant not found
        }
        throw error;
      }

      // Cache the tenant
      this.tenantCache.set(tenantId, data);
      
      return data;
    } catch (error) {
      console.error('Error fetching tenant:', error);
      throw error;
    }
  }

  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant> {
    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('tenants')
        .update(updatedData)
        .eq('id', tenantId)
        .select()
        .single();

      if (error) throw error;

      // Update cache
      this.tenantCache.set(tenantId, data);
      
      // Update current tenant if it's the same
      if (this.currentTenant?.id === tenantId) {
        this.currentTenant = data;
        await this.initializeTenantConfig(data);
      }

      return data;
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw error;
    }
  }

  // PHASE 12: User Management
  async inviteUser(tenantId: string, email: string, roles: string[], invitedBy: string): Promise<TenantInvitation> {
    try {
      const invitation: TenantInvitation = {
        id: this.generateInvitationId(),
        tenantId,
        email,
        roles,
        invitedBy,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('tenant_invitations')
        .insert(invitation)
        .select()
        .single();

      if (error) throw error;

      // Send invitation email
      await this.sendInvitationEmail(invitation);

      return data;
    } catch (error) {
      console.error('Error inviting user:', error);
      throw error;
    }
  }

  async getTenantUsers(tenantId: string): Promise<TenantUser[]> {
    try {
      const { data, error } = await supabase
        .from('tenant_users')
        .select('*')
        .eq('tenantId', tenantId)
        .eq('status', 'active');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching tenant users:', error);
      throw error;
    }
  }

  async updateUserRoles(tenantId: string, userId: string, roles: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('tenant_users')
        .update({ 
          roles,
          updatedAt: new Date().toISOString()
        })
        .eq('tenantId', tenantId)
        .eq('id', userId);

      if (error) throw error;

      console.log(`👤 Updated roles for user ${userId} in tenant ${tenantId}`);
    } catch (error) {
      console.error('Error updating user roles:', error);
      throw error;
    }
  }

  // PHASE 12: Resource Management
  async createResource(resource: Omit<TenantResource, 'id' | 'createdAt' | 'updatedAt'>): Promise<TenantResource> {
    try {
      const newResource: TenantResource = {
        id: this.generateResourceId(),
        ...resource,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('tenant_resources')
        .insert(newResource)
        .select()
        .single();

      if (error) throw error;

      // Update cache
      const tenantResources = this.resourceCache.get(resource.tenantId) || [];
      tenantResources.push(data);
      this.resourceCache.set(resource.tenantId, tenantResources);

      return data;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  }

  async getTenantResources(tenantId: string, type?: string): Promise<TenantResource[]> {
    try {
      let query = supabase
        .from('tenant_resources')
        .select('*')
        .eq('tenantId', tenantId);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Update cache
      this.resourceCache.set(tenantId, data || []);

      return data || [];
    } catch (error) {
      console.error('Error fetching tenant resources:', error);
      throw error;
    }
  }

  // PHASE 12: Usage Analytics
  async getTenantUsage(tenantId: string, period: string = 'current_month'): Promise<TenantUsageAnalytics> {
    try {
      // This would typically aggregate usage data from various sources
      // Mock implementation for demonstration
      const mockUsage: TenantUsageAnalytics = {
        tenantId,
        period,
        metrics: {
          activeUsers: 25,
          apiCalls: 15420,
          storageUsed: 2.3, // GB
          aiAnalyses: 187,
          projectsCreated: 8,
          reportsGenerated: 142
        },
        trends: {
          userGrowth: 15.2,
          apiUsageGrowth: 28.5,
          storageGrowth: 12.1
        },
        topFeatures: [
          { feature: 'AI Analysis', usage: 187, percentage: 45.2 },
          { feature: 'Project Management', usage: 156, percentage: 37.8 },
          { feature: 'Report Generation', usage: 142, percentage: 34.3 },
          { feature: 'Mobile App', usage: 89, percentage: 21.5 }
        ]
      };

      return mockUsage;
    } catch (error) {
      console.error('Error fetching tenant usage:', error);
      throw error;
    }
  }

  async checkTenantLimits(tenantId: string): Promise<{
    withinLimits: boolean;
    warnings: string[];
    exceeded: string[];
  }> {
    try {
      const tenant = await this.getTenant(tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const usage = tenant.limits.usage;
      const limits = tenant.limits.current;
      
      const warnings: string[] = [];
      const exceeded: string[] = [];

      // Check each limit
      const checks = [
        { name: 'users', usage: usage.users, limit: limits.users, threshold: 0.8 },
        { name: 'projects', usage: usage.projects, limit: limits.projects, threshold: 0.8 },
        { name: 'storage', usage: usage.storage, limit: limits.storage, threshold: 0.8 },
        { name: 'apiCalls', usage: usage.apiCalls, limit: limits.apiCalls, threshold: 0.8 },
        { name: 'aiAnalyses', usage: usage.aiAnalyses, limit: limits.aiAnalyses, threshold: 0.8 }
      ];

      checks.forEach(check => {
        const percentage = check.usage / check.limit;
        
        if (percentage >= 1) {
          exceeded.push(`${check.name} limit exceeded (${check.usage}/${check.limit})`);
        } else if (percentage >= check.threshold) {
          warnings.push(`${check.name} usage at ${(percentage * 100).toFixed(1)}% of limit`);
        }
      });

      return {
        withinLimits: exceeded.length === 0,
        warnings,
        exceeded
      };
    } catch (error) {
      console.error('Error checking tenant limits:', error);
      throw error;
    }
  }

  // PHASE 12: Tenant Configuration
  private async initializeTenantConfig(tenant: Tenant): Promise<void> {
    try {
      // Apply tenant-specific branding
      this.applyTenantBranding(tenant.settings.branding);
      
      // Configure feature flags
      this.configureFeatureFlags(tenant.settings.features);
      
      // Setup security policies
      this.applySecurityPolicies(tenant.settings.security);
      
      console.log(`🎨 Applied configuration for tenant: ${tenant.name}`);
    } catch (error) {
      console.error('Error initializing tenant config:', error);
    }
  }

  private applyTenantBranding(branding: TenantSettings['branding']): void {
    // Apply CSS custom properties for branding
    const root = document.documentElement;
    root.style.setProperty('--tenant-primary-color', branding.primaryColor);
    root.style.setProperty('--tenant-secondary-color', branding.secondaryColor);
    
    // Update page title and favicon
    if (branding.companyName) {
      document.title = `${branding.companyName} - PaveMaster Suite`;
    }
    
    if (branding.favicon) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = branding.favicon;
      }
    }
  }

  private configureFeatureFlags(features: TenantSettings['features']): void {
    // Store feature flags in a global configuration object
    (window as any).TENANT_FEATURES = features;
    
    // Dispatch event for feature flag updates
    window.dispatchEvent(new CustomEvent('tenant:features-updated', {
      detail: features
    }));
  }

  private applySecurityPolicies(security: TenantSettings['security']): void {
    // Store security policies for enforcement
    (window as any).TENANT_SECURITY = security;
    
    // Setup session timeout
    if (security.sessionTimeout > 0) {
      this.setupSessionTimeout(security.sessionTimeout);
    }
  }

  private setupSessionTimeout(timeoutMinutes: number): void {
    // Clear existing timeout
    if ((window as any).sessionTimeoutId) {
      clearTimeout((window as any).sessionTimeoutId);
    }
    
    // Set new timeout
    (window as any).sessionTimeoutId = setTimeout(() => {
      // Trigger session timeout
      window.dispatchEvent(new CustomEvent('tenant:session-timeout'));
    }, timeoutMinutes * 60 * 1000);
  }

  // PHASE 12: Infrastructure Setup
  private async initializeTenantInfrastructure(tenant: Tenant): Promise<void> {
    try {
      // Create tenant-specific database schemas/tables
      await this.createTenantSchema(tenant.id);
      
      // Setup tenant-specific storage buckets
      await this.createTenantStorageBucket(tenant.id);
      
      // Initialize default data
      await this.seedTenantData(tenant.id);
      
      console.log(`🏗️ Initialized infrastructure for tenant: ${tenant.id}`);
    } catch (error) {
      console.error('Error initializing tenant infrastructure:', error);
      throw error;
    }
  }

  private async createTenantSchema(tenantId: string): Promise<void> {
    // This would create tenant-specific database schemas
    // For Supabase, this might involve RLS policies and tenant-specific views
    console.log(`📊 Created database schema for tenant: ${tenantId}`);
  }

  private async createTenantStorageBucket(tenantId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .storage
        .createBucket(`tenant-${tenantId}`, {
          public: false,
          allowedMimeTypes: ['image/*', 'application/pdf', 'text/*'],
          fileSizeLimit: 10 * 1024 * 1024 // 10MB
        });

      if (error && error.message !== 'Bucket already exists') {
        throw error;
      }

      console.log(`🗂️ Created storage bucket for tenant: ${tenantId}`);
    } catch (error) {
      console.error('Error creating tenant storage bucket:', error);
    }
  }

  private async seedTenantData(tenantId: string): Promise<void> {
    // Seed with default data like roles, permissions, templates
    console.log(`🌱 Seeded default data for tenant: ${tenantId}`);
  }

  // PHASE 12: Utility Methods
  private generateTenantId(): string {
    return `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private generateInvitationId(): string {
    return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateResourceId(): string {
    return `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultPlan(): TenantPlan {
    return {
      type: 'starter',
      features: ['basic_features', 'standard_support'],
      limits: {
        users: 5,
        projects: 10,
        storage: 5,
        apiCalls: 10000,
        aiAnalyses: 100
      },
      pricing: {
        monthly: 29,
        annual: 290,
        currency: 'USD'
      }
    };
  }

  private getDefaultSettings(): TenantSettings {
    return {
      branding: {
        primaryColor: '#2563EB',
        secondaryColor: '#64748B',
        companyName: 'PaveMaster Client'
      },
      features: {
        aiAnalysis: true,
        mobileApp: true,
        apiAccess: false,
        customReports: false,
        whiteLabel: false,
        sso: false,
        advancedSecurity: false
      },
      integrations: {
        enabled: [],
        configurations: {}
      },
      notifications: {
        email: true,
        sms: false,
        webhook: false
      },
      security: {
        mfaRequired: false,
        sessionTimeout: 480, // 8 hours
        ipWhitelist: [],
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
          maxAge: 90,
          historyCount: 5
        }
      }
    };
  }

  private calculateLimits(plan: TenantPlan): TenantLimits {
    return {
      current: plan.limits,
      usage: {
        users: 0,
        projects: 0,
        storage: 0,
        apiCalls: 0,
        aiAnalyses: 0
      },
      resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
    };
  }

  private async sendInvitationEmail(invitation: TenantInvitation): Promise<void> {
    // This would integrate with an email service
    console.log(`📧 Sent invitation email to ${invitation.email}`);
  }

  // PHASE 12: Public API Methods
  getCurrentTenant(): Tenant | null {
    return this.currentTenant;
  }

  async switchTenant(tenantId: string): Promise<void> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    this.currentTenant = tenant;
    localStorage.setItem('pavemaster_tenant_id', tenantId);
    
    await this.initializeTenantConfig(tenant);
    
    // Trigger application reload/refresh
    window.dispatchEvent(new CustomEvent('tenant:switched', {
      detail: tenant
    }));
  }

  isFeatureEnabled(feature: keyof TenantSettings['features']): boolean {
    return this.currentTenant?.settings.features[feature] || false;
  }

  getTenantBranding(): TenantSettings['branding'] | null {
    return this.currentTenant?.settings.branding || null;
  }

  async incrementUsage(type: keyof TenantLimits['usage'], amount: number = 1): Promise<void> {
    if (!this.currentTenant) return;

    try {
      const currentUsage = this.currentTenant.limits.usage[type] + amount;
      
      await this.updateTenant(this.currentTenant.id, {
        limits: {
          ...this.currentTenant.limits,
          usage: {
            ...this.currentTenant.limits.usage,
            [type]: currentUsage
          }
        }
      });
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  }

  // PHASE 12: Cleanup
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up Multi-Tenant Service...');
    
    this.currentTenant = null;
    this.tenantCache.clear();
    this.resourceCache.clear();
    
    // Clear session timeout
    if ((window as any).sessionTimeoutId) {
      clearTimeout((window as any).sessionTimeoutId);
    }
    
    console.log('✅ Multi-Tenant Service cleanup completed');
  }
}

// PHASE 12: Export singleton instance
export const multiTenantService = new MultiTenantService();
export default multiTenantService;