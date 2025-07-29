/**
 * Security utilities for PaveMaster Suite
 * Production-ready security functions with proper error handling
 */

import { supabase } from '../integrations/supabase/client';

// Input validation and sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove potential XSS characters
    .substring(0, 1000); // Limit length
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePassword = (password: string): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
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
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Session security
export const validateSession = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return false;
    }
    
    // Check if session is expired
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      await supabase.auth.signOut();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};

// Rate limiting helper
export const checkRateLimit = async (
  identifier: string,
  action: string,
  limit: number = 10,
  windowMinutes: number = 15
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_action: action,
      p_limit: limit,
      p_window_minutes: windowMinutes
    });
    
    if (error) {
      console.error('Rate limit check error:', error);
      return false; // Fail secure
    }
    
    return data === true;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return false; // Fail secure
  }
};

// Security event logging
export const logSecurityEvent = async (
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: any
): Promise<void> => {
  try {
    const params: any = {
      p_action: action,
      p_details: details ? JSON.stringify(details) : null
    };
    
    if (resourceType) {
      params.p_resource_type = resourceType;
    }
    
    if (resourceId) {
      params.p_resource_id = resourceId;
    }
    
    await supabase.rpc('log_security_event', params);
  } catch (error) {
    // Don't throw error for logging failures
    console.warn('Failed to log security event:', error);
  }
};

// Content Security Policy helpers
export const getSecureCSPHeader = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://api.openai.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co https://api.openai.com wss://*.supabase.co",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ');
};

// Secure random string generation
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// User role validation
export const hasPermission = async (requiredRole: string): Promise<boolean> => {
  try {
    const { data: userRole, error } = await supabase.rpc('get_current_user_role');
    
    if (error || !userRole) {
      return false;
    }
    
    // Role hierarchy: super_admin > admin > manager > user
    const roleHierarchy: { [key: string]: number } = {
      'super_admin': 4,
      'admin': 3,
      'manager': 2,
      'user': 1
    };
    
    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
};

// XSS protection
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// CSRF protection
export const generateCSRFToken = (): string => {
  return generateSecureToken(32);
};

export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  if (!token || !expectedToken || token.length !== expectedToken.length) {
    return false;
  }
  
  // Timing-safe comparison
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  
  return result === 0;
};