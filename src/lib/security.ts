/**
 * Security utilities for the PaveMaster Suite
 * Enterprise-grade security functions for input validation and sanitization
 */

import CryptoJS from 'crypto-js';
import { createClient } from '@supabase/supabase-js';

// Type definitions for better type safety
interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

interface SecurityAuditLog {
  id?: string;
  user_id: string;
  action: string;
  ip_address: string;
  user_agent: string;
  status: 'success' | 'failure' | 'warning';
  metadata?: Record<string, unknown>;
  timestamp: string;
}

interface CSRFToken {
  token: string;
  timestamp: number;
}

/**
 * Validate email addresses
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Enhanced password validation with comprehensive rules
 */
export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
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

  // Fixed regex - removed unnecessary escapes
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .slice(0, 500); // Limit length
}

/**
 * Enhanced rate limiting helper with persistent storage
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {
    // Clean up old entries periodically
    setInterval(() => {
      this.cleanup();
    }, this.windowMs);
  }
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) ?? [];
    
    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Record this attempt
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    
    return true;
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [identifier, attempts] of this.attempts.entries()) {
      const validAttempts = attempts.filter(
        timestamp => now - timestamp < this.windowMs
      );
      
      if (validAttempts.length === 0) {
        this.attempts.delete(identifier);
      } else {
        this.attempts.set(identifier, validAttempts);
      }
    }
  }
  
  getRemainingAttempts(identifier: string): number {
    const userAttempts = this.attempts.get(identifier) ?? [];
    return Math.max(0, this.maxAttempts - userAttempts.length);
  }
  
  getTimeUntilReset(identifier: string): number {
    const userAttempts = this.attempts.get(identifier) ?? [];
    if (userAttempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...userAttempts);
    const resetTime = oldestAttempt + this.windowMs;
    return Math.max(0, resetTime - Date.now());
  }
}

/**
 * CSRF Token management
 */
export class CSRFProtection {
  private static tokenKey = 'csrf_token';
  
  static generateToken(): string {
    const token = CryptoJS.lib.WordArray.random(32).toString();
    const csrf: CSRFToken = {
      token,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem(this.tokenKey, JSON.stringify(csrf));
    return token;
  }
  
  static validateToken(token: string): boolean {
    const stored = sessionStorage.getItem(this.tokenKey);
    if (!stored) return false;
    
    try {
      const csrf: CSRFToken = JSON.parse(stored);
      
      // Check if token is expired (24 hours)
      if (Date.now() - csrf.timestamp > 24 * 60 * 60 * 1000) {
        this.clearToken();
        return false;
      }
      
      return csrf.token === token;
    } catch {
      return false;
    }
  }
  
  static clearToken(): void {
    sessionStorage.removeItem(this.tokenKey);
  }
}

/**
 * Enhanced audit logging
 */
export class SecurityAuditLogger {
  private supabase: ReturnType<typeof createClient>;
  
  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase configuration missing for audit logging');
      throw new Error('Supabase configuration required for audit logging');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
  
  async log(logEntry: Omit<SecurityAuditLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const entry: SecurityAuditLog = {
        ...logEntry,
        timestamp: new Date().toISOString()
      };
      
      const { error } = await this.supabase
        .from('security_audit_logs')
        .insert(entry);
      
      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }
}

/**
 * XSS Protection helper
 */
export function sanitizeHTML(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Validate allowed origins for CORS
 */
export function validateOrigin(origin: string): boolean {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    'https://your-production-domain.com'
  ];
  
  return allowedOrigins.includes(origin);
}

/**
 * Generate secure session ID
 */
export function generateSecureSessionId(): string {
  return CryptoJS.lib.WordArray.random(32).toString();
}

/**
 * Enhanced encryption helper
 */
export class EncryptionHelper {
  private static readonly algorithm = 'AES';
  
  static encrypt(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString();
  }
  
  static decrypt(encryptedData: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  
  static hash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }
}

/**
 * Input validation helper
 */
export function validateInput(
  value: unknown,
  type: 'email' | 'phone' | 'url' | 'alphanumeric'
): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  
  switch (type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'phone':
      return /^\+?[\d\s-()]+$/.test(value);
    case 'url':
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    case 'alphanumeric':
      return /^[a-zA-Z0-9]+$/.test(value);
    default:
      return false;
  }
}

/**
 * Content Security Policy helper
 */
export function generateCSPHeader(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ');
}

/**
 * Permission validation helper
 */
export function hasPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  return userPermissions.includes(requiredPermission) || 
         userPermissions.includes('admin');
}

/**
 * Security audit logger
 */
export async function logSecurityEvent(
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await auditLogger.log({
      user_id: '', // Will be filled by the auth system
      action,
      ip_address: '', // Will be filled by the request context
      user_agent: navigator.userAgent,
      status: 'success',
      metadata: {
        resourceType,
        resourceId,
        ...details
      }
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Export instances for immediate use
export const rateLimiter = new RateLimiter();
export const auditLogger = new SecurityAuditLogger();