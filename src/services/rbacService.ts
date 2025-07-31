// PHASE 12: Advanced Role-Based Access Control (RBAC) Service
// Enterprise-grade RBAC with hierarchical roles and fine-grained permissions
import { multiTenantService } from './multiTenantService';

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  level: number; // Hierarchy level (0 = highest)
  permissions: string[];
  inheritsFrom: string[]; // Parent roles
  isSystemRole: boolean;
  isCustomRole: boolean;
  tenantId: string;
  metadata: RoleMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
  description: string;
  category: PermissionCategory;
  isSystemPermission: boolean;
  tenantId?: string;
  createdAt: string;
}

export interface PermissionCondition {
  type: 'time' | 'location' | 'attribute' | 'context' | 'resource_owner';
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  field: string;
  value: any;
  description: string;
}

export interface PermissionCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface RoleMetadata {
  isDefault: boolean;
  assignableBy: string[];
  maxUsers?: number;
  expiresAt?: string;
  tags: string[];
  customData: Record<string, any>;
}

export interface UserPermissions {
  userId: string;
  tenantId: string;
  roles: string[];
  directPermissions: string[];
  effectivePermissions: string[];
  deniedPermissions: string[];
  contextualPermissions: ContextualPermission[];
  lastCalculated: string;
}

export interface ContextualPermission {
  permission: string;
  resource: string;
  resourceId?: string;
  conditions: PermissionCondition[];
  grantedAt: string;
  expiresAt?: string;
  grantedBy: string;
}

export interface AccessRequest {
  userId: string;
  tenantId: string;
  resource: string;
  action: string;
  resourceId?: string;
  context: AccessContext;
  timestamp: string;
}

export interface AccessContext {
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country: string;
    region: string;
    city: string;
  };
  timeZone?: string;
  sessionId?: string;
  deviceId?: string;
  attributes: Record<string, any>;
}

export interface AccessResult {
  granted: boolean;
  reason: string;
  matchedPermissions: string[];
  deniedReasons: string[];
  conditions: PermissionCondition[];
  expiresAt?: string;
  auditId: string;
}

export interface PermissionMatrix {
  tenantId: string;
  roles: Role[];
  permissions: Permission[];
  matrix: Record<string, Record<string, boolean>>;
  lastUpdated: string;
}

export interface RoleHierarchy {
  tenantId: string;
  hierarchy: RoleNode[];
  lastUpdated: string;
}

export interface RoleNode {
  roleId: string;
  role: Role;
  children: RoleNode[];
  permissions: string[];
  effectivePermissions: string[];
}

// PHASE 12: RBAC Service Class
export class RBACService {
  private rolesCache: Map<string, Role[]> = new Map();
  private permissionsCache: Map<string, Permission[]> = new Map();
  private userPermissionsCache: Map<string, UserPermissions> = new Map();
  private accessAuditLog: AccessRequest[] = [];
  private isInitialized: boolean = false;

  constructor() {
    this.initializeService();
  }

  // PHASE 12: Service Initialization
  private async initializeService(): Promise<void> {
    try {
      console.log('🔐 Initializing RBAC Service...');
      
      // Setup system roles and permissions
      await this.setupSystemRoles();
      await this.setupSystemPermissions();
      
      // Initialize tenant-specific RBAC
      const currentTenant = multiTenantService.getCurrentTenant();
      if (currentTenant) {
        await this.initializeTenantRBAC(currentTenant.id);
      }
      
      this.isInitialized = true;
      console.log('✅ RBAC Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize RBAC service:', error);
      throw error;
    }
  }

