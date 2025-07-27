/**
 * Security Configuration for PaveMaster Suite
 * Centralized security settings and hardening configurations
 */

// Security Headers Configuration
export const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.openai.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co https://api.openai.com wss://*.supabase.co",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  AUTH: {
    maxAttempts: 5,
    windowMinutes: 15,
    blockDurationMinutes: 30
  },
  API: {
    maxAttempts: 100,
    windowMinutes: 1,
    blockDurationMinutes: 5
  },
  UPLOAD: {
    maxAttempts: 10,
    windowMinutes: 1,
    blockDurationMinutes: 10
  },
  AI_REQUESTS: {
    maxAttempts: 20,
    windowMinutes: 15,
    blockDurationMinutes: 15
  }
};

// File Upload Security Configuration
export const FILE_UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  forbiddenExtensions: [
    '.exe', '.scr', '.bat', '.cmd', '.com', '.pif', 
    '.vbs', '.js', '.jar', '.msi', '.dll', '.app'
  ],
  scanForMalware: true,
  quarantineDirectory: '/quarantine/'
};

// Password Policy Configuration
export const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbidCommonPasswords: true,
  preventPasswordReuse: 5,
  maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
  complexityScore: 60
};

// Session Management Configuration
export const SESSION_CONFIG = {
  maxDuration: 8 * 60 * 60 * 1000, // 8 hours
  idleTimeout: 30 * 60 * 1000, // 30 minutes
  renewalThreshold: 15 * 60 * 1000, // 15 minutes before expiry
  maxConcurrentSessions: 3,
  secureOnly: true,
  sameSite: 'strict' as const
};

// Input Validation Configuration
export const INPUT_VALIDATION = {
  maxStringLength: 2000,
  maxArrayLength: 100,
  maxObjectDepth: 5,
  allowedHtmlTags: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
  sanitizeHtml: true,
  stripScripts: true,
  encodingWhitelist: ['utf-8']
};

// API Security Configuration
export const API_SECURITY = {
  enableCors: true,
  corsOrigins: ['localhost', '.supabase.co', '.vercel.app', '.netlify.app'],
  requireApiKey: false, // Using Supabase auth instead
  maxRequestSize: '1mb',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000
};

// Audit Logging Configuration
export const AUDIT_CONFIG = {
  logAuthEvents: true,
  logDataAccess: true,
  logAdminActions: true,
  logSecurityEvents: true,
  logApiCalls: false, // Too verbose for production
  retentionDays: 90,
  realTimeAlerts: true,
  sensitiveDataMasking: true
};

// Security Monitoring Configuration
export const MONITORING_CONFIG = {
  enableRealTimeAlerts: true,
  suspiciousActivityThreshold: 5,
  alertChannels: ['email', 'dashboard'],
  monitoringInterval: 60000, // 1 minute
  healthCheckEndpoints: ['/health', '/api/health'],
  performanceThresholds: {
    responseTime: 2000, // 2 seconds
    errorRate: 0.05, // 5%
    cpuUsage: 0.8, // 80%
    memoryUsage: 0.9 // 90%
  }
};

// Encryption Configuration
export const ENCRYPTION_CONFIG = {
  algorithm: 'AES-256-GCM',
  keyRotationDays: 30,
  encryptSensitiveFields: true,
  hashPasswords: true,
  saltRounds: 12,
  encryptAuditLogs: true
};

// Backup and Recovery Configuration
export const BACKUP_CONFIG = {
  enableAutomaticBackups: true,
  backupInterval: 24 * 60 * 60 * 1000, // Daily
  retentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
  encryptBackups: true,
  offSiteBackup: true,
  testRestoreProcedure: true
};

// Security Feature Flags
export const SECURITY_FEATURES = {
  enableTwoFactorAuth: false, // Future enhancement
  enableBiometricAuth: false, // Future enhancement
  enableDeviceFingerprinting: true,
  enableGeoBlocking: false, // Future enhancement
  enableAdvancedThreatDetection: true,
  enableSecurityQuestions: false, // Using email recovery instead
  enableLoginNotifications: true,
  enablePasswordlessLogin: false // Future enhancement
};

// Compliance Configuration
export const COMPLIANCE_CONFIG = {
  gdprCompliant: true,
  ccpaCompliant: true,
  hipaaCompliant: false, // Not handling health data
  pciCompliant: false, // Not handling payment data directly
  auditTrails: true,
  dataMinimization: true,
  rightToErasure: true,
  dataPortability: true
};

// Development vs Production Security
export const getSecurityConfig = () => {
  const isDev = process.env.NODE_ENV === 'development';
  
  return {
    ...SECURITY_HEADERS,
    rateLimit: isDev ? {
      ...RATE_LIMIT_CONFIG,
      AUTH: { ...RATE_LIMIT_CONFIG.AUTH, maxAttempts: 20 } // More lenient in dev
    } : RATE_LIMIT_CONFIG,
    session: isDev ? {
      ...SESSION_CONFIG,
      maxDuration: 24 * 60 * 60 * 1000, // Longer sessions in dev
      secureOnly: false // Allow non-HTTPS in dev
    } : SESSION_CONFIG,
    monitoring: isDev ? {
      ...MONITORING_CONFIG,
      enableRealTimeAlerts: false // No alerts in dev
    } : MONITORING_CONFIG
  };
};

export default {
  SECURITY_HEADERS,
  RATE_LIMIT_CONFIG,
  FILE_UPLOAD_CONFIG,
  PASSWORD_POLICY,
  SESSION_CONFIG,
  INPUT_VALIDATION,
  API_SECURITY,
  AUDIT_CONFIG,
  MONITORING_CONFIG,
  ENCRYPTION_CONFIG,
  BACKUP_CONFIG,
  SECURITY_FEATURES,
  COMPLIANCE_CONFIG,
  getSecurityConfig
};