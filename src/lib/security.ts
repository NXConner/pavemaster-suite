import DOMPurify from 'dompurify';
import { z } from 'zod';

// Enhanced input sanitization
export const sanitizeHtml = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: []
  });
};

export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '').substring(0, 1000);
};

export const sanitizeNumber = (input: any): number | null => {
  const num = parseFloat(input);
  return isNaN(num) ? null : num;
};

// Enhanced validation schemas
export const phoneSchema = z.string()
  .regex(/^\+?[\d\s\-\(\)]{10,15}$/, 'Invalid phone number format');

export const currencySchema = z.number()
  .min(0, 'Amount must be positive')
  .max(999999999, 'Amount too large');

export const textAreaSchema = z.string()
  .max(5000, 'Text too long')
  .transform(sanitizeHtml);

export const contractSchema = z.object({
  client_name: z.string().min(1, 'Client name required').max(100).transform(sanitizeString),
  client_email: z.string().email('Invalid email'),
  client_phone: phoneSchema,
  project_description: textAreaSchema,
  quoted_amount: currencySchema.optional(),
  terms: textAreaSchema,
});

export const estimateRequestSchema = z.object({
  customer_name: z.string().min(1, 'Customer name required').max(100).transform(sanitizeString),
  customer_email: z.string().email('Invalid email'),
  customer_phone: phoneSchema,
  service_type: z.enum(['sealcoating', 'paving', 'line_striping', 'crack_sealing']),
  property_size: z.string().max(50).transform(sanitizeString),
  description: textAreaSchema,
});

export const photoReportSchema = z.object({
  title: z.string().min(1, 'Title required').max(100).transform(sanitizeString),
  description: textAreaSchema,
  location: z.string().max(200).transform(sanitizeString),
  tags: z.array(z.string().max(50).transform(sanitizeString)).max(10),
});

// Enhanced rate limiting
class SecurityRateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  isAllowed(
    identifier: string, 
    maxAttempts: number = 5, 
    windowMs: number = 300000,
    action: string = 'default'
  ): boolean {
    const key = `${identifier}:${action}`;
    const now = Date.now();
    const entry = this.attempts.get(key);

    if (!entry || now > entry.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (entry.count >= maxAttempts) {
      return false;
    }

    entry.count++;
    return true;
  }

  reset(identifier: string, action: string = 'default'): void {
    this.attempts.delete(`${identifier}:${action}`);
  }

  getRemainingAttempts(identifier: string, maxAttempts: number = 5, action: string = 'default'): number {
    const key = `${identifier}:${action}`;
    const entry = this.attempts.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return maxAttempts;
    }
    return Math.max(0, maxAttempts - entry.count);
  }
}

export const rateLimiter = new SecurityRateLimiter();

// Security event logging
export interface SecurityEvent {
  type: 'authentication' | 'authorization' | 'input_validation' | 'rate_limit' | 'data_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export const logSecurityEvent = async (event: SecurityEvent) => {
  try {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[SECURITY EVENT]', event);
    }

    // In production, send to monitoring service
    // await fetch('/api/security/log', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(event)
    // });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

// Input validation helper with security logging
export const validateInput = <T>(
  schema: z.ZodSchema<T>, 
  data: unknown,
  context?: string
): { success: boolean; data?: T; errors?: Record<string, string> } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });

      // Log validation failure
      logSecurityEvent({
        type: 'input_validation',
        severity: 'medium',
        action: 'validation_failed',
        metadata: { context, errors: error.errors }
      });

      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

// CSRF protection helper
export const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

export const validateCSRFToken = (token: string, sessionToken: string): boolean => {
  return token === sessionToken;
};

// Session security helpers
export const getClientIP = (): string => {
  // In a real app, extract from headers
  return 'unknown';
};

export const getUserAgent = (): string => {
  return navigator.userAgent || 'unknown';
};

// Content Security Policy helper
export const getCSPHeader = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' https:",
    "font-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'"
  ].join('; ');
};