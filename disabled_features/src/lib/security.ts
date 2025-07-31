/**
 * Security utilities for the PaveMaster Suite
 * Enterprise-grade security functions for input validation and sanitization
 */

import { supabase } from '@/integrations/supabase/client';
import CryptoJS from 'crypto-js';

// Security configuration
export interface SecurityConfig {
  accessTokenExpiry: number; // 15 minutes
  refreshTokenExpiry: number; // 7 days
  multiFactorAuth: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
  passwordMinLength: number;
  requireSpecialChars: boolean;
  sessionTimeout: number; // in minutes
}

export const securityConfig: SecurityConfig = {
  accessTokenExpiry: 15 * 60 * 1000, // 15 minutes
  refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  multiFactorAuth: true,
  maxLoginAttempts: 5,
  lockoutDuration: 30, // 30 minutes
  passwordMinLength: 12,
  requireSpecialChars: true,
  sessionTimeout: 30, // 30 minutes
};

// Audit log interface
export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'DOWNLOAD' | 'UPLOAD';
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  sessionId: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// Security monitoring interface
export interface SecurityAlert {
  id: string;
  type: 'SUSPICIOUS_LOGIN' | 'MULTIPLE_FAILURES' | 'UNUSUAL_ACTIVITY' | 'DATA_BREACH' | 'PRIVILEGE_ESCALATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  description: string;
  timestamp: Date;
  ipAddress: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

// Role-based permissions
export interface RolePermissions {
  role: 'super_admin' | 'admin' | 'manager' | 'employee' | 'contractor' | 'viewer';
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
  conditions?: Record<string, any>;
}

// Default role permissions
export const defaultPermissions: RolePermissions[] = [
  {
    role: 'super_admin',
    permissions: [
      { resource: '*', actions: ['create', 'read', 'update', 'delete'] }
    ]
  },
  {
    role: 'admin',
    permissions: [
      { resource: 'users', actions: ['create', 'read', 'update'] },
      { resource: 'projects', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'fleet', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'documents', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'veterans', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'reports', actions: ['read'] }
    ]
  },
  {
    role: 'manager',
    permissions: [
      { resource: 'projects', actions: ['create', 'read', 'update'] },
      { resource: 'fleet', actions: ['read', 'update'] },
      { resource: 'documents', actions: ['read', 'update'] },
      { resource: 'veterans', actions: ['read', 'update'] },
      { resource: 'employees', actions: ['read', 'update'] }
    ]
  },
  {
    role: 'employee',
    permissions: [
      { resource: 'projects', actions: ['read'] },
      { resource: 'fleet', actions: ['read'] },
      { resource: 'documents', actions: ['read'] },
      { resource: 'veterans', actions: ['read'] },
      { resource: 'own_profile', actions: ['read', 'update'] }
    ]
  },
  {
    role: 'contractor',
    permissions: [
      { resource: 'projects', actions: ['read'], conditions: { assigned: true } },
      { resource: 'documents', actions: ['read'], conditions: { public: true } }
    ]
  },
  {
    role: 'viewer',
    permissions: [
      { resource: 'projects', actions: ['read'] },
      { resource: 'documents', actions: ['read'], conditions: { public: true } }
    ]
  }
];

// Encryption utilities
export class EncryptionService {
  private static readonly SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'fallback-key-for-dev';

  static encrypt(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.SECRET_KEY).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  static decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  static hash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  static generateSalt(): string {
    return CryptoJS.lib.WordArray.random(128/8).toString();
  }

  static hashWithSalt(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, { keySize: 256/32, iterations: 10000 }).toString();
  }
}

// JWT Token management
export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'pavemaster_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'pavemaster_refresh_token';
  private static readonly TOKEN_TIMESTAMP_KEY = 'pavemaster_token_timestamp';

  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.TOKEN_TIMESTAMP_KEY, Date.now().toString());
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static isTokenExpired(): boolean {
    const timestamp = localStorage.getItem(this.TOKEN_TIMESTAMP_KEY);
    if (!timestamp) return true;

    const tokenAge = Date.now() - parseInt(timestamp);
    return tokenAge > securityConfig.accessTokenExpiry;
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_TIMESTAMP_KEY);
  }

  static async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error || !data.session) {
        this.clearTokens();
        return false;
      }

      this.setTokens(data.session.access_token, data.session.refresh_token);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
  }
}