  // PHASE 12: System Roles Setup
  private async setupSystemRoles(): Promise<void> {
    const systemRoles: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'super_admin',
        displayName: 'Super Administrator',
        description: 'Full system access across all tenants',
        level: 0,
        permissions: ['*'],
        inheritsFrom: [],
        isSystemRole: true,
        isCustomRole: false,
        tenantId: 'system',
        metadata: {
          isDefault: false,
          assignableBy: ['super_admin'],
          tags: ['system', 'admin'],
          customData: {}
        }
      },
      {
        name: 'tenant_admin',
        displayName: 'Tenant Administrator',
        description: 'Full access within tenant organization',
        level: 1,
        permissions: [
          'tenant:manage',
          'users:manage',
          'roles:manage',
          'projects:manage',
          'reports:manage',
          'settings:manage'
        ],
        inheritsFrom: [],
        isSystemRole: true,
        isCustomRole: false,
        tenantId: 'system',
        metadata: {
          isDefault: true,
          assignableBy: ['super_admin', 'tenant_admin'],
          tags: ['admin', 'management'],
          customData: {}
        }
      },
      {
        name: 'project_manager',
        displayName: 'Project Manager',
        description: 'Manage projects and teams',
        level: 2,
        permissions: [
          'projects:create',
          'projects:read',
          'projects:update',
          'projects:delete',
          'teams:manage',
          'reports:create',
          'reports:read'
        ],
        inheritsFrom: ['user'],
        isSystemRole: true,
        isCustomRole: false,
        tenantId: 'system',
        metadata: {
          isDefault: true,
          assignableBy: ['tenant_admin', 'project_manager'],
          tags: ['management', 'projects'],
          customData: {}
        }
      },
      {
        name: 'engineer',
        displayName: 'Engineer',
        description: 'Technical project execution and analysis',
        level: 3,
        permissions: [
          'projects:read',
          'projects:update',
          'measurements:create',
          'measurements:read',
          'measurements:update',
          'analysis:create',
          'analysis:read',
          'reports:create',
          'reports:read'
        ],
        inheritsFrom: ['user'],
        isSystemRole: true,
        isCustomRole: false,
        tenantId: 'system',
        metadata: {
          isDefault: true,
          assignableBy: ['tenant_admin', 'project_manager'],
          tags: ['technical', 'analysis'],
          customData: {}
        }
      },
      {
        name: 'inspector',
        displayName: 'Field Inspector',
        description: 'Field inspections and data collection',
        level: 3,
        permissions: [
          'projects:read',
          'inspections:create',
          'inspections:read',
          'inspections:update',
          'measurements:create',
          'measurements:read',
          'photos:create',
          'photos:read'
        ],
        inheritsFrom: ['user'],
        isSystemRole: true,
        isCustomRole: false,
        tenantId: 'system',
        metadata: {
          isDefault: true,
          assignableBy: ['tenant_admin', 'project_manager'],
          tags: ['field', 'inspection'],
          customData: {}
        }
      },
      {
        name: 'user',
        displayName: 'User',
        description: 'Basic user access',
        level: 4,
        permissions: [
          'profile:read',
          'profile:update',
          'projects:read',
          'reports:read'
        ],
        inheritsFrom: [],
        isSystemRole: true,
        isCustomRole: false,
        tenantId: 'system',
        metadata: {
          isDefault: true,
          assignableBy: ['tenant_admin', 'project_manager'],
          tags: ['basic'],
          customData: {}
        }
      },
      {
        name: 'viewer',
        displayName: 'Viewer',
        description: 'Read-only access',
        level: 5,
        permissions: [
          'projects:read',
          'reports:read'
        ],
        inheritsFrom: [],
        isSystemRole: true,
        isCustomRole: false,
        tenantId: 'system',
        metadata: {
          isDefault: true,
          assignableBy: ['tenant_admin', 'project_manager', 'engineer'],
          tags: ['readonly'],
          customData: {}
        }
      }
    ];

    // Store system roles
    for (const roleData of systemRoles) {
      await this.createRole(roleData);
    }
  }

  // PHASE 12: System Permissions Setup
  private async setupSystemPermissions(): Promise<void> {
    const permissionCategories: PermissionCategory[] = [
      { id: 'tenant', name: 'Tenant Management', description: 'Tenant administration', icon: 'building', color: '#3B82F6' },
      { id: 'users', name: 'User Management', description: 'User administration', icon: 'users', color: '#10B981' },
      { id: 'projects', name: 'Project Management', description: 'Project operations', icon: 'folder', color: '#F59E0B' },
      { id: 'analysis', name: 'AI Analysis', description: 'AI and analytics', icon: 'brain', color: '#8B5CF6' },
      { id: 'reports', name: 'Reporting', description: 'Report generation', icon: 'file-text', color: '#EF4444' },
      { id: 'settings', name: 'Settings', description: 'System configuration', icon: 'settings', color: '#6B7280' }
    ];

    const systemPermissions: Omit<Permission, 'id' | 'createdAt'>[] = [
      // Tenant Management
      { name: 'tenant:manage', resource: 'tenant', action: 'manage', description: 'Full tenant management', category: permissionCategories[0], isSystemPermission: true },
      { name: 'tenant:read', resource: 'tenant', action: 'read', description: 'View tenant information', category: permissionCategories[0], isSystemPermission: true },
      { name: 'tenant:update', resource: 'tenant', action: 'update', description: 'Update tenant settings', category: permissionCategories[0], isSystemPermission: true },
      
      // User Management
      { name: 'users:manage', resource: 'users', action: 'manage', description: 'Full user management', category: permissionCategories[1], isSystemPermission: true },
      { name: 'users:create', resource: 'users', action: 'create', description: 'Create new users', category: permissionCategories[1], isSystemPermission: true },
      { name: 'users:read', resource: 'users', action: 'read', description: 'View user information', category: permissionCategories[1], isSystemPermission: true },
      { name: 'users:update', resource: 'users', action: 'update', description: 'Update user information', category: permissionCategories[1], isSystemPermission: true },
      { name: 'users:delete', resource: 'users', action: 'delete', description: 'Delete users', category: permissionCategories[1], isSystemPermission: true },
      
      // Role Management
      { name: 'roles:manage', resource: 'roles', action: 'manage', description: 'Full role management', category: permissionCategories[1], isSystemPermission: true },
      { name: 'roles:create', resource: 'roles', action: 'create', description: 'Create new roles', category: permissionCategories[1], isSystemPermission: true },
      { name: 'roles:read', resource: 'roles', action: 'read', description: 'View roles', category: permissionCategories[1], isSystemPermission: true },
      { name: 'roles:update', resource: 'roles', action: 'update', description: 'Update roles', category: permissionCategories[1], isSystemPermission: true },
      { name: 'roles:delete', resource: 'roles', action: 'delete', description: 'Delete roles', category: permissionCategories[1], isSystemPermission: true },
      
      // Project Management
      { name: 'projects:manage', resource: 'projects', action: 'manage', description: 'Full project management', category: permissionCategories[2], isSystemPermission: true },
      { name: 'projects:create', resource: 'projects', action: 'create', description: 'Create new projects', category: permissionCategories[2], isSystemPermission: true },
      { name: 'projects:read', resource: 'projects', action: 'read', description: 'View projects', category: permissionCategories[2], isSystemPermission: true },
      { name: 'projects:update', resource: 'projects', action: 'update', description: 'Update projects', category: permissionCategories[2], isSystemPermission: true },
      { name: 'projects:delete', resource: 'projects', action: 'delete', description: 'Delete projects', category: permissionCategories[2], isSystemPermission: true },
      
      // Analysis & AI
      { name: 'analysis:create', resource: 'analysis', action: 'create', description: 'Create AI analyses', category: permissionCategories[3], isSystemPermission: true },
      { name: 'analysis:read', resource: 'analysis', action: 'read', description: 'View AI analyses', category: permissionCategories[3], isSystemPermission: true },
      { name: 'analysis:update', resource: 'analysis', action: 'update', description: 'Update AI analyses', category: permissionCategories[3], isSystemPermission: true },
      { name: 'analysis:delete', resource: 'analysis', action: 'delete', description: 'Delete AI analyses', category: permissionCategories[3], isSystemPermission: true },
      
      // Reports
      { name: 'reports:create', resource: 'reports', action: 'create', description: 'Create reports', category: permissionCategories[4], isSystemPermission: true },
      { name: 'reports:read', resource: 'reports', action: 'read', description: 'View reports', category: permissionCategories[4], isSystemPermission: true },
      { name: 'reports:update', resource: 'reports', action: 'update', description: 'Update reports', category: permissionCategories[4], isSystemPermission: true },
      { name: 'reports:delete', resource: 'reports', action: 'delete', description: 'Delete reports', category: permissionCategories[4], isSystemPermission: true },
      
      // Settings
      { name: 'settings:manage', resource: 'settings', action: 'manage', description: 'Full settings management', category: permissionCategories[5], isSystemPermission: true },
      { name: 'settings:read', resource: 'settings', action: 'read', description: 'View settings', category: permissionCategories[5], isSystemPermission: true },
      { name: 'settings:update', resource: 'settings', action: 'update', description: 'Update settings', category: permissionCategories[5], isSystemPermission: true }
    ];

    // Store system permissions
    for (const permissionData of systemPermissions) {
      await this.createPermission(permissionData);
    }
  }

  // PHASE 12: Role Management
  async createRole(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    try {
      const role: Role = {
        id: this.generateRoleId(),
        ...roleData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Validate role hierarchy
      await this.validateRoleHierarchy(role);

      // Store role (would use database in production)
      const tenantRoles = this.rolesCache.get(role.tenantId) || [];
      tenantRoles.push(role);
      this.rolesCache.set(role.tenantId, tenantRoles);

      console.log(`👤 Created role: ${role.displayName} for tenant ${role.tenantId}`);
      return role;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  async createPermission(permissionData: Omit<Permission, 'id' | 'createdAt'>): Promise<Permission> {
    try {
      const permission: Permission = {
        id: this.generatePermissionId(),
        ...permissionData,
        createdAt: new Date().toISOString()
      };

      // Store permission
      const tenantId = permission.tenantId || 'system';
      const tenantPermissions = this.permissionsCache.get(tenantId) || [];
      tenantPermissions.push(permission);
      this.permissionsCache.set(tenantId, tenantPermissions);

      console.log(`🔑 Created permission: ${permission.name}`);
      return permission;
    } catch (error) {
      console.error('Error creating permission:', error);
      throw error;
    }
  }

  // PHASE 12: Access Control
  async checkAccess(request: AccessRequest): Promise<AccessResult> {
    try {
      const startTime = Date.now();
      
      // Get user permissions
      const userPermissions = await this.getUserPermissions(request.userId, request.tenantId);
      
      // Check direct permissions
      const hasDirectPermission = this.checkDirectPermission(
        userPermissions,
        request.resource,
        request.action
      );

      // Check wildcard permissions
      const hasWildcardPermission = this.checkWildcardPermission(
        userPermissions,
        request.resource,
        request.action
      );

      // Check contextual permissions
      const contextualResult = await this.checkContextualPermissions(
        userPermissions,
        request
      );

      // Determine final access
      const granted = hasDirectPermission || hasWildcardPermission || contextualResult.granted;
      
      const result: AccessResult = {
        granted,
        reason: granted ? 'Access granted' : 'Access denied - insufficient permissions',
        matchedPermissions: this.getMatchedPermissions(userPermissions, request),
        deniedReasons: granted ? [] : ['Missing required permissions'],
        conditions: contextualResult.conditions,
        expiresAt: contextualResult.expiresAt,
        auditId: this.generateAuditId()
      };

      // Log access attempt
      this.logAccessAttempt(request, result, Date.now() - startTime);

      return result;
    } catch (error) {
      console.error('Error checking access:', error);
      
      return {
        granted: false,
        reason: 'Access check failed',
        matchedPermissions: [],
        deniedReasons: ['System error'],
        conditions: [],
        auditId: this.generateAuditId()
      };
    }
  }

  async getUserPermissions(userId: string, tenantId: string): Promise<UserPermissions> {
    try {
      const cacheKey = `${userId}_${tenantId}`;
      
      // Check cache
      if (this.userPermissionsCache.has(cacheKey)) {
        const cached = this.userPermissionsCache.get(cacheKey)!;
        if (Date.now() - new Date(cached.lastCalculated).getTime() < 300000) { // 5 minutes
          return cached;
        }
      }

      // Calculate permissions
      const userPermissions = await this.calculateUserPermissions(userId, tenantId);
      
      // Cache results
      this.userPermissionsCache.set(cacheKey, userPermissions);
      
      return userPermissions;
    } catch (error) {
      console.error('Error getting user permissions:', error);
      throw error;
    }
  }

  private async calculateUserPermissions(userId: string, tenantId: string): Promise<UserPermissions> {
    // This would typically query the database for user roles
    // Mock implementation for demonstration
    
    const userRoles = ['user', 'project_manager']; // Mock user roles
    const directPermissions: string[] = []; // Mock direct permissions
    
    // Get all roles and their permissions
    const allRoles = this.rolesCache.get(tenantId) || [];
    const systemRoles = this.rolesCache.get('system') || [];
    const availableRoles = [...allRoles, ...systemRoles];
    
    // Calculate effective permissions from roles
    const effectivePermissions = new Set<string>();
    
    for (const roleName of userRoles) {
      const role = availableRoles.find(r => r.name === roleName);
      if (role) {
        // Add role permissions
        role.permissions.forEach(p => effectivePermissions.add(p));
        
        // Add inherited permissions
        await this.addInheritedPermissions(role, availableRoles, effectivePermissions);
      }
    }
    
    // Add direct permissions
    directPermissions.forEach(p => effectivePermissions.add(p));
    
    return {
      userId,
      tenantId,
      roles: userRoles,
      directPermissions,
      effectivePermissions: Array.from(effectivePermissions),
      deniedPermissions: [], // Would implement explicit denials
      contextualPermissions: [], // Would implement contextual permissions
      lastCalculated: new Date().toISOString()
    };
  }

  private async addInheritedPermissions(
    role: Role,
    allRoles: Role[],
    permissions: Set<string>
  ): Promise<void> {
    for (const parentRoleName of role.inheritsFrom) {
      const parentRole = allRoles.find(r => r.name === parentRoleName);
      if (parentRole) {
        parentRole.permissions.forEach(p => permissions.add(p));
        // Recursively add inherited permissions
        await this.addInheritedPermissions(parentRole, allRoles, permissions);
      }
    }
  }

  // PHASE 12: Permission Checking Logic
  private checkDirectPermission(
    userPermissions: UserPermissions,
    resource: string,
    action: string
  ): boolean {
    const requiredPermission = `${resource}:${action}`;
    return userPermissions.effectivePermissions.includes(requiredPermission);
  }

  private checkWildcardPermission(
    userPermissions: UserPermissions,
    resource: string,
    action: string
  ): boolean {
    // Check for wildcard permissions
    const wildcards = [
      '*', // Full access
      `${resource}:*`, // All actions on resource
      `*:${action}`, // Specific action on all resources
      `${resource}:manage` // Management permission includes all actions
    ];
    
    return wildcards.some(wildcard => 
      userPermissions.effectivePermissions.includes(wildcard)
    );
  }

  private async checkContextualPermissions(
    userPermissions: UserPermissions,
    request: AccessRequest
  ): Promise<{
    granted: boolean;
    conditions: PermissionCondition[];
    expiresAt?: string;
  }> {
    // Check contextual permissions (time-based, location-based, etc.)
    for (const contextualPerm of userPermissions.contextualPermissions) {
      if (contextualPerm.permission === `${request.resource}:${request.action}`) {
        const conditionsMatch = await this.evaluateConditions(
          contextualPerm.conditions,
          request.context
        );
        
        if (conditionsMatch) {
          return {
            granted: true,
            conditions: contextualPerm.conditions,
            expiresAt: contextualPerm.expiresAt
          };
        }
      }
    }
    
    return {
      granted: false,
      conditions: []
    };
  }

  private async evaluateConditions(
    conditions: PermissionCondition[],
    context: AccessContext
  ): Promise<boolean> {
    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, context);
      if (!result) {
        return false; // All conditions must be true
      }
    }
    return true;
  }

  private async evaluateCondition(
    condition: PermissionCondition,
    context: AccessContext
  ): Promise<boolean> {
    const contextValue = this.getContextValue(condition.field, context);
    
    switch (condition.operator) {
      case 'equals':
        return contextValue === condition.value;
      case 'not_equals':
        return contextValue !== condition.value;
      case 'contains':
        return String(contextValue).includes(String(condition.value));
      case 'greater_than':
        return Number(contextValue) > Number(condition.value);
      case 'less_than':
        return Number(contextValue) < Number(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(contextValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(contextValue);
      default:
        return false;
    }
  }

  private getContextValue(field: string, context: AccessContext): any {
    const fieldParts = field.split('.');
    let value: any = context;
    
    for (const part of fieldParts) {
      value = value?.[part];
      if (value === undefined) break;
    }
    
    return value;
  }

  // PHASE 12: Helper Methods
  private getMatchedPermissions(userPermissions: UserPermissions, request: AccessRequest): string[] {
    const requiredPermission = `${request.resource}:${request.action}`;
    const matched: string[] = [];
    
    // Check direct match
    if (userPermissions.effectivePermissions.includes(requiredPermission)) {
      matched.push(requiredPermission);
    }
    
    // Check wildcard matches
    const wildcards = ['*', `${request.resource}:*`, `*:${request.action}`, `${request.resource}:manage`];
    wildcards.forEach(wildcard => {
      if (userPermissions.effectivePermissions.includes(wildcard)) {
        matched.push(wildcard);
      }
    });
    
    return matched;
  }

  private async validateRoleHierarchy(role: Role): Promise<void> {
    // Validate that role hierarchy doesn't create cycles
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (roleName: string): boolean => {
      if (recursionStack.has(roleName)) {
        return true; // Cycle detected
      }
      
      if (visited.has(roleName)) {
        return false; // Already processed
      }
      
      visited.add(roleName);
      recursionStack.add(roleName);
      
      const currentRole = this.findRoleByName(roleName, role.tenantId);
      if (currentRole) {
        for (const parent of currentRole.inheritsFrom) {
          if (hasCycle(parent)) {
            return true;
          }
        }
      }
      
      recursionStack.delete(roleName);
      return false;
    };
    
    if (hasCycle(role.name)) {
      throw new Error('Role hierarchy would create a cycle');
    }
  }

  private findRoleByName(roleName: string, tenantId: string): Role | undefined {
    const tenantRoles = this.rolesCache.get(tenantId) || [];
    const systemRoles = this.rolesCache.get('system') || [];
    return [...tenantRoles, ...systemRoles].find(r => r.name === roleName);
  }

  private logAccessAttempt(
    request: AccessRequest,
    result: AccessResult,
    duration: number
  ): void {
    this.accessAuditLog.push({
      ...request,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 1000 entries
    if (this.accessAuditLog.length > 1000) {
      this.accessAuditLog.shift();
    }
    
    console.log(`🔍 Access ${result.granted ? 'GRANTED' : 'DENIED'} for ${request.userId}: ${request.resource}:${request.action} (${duration}ms)`);
  }

  // PHASE 12: Tenant RBAC Initialization
  private async initializeTenantRBAC(tenantId: string): Promise<void> {
    try {
      // Load tenant-specific roles and permissions
      await this.loadTenantRoles(tenantId);
      await this.loadTenantPermissions(tenantId);
      
      console.log(`🔐 Initialized RBAC for tenant: ${tenantId}`);
    } catch (error) {
      console.error('Error initializing tenant RBAC:', error);
    }
  }

  private async loadTenantRoles(tenantId: string): Promise<void> {
    // This would load tenant-specific roles from database
    // For now, use empty array (only system roles will be available)
    this.rolesCache.set(tenantId, []);
  }

  private async loadTenantPermissions(tenantId: string): Promise<void> {
    // This would load tenant-specific permissions from database
    // For now, use empty array (only system permissions will be available)
    this.permissionsCache.set(tenantId, []);
  }

  // PHASE 12: Utility Methods
  private generateRoleId(): string {
    return `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePermissionId(): string {
    return `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // PHASE 12: Public API Methods
  async getTenantRoles(tenantId: string): Promise<Role[]> {
    const tenantRoles = this.rolesCache.get(tenantId) || [];
    const systemRoles = this.rolesCache.get('system') || [];
    return [...tenantRoles, ...systemRoles];
  }

  async getTenantPermissions(tenantId: string): Promise<Permission[]> {
    const tenantPermissions = this.permissionsCache.get(tenantId) || [];
    const systemPermissions = this.permissionsCache.get('system') || [];
    return [...tenantPermissions, ...systemPermissions];
  }

  async assignRoleToUser(
    tenantId: string,
    userId: string,
    roleId: string,
    assignedBy: string
  ): Promise<void> {
    try {
      // This would update the database
      console.log(`👤 Assigned role ${roleId} to user ${userId} in tenant ${tenantId}`);
      
      // Clear cache to force recalculation
      const cacheKey = `${userId}_${tenantId}`;
      this.userPermissionsCache.delete(cacheKey);
    } catch (error) {
      console.error('Error assigning role to user:', error);
      throw error;
    }
  }

  async revokeRoleFromUser(
    tenantId: string,
    userId: string,
    roleId: string,
    revokedBy: string
  ): Promise<void> {
    try {
      // This would update the database
      console.log(`👤 Revoked role ${roleId} from user ${userId} in tenant ${tenantId}`);
      
      // Clear cache to force recalculation
      const cacheKey = `${userId}_${tenantId}`;
      this.userPermissionsCache.delete(cacheKey);
    } catch (error) {
      console.error('Error revoking role from user:', error);
      throw error;
    }
  }

  getAccessAuditLog(): AccessRequest[] {
    return [...this.accessAuditLog];
  }

  // PHASE 12: Cleanup
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up RBAC Service...');
    
    this.rolesCache.clear();
    this.permissionsCache.clear();
    this.userPermissionsCache.clear();
    this.accessAuditLog.length = 0;
    
    console.log('✅ RBAC Service cleanup completed');
  }
}

// PHASE 12: Export singleton instance
export const rbacService = new RBACService();
export default rbacService;