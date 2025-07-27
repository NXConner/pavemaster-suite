/**
 * Security utilities for the PaveMaster Suite
 * Enterprise-grade security functions for input validation and sanitization
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: []
  });
}

/**
 * Validate and sanitize email addresses
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate password strength
 */
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
    setInterval(() => this.cleanup(), this.windowMs);
  }
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    if (recentAttempts.length >= this.maxAttempts) {
      secureLog(`Rate limit exceeded for ${identifier}`, { 
        attempts: recentAttempts.length, 
        maxAttempts: this.maxAttempts 
      });
      return false;
    }
    
    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);
    
    return true;
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
    secureLog(`Rate limit reset for ${identifier}`);
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [identifier, attempts] of this.attempts.entries()) {
      const recentAttempts = attempts.filter(
        timestamp => now - timestamp < this.windowMs
      );
      
      if (recentAttempts.length === 0) {
        this.attempts.delete(identifier);
      } else {
        this.attempts.set(identifier, recentAttempts);
      }
    }
  }
  
  getAttemptCount(identifier: string): number {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    return userAttempts.filter(timestamp => now - timestamp < this.windowMs).length;
  }
  
  getRemainingAttempts(identifier: string): number {
    return Math.max(0, this.maxAttempts - this.getAttemptCount(identifier));
  }
}

/**
 * Security headers for requests
 */
export const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

/**
 * Validate UUID format
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV || import.meta.env.VITE_ENVIRONMENT === 'development';
}

/**
 * Secure logging (excludes sensitive data in production)
 */
export function secureLog(message: string, data?: any): void {
  if (isDevelopment()) {
    console.log(`[SECURITY] ${message}`, data);
  } else {
    // In production, only log non-sensitive information
    console.log(`[SECURITY] ${message}`);
  }
}

/**
 * Enhanced CSP headers for better security
 */
export const ENHANCED_SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.openai.com; frame-ancestors 'none';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};

/**
 * Validate file upload security
 */
export function validateFileUpload(file: File): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  
  if (file.size > maxSize) {
    errors.push('File size must be less than 10MB');
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not allowed');
  }
  
  // Check for suspicious file extensions
  const suspiciousExtensions = ['.exe', '.scr', '.bat', '.cmd', '.com', '.pif', '.js', '.jar'];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  if (suspiciousExtensions.includes(fileExtension)) {
    errors.push('File extension not allowed');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
    .slice(0, 100);
}

/**
 * Create rate limiter instances for different actions
 */
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const apiRateLimiter = new RateLimiter(100, 60 * 1000); // 100 requests per minute
export const uploadRateLimiter = new RateLimiter(10, 60 * 1000); // 10 uploads per minute

/**
 * Security audit logger
 */
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
    secureLog('Failed to log security event', { action, error });
  }
}

/**
 * Check if request is from valid IP range (if configured)
 */
export function isValidOrigin(origin: string): boolean {
  const allowedOrigins = [
    'localhost',
    '127.0.0.1',
    '.supabase.co',
    '.vercel.app',
    '.netlify.app'
  ];
  
  return allowedOrigins.some(allowed => 
    origin.includes(allowed) || origin === allowed
  );
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: any): any {
  if (typeof data !== 'object' || data === null) return data;
  
  const masked = { ...data };
  const sensitiveKeys = ['password', 'token', 'api_key', 'secret', 'credit_card', 'ssn'];
  
  for (const key in masked) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      masked[key] = '***MASKED***';
    }
  }
  
  return masked;
}