// Audit logging service
export class AuditLogger {
  static async log(auditData: Omit<AuditLog, 'id' | 'timestamp' | 'ipAddress' | 'userAgent' | 'sessionId'>): Promise<void> {
    try {
      const fullAuditLog: AuditLog = {
        ...auditData,
        id: crypto.randomUUID(),
        timestamp: new Date(),
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        sessionId: this.getSessionId(),
      };

      // In production, this would be sent to a secure audit service
      await supabase.from('audit_logs').insert(fullAuditLog);

      // Also log to console in development
      if (import.meta.env.DEV) {
        console.log('🔍 Audit Log:', fullAuditLog);
      }
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw - audit logging shouldn't break the application
    }
  }

  private static async getClientIP(): Promise<string> {
    try {
      // In production, this would use a proper IP detection service
      return 'client-ip-placeholder';
    } catch {
      return 'unknown';
    }
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('pavemaster_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('pavemaster_session_id', sessionId);
    }
    return sessionId;
  }
}

// Security monitoring service
export class SecurityMonitor {
  private static alerts: SecurityAlert[] = [];
  private static loginAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();

  static async checkSuspiciousActivity(userId: string, action: string, details?: any): Promise<void> {
    // Check for unusual patterns
    const riskLevel = this.assessRiskLevel(userId, action, details);
    
    if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
      await this.createAlert({
        type: 'UNUSUAL_ACTIVITY',
        severity: riskLevel,
        userId,
        description: `Unusual ${action} activity detected for user ${userId}`,
        timestamp: new Date(),
        ipAddress: await this.getClientIP(),
        resolved: false
      });
    }
  }

  static async recordLoginAttempt(email: string, success: boolean, ipAddress: string): Promise<boolean> {
    const key = `${email}-${ipAddress}`;
    const attempts = this.loginAttempts.get(key) || { count: 0, lastAttempt: new Date() };

    if (success) {
      this.loginAttempts.delete(key);
      return true;
    }

    attempts.count++;
    attempts.lastAttempt = new Date();
    this.loginAttempts.set(key, attempts);

    if (attempts.count >= securityConfig.maxLoginAttempts) {
      await this.createAlert({
        type: 'MULTIPLE_FAILURES',
        severity: 'HIGH',
        description: `Multiple failed login attempts for ${email} from ${ipAddress}`,
        timestamp: new Date(),
        ipAddress,
        resolved: false
      });

      return false; // Account should be locked
    }

    return true;
  }

  private static assessRiskLevel(userId: string, action: string, details?: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    // Simple risk assessment logic - would be more sophisticated in production
    if (action === 'DELETE' && details?.resource === 'all_data') return 'CRITICAL';
    if (action === 'UPDATE' && details?.resource === 'user_permissions') return 'HIGH';
    if (action === 'DOWNLOAD' && details?.size > 100 * 1024 * 1024) return 'MEDIUM'; // 100MB
    return 'LOW';
  }

  private static async createAlert(alertData: Omit<SecurityAlert, 'id'>): Promise<void> {
    const alert: SecurityAlert = {
      ...alertData,
      id: crypto.randomUUID()
    };

    this.alerts.push(alert);

    // In production, this would integrate with security incident response
    await supabase.from('security_alerts').insert(alert);

    // Notify security team for high/critical alerts
    if (alert.severity === 'HIGH' || alert.severity === 'CRITICAL') {
      await this.notifySecurityTeam(alert);
    }
  }

  private static async notifySecurityTeam(alert: SecurityAlert): Promise<void> {
    // In production, this would send notifications via email, Slack, etc.
    console.warn('🚨 Security Alert:', alert);
  }

  private static async getClientIP(): Promise<string> {
    return 'client-ip-placeholder';
  }

  static getAlerts(): SecurityAlert[] {
    return [...this.alerts];
  }

  static async resolveAlert(alertId: string, resolvedBy: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedBy = resolvedBy;
      alert.resolvedAt = new Date();

      await supabase.from('security_alerts').update({
        resolved: true,
        resolved_by: resolvedBy,
        resolved_at: new Date()
      }).eq('id', alertId);
    }
  }
}

// Permission checker
export class PermissionChecker {
  static hasPermission(
    userRole: string,
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete',
    context?: Record<string, any>
  ): boolean {
    const rolePermissions = defaultPermissions.find(p => p.role === userRole);
    if (!rolePermissions) return false;

    // Check for wildcard permission
    const wildcardPermission = rolePermissions.permissions.find(p => p.resource === '*');
    if (wildcardPermission && wildcardPermission.actions.includes(action)) {
      return true;
    }

    // Check specific resource permission
    const resourcePermission = rolePermissions.permissions.find(p => p.resource === resource);
    if (!resourcePermission || !resourcePermission.actions.includes(action)) {
      return false;
    }

    // Check conditions if any
    if (resourcePermission.conditions && context) {
      return this.checkConditions(resourcePermission.conditions, context);
    }

    return true;
  }

