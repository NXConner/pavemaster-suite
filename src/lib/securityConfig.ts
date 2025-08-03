// Enhanced Security Configuration for PaveMaster Suite
export const SECURITY_CONFIG = {
  // Rate Limiting Configuration
  RATE_LIMITS: {
    LOGIN_ATTEMPTS: {
      max: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDuration: 60 * 60 * 1000, // 1 hour
    },
    API_CALLS: {
      max: 100,
      windowMs: 60 * 1000, // 1 minute
    },
    FORM_SUBMISSIONS: {
      max: 10,
      windowMs: 5 * 60 * 1000, // 5 minutes
    },
  },

  // Input Validation Rules
  INPUT_VALIDATION: {
    MAX_STRING_LENGTH: 1000,
    MAX_NAME_LENGTH: 50,
    MAX_EMAIL_LENGTH: 100,
    MAX_PHONE_LENGTH: 20,
    MAX_ADDRESS_LENGTH: 200,
    ALLOWED_FILE_TYPES: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  },

  // Security Headers
  SECURITY_HEADERS: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  },

  // Content Security Policy
  CSP_POLICY: {
    'default-src': ['\'self\''],
    'script-src': ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\''],
    'style-src': ['\'self\'', '\'unsafe-inline\''],
    'img-src': ['\'self\'', 'data:', 'https:'],
    'connect-src': ['\'self\'', 'https:'],
    'font-src': ['\'self\''],
    'frame-ancestors': ['\'none\''],
    'base-uri': ['\'self\''],
  },

  // Authentication Configuration
  AUTH_CONFIG: {
    SESSION_TIMEOUT: 60 * 60 * 1000, // 1 hour
    PASSWORD_MIN_LENGTH: 12,
    PASSWORD_REQUIRE_UPPERCASE: true,
    PASSWORD_REQUIRE_LOWERCASE: true,
    PASSWORD_REQUIRE_NUMBERS: true,
    PASSWORD_REQUIRE_SYMBOLS: true,
    MFA_REQUIRED_FOR_ADMIN: true,
    OTP_EXPIRY_MINUTES: 5,
  },

  // Logging Configuration
  LOGGING: {
    SECURITY_EVENTS: true,
    LOGIN_ATTEMPTS: true,
    DATA_ACCESS: true,
    FAILED_VALIDATIONS: true,
    RATE_LIMIT_VIOLATIONS: true,
    LOG_RETENTION_DAYS: 90,
  },

  // Encryption Configuration
  ENCRYPTION: {
    ALGORITHM: 'AES-256-GCM',
    KEY_LENGTH: 32,
    IV_LENGTH: 16,
    TAG_LENGTH: 16,
  },

  // Audit Configuration
  AUDIT: {
    TRACK_USER_ACTIONS: true,
    TRACK_DATA_CHANGES: true,
    TRACK_LOGIN_LOGOUT: true,
    TRACK_PERMISSION_CHANGES: true,
    RETENTION_PERIOD_DAYS: 365,
  },
};

// Security Event Types
export const SECURITY_EVENT_TYPES = {
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  INPUT_VALIDATION: 'input_validation',
  RATE_LIMIT: 'rate_limit',
  DATA_ACCESS: 'data_access',
  SECURITY_VIOLATION: 'security_violation',
  SYSTEM_ERROR: 'system_error',
} as const;

// Security Event Severities
export const SECURITY_SEVERITIES = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
} as const;

// Security Actions
export const SECURITY_ACTIONS = {
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  PASSWORD_CHANGED: 'password_changed',
  PERMISSION_DENIED: 'permission_denied',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  INVALID_INPUT: 'invalid_input',
  DATA_EXPORTED: 'data_exported',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
} as const;

export type SecurityEventType = typeof SECURITY_EVENT_TYPES[keyof typeof SECURITY_EVENT_TYPES];
export type SecuritySeverity = typeof SECURITY_SEVERITIES[keyof typeof SECURITY_SEVERITIES];
export type SecurityAction = typeof SECURITY_ACTIONS[keyof typeof SECURITY_ACTIONS];