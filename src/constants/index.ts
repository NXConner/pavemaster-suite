// Application Constants
export const APP_NAME = 'PaveMaster Suite';
export const APP_VERSION = '2.0.0';
export const APP_DESCRIPTION = 'Advanced Construction Management Platform';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
export const API_TIMEOUT = 30000; // 30 seconds
export const API_RETRY_ATTEMPTS = 3;

// Authentication
export const AUTH_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_DATA_KEY = 'user_data';
export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'pavemaster_theme',
  LANGUAGE: 'pavemaster_language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  USER_PREFERENCES: 'user_preferences',
  RECENT_PROJECTS: 'recent_projects',
  DASHBOARD_LAYOUT: 'dashboard_layout',
  NOTIFICATIONS_READ: 'notifications_read',
  FORM_DRAFTS: 'form_drafts',
  CACHE_PREFIX: 'pavemaster_cache_',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:id',
  ESTIMATES: '/estimates',
  ESTIMATE_DETAIL: '/estimates/:id',
  FINANCIAL: '/financial',
  INVENTORY: '/inventory',
  EQUIPMENT: '/equipment',
  TEAM: '/team',
  CLIENTS: '/clients',
  CLIENT_DETAIL: '/clients/:id',
  ANALYTICS: '/analytics',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  AUTH: '/auth',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  NOT_FOUND: '/404',
} as const;

// User Roles and Permissions
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  VIEWER: 'viewer',
} as const;

export const PERMISSIONS = {
  // Project permissions
  PROJECT_CREATE: 'project:create',
  PROJECT_READ: 'project:read',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  
  // Estimate permissions
  ESTIMATE_CREATE: 'estimate:create',
  ESTIMATE_READ: 'estimate:read',
  ESTIMATE_UPDATE: 'estimate:update',
  ESTIMATE_DELETE: 'estimate:delete',
  ESTIMATE_APPROVE: 'estimate:approve',
  
  // Financial permissions
  FINANCIAL_READ: 'financial:read',
  FINANCIAL_WRITE: 'financial:write',
  FINANCIAL_APPROVE: 'financial:approve',
  
  // Team permissions
  TEAM_READ: 'team:read',
  TEAM_MANAGE: 'team:manage',
  TEAM_INVITE: 'team:invite',
  
  // Settings permissions
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',
  SETTINGS_ADMIN: 'settings:admin',
} as const;

// Project Types and Statuses
export const PROJECT_TYPES = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
  INFRASTRUCTURE: 'infrastructure',
  RENOVATION: 'renovation',
} as const;

export const PROJECT_STATUSES = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on-hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const PROJECT_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Equipment Types and Statuses
export const EQUIPMENT_TYPES = {
  EXCAVATOR: 'excavator',
  BULLDOZER: 'bulldozer',
  CRANE: 'crane',
  TRUCK: 'truck',
  ROLLER: 'roller',
  PAVER: 'paver',
  MIXER: 'mixer',
  GENERATOR: 'generator',
  COMPRESSOR: 'compressor',
} as const;

export const EQUIPMENT_STATUSES = {
  AVAILABLE: 'available',
  IN_USE: 'in_use',
  MAINTENANCE: 'maintenance',
  OUT_OF_SERVICE: 'out_of_service',
} as const;

// Estimate Statuses
export const ESTIMATE_STATUSES = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SENT: 'sent',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
} as const;

// Payment Statuses
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// File Types and Limits
export const FILE_TYPES = {
  IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
  CAD_FILES: ['dwg', 'dxf', 'step', 'iges'],
  COMPRESSED: ['zip', 'rar', '7z'],
} as const;

export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_COUNT: 10,
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks for upload
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MM/DD/YYYY',
  LONG: 'MMMM DD, YYYY',
  WITH_TIME: 'MM/DD/YYYY HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.sssZ',
  TIME_ONLY: 'HH:mm',
  MONTH_YEAR: 'MMMM YYYY',
} as const;

// Currency and Number Formats
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  CAD: 'CAD',
} as const;

export const NUMBER_FORMATS = {
  DECIMAL_PLACES: 2,
  THOUSANDS_SEPARATOR: ',',
  DECIMAL_SEPARATOR: '.',
} as const;

// Theme Configuration
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const SIDEBAR_STATES = {
  EXPANDED: 'expanded',
  COLLAPSED: 'collapsed',
  HIDDEN: 'hidden',
} as const;

// Animation Durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

// Breakpoints (matches Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Z-Index Scale
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
  LOADING: 1090,
} as const;

// Error Codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: 'enableAnalytics',
  ENABLE_NOTIFICATIONS: 'enableNotifications',
  ENABLE_DARK_MODE: 'enableDarkMode',
  ENABLE_OFFLINE_MODE: 'enableOfflineMode',
  ENABLE_REALTIME_UPDATES: 'enableRealtimeUpdates',
  ENABLE_ADVANCED_CHARTS: 'enableAdvancedCharts',
  ENABLE_FILE_UPLOADS: 'enableFileUploads',
  ENABLE_TEAM_COLLABORATION: 'enableTeamCollaboration',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]{10,}$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PROJECT_NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  CURRENCY_DECIMAL_PLACES: 2,
} as const;

// Chart Configuration
export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#06b6d4',
  SECONDARY: '#6b7280',
} as const;

export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  DOUGHNUT: 'doughnut',
  AREA: 'area',
  SCATTER: 'scatter',
} as const;

// Performance Monitoring
export const PERFORMANCE_METRICS = {
  PAGE_LOAD_TIME: 'page_load_time',
  API_RESPONSE_TIME: 'api_response_time',
  COMPONENT_RENDER_TIME: 'component_render_time',
  BUNDLE_SIZE: 'bundle_size',
  MEMORY_USAGE: 'memory_usage',
} as const;

// Cache Configuration
export const CACHE_DURATIONS = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 2 * 60 * 60 * 1000, // 2 hours
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Export all constants as default
export default {
  APP_NAME,
  APP_VERSION,
  API_BASE_URL,
  STORAGE_KEYS,
  ROUTES,
  USER_ROLES,
  PERMISSIONS,
  PROJECT_TYPES,
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
  EQUIPMENT_TYPES,
  EQUIPMENT_STATUSES,
  ESTIMATE_STATUSES,
  PAYMENT_STATUSES,
  NOTIFICATION_TYPES,
  FILE_TYPES,
  FILE_LIMITS,
  DATE_FORMATS,
  CURRENCIES,
  THEMES,
  ANIMATION_DURATIONS,
  BREAKPOINTS,
  Z_INDEX,
  ERROR_CODES,
  FEATURE_FLAGS,
  VALIDATION_RULES,
  CHART_COLORS,
  CHART_TYPES,
  PERFORMANCE_METRICS,
  CACHE_DURATIONS,
};