  private static checkConditions(conditions: Record<string, any>, context: Record<string, any>): boolean {
    return Object.entries(conditions).every(([key, value]) => {
      return context[key] === value;
    });
  }
}

// Password strength validator
export class PasswordValidator {
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < securityConfig.passwordMinLength) {
      errors.push(`Password must be at least ${securityConfig.passwordMinLength} characters long`);
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (securityConfig.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    if (/(.)\1{2,}/.test(password)) {
      errors.push('Password cannot contain repeated characters');
    }

    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'password123'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.push('Password cannot contain common patterns');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*(),.?":{}|<>';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

// Session manager
export class SessionManager {
  private static sessionTimer: NodeJS.Timeout | null = null;
  private static lastActivity: Date = new Date();

  static startSession(): void {
    this.lastActivity = new Date();
    this.resetSessionTimer();
    this.addActivityListeners();
  }

  static endSession(): void {
    this.clearSessionTimer();
    this.removeActivityListeners();
    TokenManager.clearTokens();
    sessionStorage.clear();
  }

  static updateActivity(): void {
    this.lastActivity = new Date();
    this.resetSessionTimer();
  }

  static isSessionValid(): boolean {
    const sessionAge = Date.now() - this.lastActivity.getTime();
    return sessionAge < (securityConfig.sessionTimeout * 60 * 1000);
  }

  private static resetSessionTimer(): void {
    this.clearSessionTimer();
    this.sessionTimer = setTimeout(() => {
      this.handleSessionTimeout();
    }, securityConfig.sessionTimeout * 60 * 1000);
  }

  private static clearSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  private static handleSessionTimeout(): void {
    alert('Your session has expired due to inactivity. Please log in again.');
    this.endSession();
    window.location.href = '/auth';
  }

  private static addActivityListeners(): void {
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, this.updateActivity.bind(this), true);
    });
  }

  private static removeActivityListeners(): void {
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.removeEventListener(event, this.updateActivity.bind(this), true);
    });
  }
}

// Main security service
export class SecurityService {
  static async initialize(): Promise<void> {
    // Check if user has valid session
    if (TokenManager.isTokenExpired()) {
      const refreshed = await TokenManager.refreshAccessToken();
      if (!refreshed) {
        TokenManager.clearTokens();
        return;
      }
    }

    // Start session management
    SessionManager.startSession();

    // Log initialization
    await AuditLogger.log({
      userId: 'system',
      userEmail: 'system',
      action: 'READ',
      resource: 'security_service',
      details: { action: 'initialize' },
      success: true,
      riskLevel: 'LOW'
    });
  }

  static async authenticate(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const ipAddress = await this.getClientIP();
    
    try {
      // Check if account is locked
      const canAttemptLogin = await SecurityMonitor.recordLoginAttempt(email, false, ipAddress);
      if (!canAttemptLogin) {
        return { success: false, error: 'Account temporarily locked due to multiple failed attempts' };
      }

      // Attempt authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error || !data.session) {
        await AuditLogger.log({
          userId: 'unknown',
          userEmail: email,
          action: 'LOGIN',
          resource: 'authentication',
          success: false,
          errorMessage: error?.message || 'Authentication failed',
          riskLevel: 'MEDIUM'
        });

        return { success: false, error: error?.message || 'Authentication failed' };
      }

      // Success - record successful login
      await SecurityMonitor.recordLoginAttempt(email, true, ipAddress);
      TokenManager.setTokens(data.session.access_token, data.session.refresh_token);
      SessionManager.startSession();

      await AuditLogger.log({
        userId: data.user.id,
        userEmail: email,
        action: 'LOGIN',
        resource: 'authentication',
        success: true,
        riskLevel: 'LOW'
      });

      return { success: true };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Authentication service error' };
    }
  }

  static async logout(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await AuditLogger.log({
        userId: user.id,
        userEmail: user.email || 'unknown',
        action: 'LOGOUT',
        resource: 'authentication',
        success: true,
        riskLevel: 'LOW'
      });
    }

    await supabase.auth.signOut();
    SessionManager.endSession();
  }

  private static async getClientIP(): Promise<string> {
    return 'client-ip-placeholder';
  }
}

// Legacy exports for backward compatibility
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .slice(0, 500); // Limit length
}

export async function logSecurityEvent(
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: any
): Promise<void> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    await supabase.rpc('log_security_event', {
      p_action: action,
      p_resource_type: resourceType,
      p_resource_id: resourceId,
      p_details: details
    });
  } catch (error) {
    console.error('Failed to log security event:', { action, error });
  }
}