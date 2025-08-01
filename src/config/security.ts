/**
 * Security Configuration for PaveMaster Suite
 * Centralizes all security-related settings and policies
 */

export const SECURITY_CONFIG = {
  // Content Security Policy Configuration
  csp: {
    // Production CSP - strict security
    production: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for some React functionality
        'https://cdn.jsdelivr.net',
        'https://unpkg.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for styled-components and CSS-in-JS
        'https://fonts.googleapis.com'
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https:',
        'https://*.supabase.co',
        'https://*.googleapis.com'
      ],
      'connect-src': [
        "'self'",
        'https://*.supabase.co',
        'wss://*.supabase.co',
        'https://api.openweathermap.org',
        'https://nominatim.openstreetmap.org'
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'data:'
      ],
      'object-src': ["'none'"],
      'media-src': ["'self'", 'blob:', 'data:'],
      'frame-src': ["'self'"],
      'worker-src': ["'self'", 'blob:'],
      'child-src': ["'self'"],
      'form-action': ["'self'"],
      'base-uri': ["'self'"],
      'manifest-src': ["'self'"]
    },
    
    // Development CSP - more permissive for development tools
    development: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'", // Required for development tools
        'https://cdn.jsdelivr.net',
        'http://localhost:*',
        'ws://localhost:*'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com'
      ],
      'img-src': ["'self'", 'data:', 'blob:', 'https:', 'http:'],
      'connect-src': [
        "'self'",
        'https:',
        'http:',
        'ws:',
        'wss:'
      ],
      'font-src': ["'self'", 'https:', 'data:'],
      'object-src': ["'none'"],
      'media-src': ["'self'", 'blob:', 'data:'],
      'frame-src': ["'self'"],
      'worker-src': ["'self'", 'blob:']
    }
  },

  // Security Headers Configuration
  headers: {
    // Strict Transport Security
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    
    // X-Frame-Options
    frameOptions: 'DENY',
    
    // X-Content-Type-Options
    contentTypeOptions: 'nosniff',
    
    // Referrer Policy
    referrerPolicy: 'strict-origin-when-cross-origin',
    
    // Permissions Policy
    permissionsPolicy: {
      camera: '()',
      microphone: '()',
      geolocation: '(self)',
      bluetooth: '()',
      usb: '()',
      magnetometer: '()',
      accelerometer: '()',
      gyroscope: '()',
      payment: '()'
    }
  },

  // Input Validation Rules
  validation: {
    maxInputLength: 10000,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: [
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx',
      '.txt', '.csv', '.zip'
    ],
    
    // Email validation pattern
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    
    // Password requirements
    password: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      forbiddenPatterns: [
        'password', '123456', 'admin', 'user',
        'pavemaster', 'suite'
      ]
    }
  },

  // Rate Limiting Configuration
  rateLimiting: {
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5
    },
    api: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100
    },
    fileUpload: {
      windowMs: 60 * 1000, // 1 minute
      maxUploads: 10
    }
  },

  // Encryption Settings
  encryption: {
    algorithm: 'AES-GCM',
    keyLength: 256,
    ivLength: 12,
    tagLength: 16
  },

  // Audit Logging Configuration
  audit: {
    events: [
      'login',
      'logout',
      'failed_login',
      'password_change',
      'data_access',
      'file_upload',
      'api_access',
      'security_violation',
      'rate_limit_exceeded'
    ],
    retentionDays: 90,
    enableRealTimeAlerts: true
  }
};

/**
 * Generate CSP header string for current environment
 */
export function generateCSPHeader(): string {
  const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  const cspConfig = SECURITY_CONFIG.csp[env];
  
  const policies = Object.entries(cspConfig).map(([directive, sources]) => {
    return `${directive} ${sources.join(' ')}`;
  });
  
  return policies.join('; ');
}

/**
 * Generate all security headers for HTTP responses
 */
export function generateSecurityHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Security-Policy': generateCSPHeader(),
    'X-Content-Type-Options': SECURITY_CONFIG.headers.contentTypeOptions,
    'X-Frame-Options': SECURITY_CONFIG.headers.frameOptions,
    'Referrer-Policy': SECURITY_CONFIG.headers.referrerPolicy
  };

  // Add HSTS in production
  if (process.env.NODE_ENV === 'production') {
    const hsts = SECURITY_CONFIG.headers.hsts;
    headers['Strict-Transport-Security'] = 
      `max-age=${hsts.maxAge}${hsts.includeSubDomains ? '; includeSubDomains' : ''}${hsts.preload ? '; preload' : ''}`;
  }

  // Add Permissions Policy
  const permissions = Object.entries(SECURITY_CONFIG.headers.permissionsPolicy)
    .map(([permission, allowlist]) => `${permission}=${allowlist}`)
    .join(', ');
  headers['Permissions-Policy'] = permissions;

  return headers;
}

/**
 * Validate password against security requirements
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const config = SECURITY_CONFIG.validation.password;
  const errors: string[] = [];

  if (password.length < config.minLength) {
    errors.push(`Password must be at least ${config.minLength} characters long`);
  }

  if (config.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (config.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (config.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check forbidden patterns
  const lowerPassword = password.toLowerCase();
  const hasForbiddenPattern = config.forbiddenPatterns.some(pattern => 
    lowerPassword.includes(pattern)
  );
  if (hasForbiddenPattern) {
    errors.push('Password contains forbidden words or patterns');
  }

  // Calculate strength
  let strengthScore = 0;
  if (password.length >= 12) strengthScore++;
  if (/[A-Z]/.test(password)) strengthScore++;
  if (/[a-z]/.test(password)) strengthScore++;
  if (/\d/.test(password)) strengthScore++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strengthScore++;
  if (password.length >= 16) strengthScore++;

  const strength = strengthScore >= 5 ? 'strong' : strengthScore >= 3 ? 'medium' : 'weak';

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
}

/**
 * Sanitize file name for safe storage
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts
  let sanitized = fileName.replace(/\.\./g, '');
  
  // Remove or replace dangerous characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop();
    const name = sanitized.substring(0, 255 - (ext?.length || 0) - 1);
    sanitized = `${name}.${ext}`;
  }
  
  return sanitized;
}

/**
 * Check if IP address should be blocked
 */
export function isBlockedIP(ip: string): boolean {
  // List of blocked IP ranges or patterns
  const blockedPatterns = [
    /^127\./, // Localhost (shouldn't reach here in production)
    /^10\./, // Private network
    /^192\.168\./, // Private network
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./ // Private network
  ];

  return blockedPatterns.some(pattern => pattern.test(ip));
}

export default SECURITY_CONFIG;