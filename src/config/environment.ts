/**
 * Comprehensive environment configuration for production deployment
 */

// Environment types
export type Environment = 'development' | 'staging' | 'production' | 'test';

// API configuration
interface APIConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  rateLimitPerMinute: number;
}

// Feature flags configuration
interface FeatureFlags {
  enableAnalytics: boolean;
  enableReports: boolean;
  enableRealTimeUpdates: boolean;
  enableOfflineMode: boolean;
  enablePushNotifications: boolean;
  enableAdvancedCharts: boolean;
  enableDataExport: boolean;
  enableUserManagement: boolean;
  enableBetaFeatures: boolean;
  enableDebugMode: boolean;
  enablePerformanceMonitoring: boolean;
  enableAccessibilityFeatures: boolean;
  enableMobileOptimizations: boolean;
  enablePWAFeatures: boolean;
}

// Performance configuration
interface PerformanceConfig {
  enableCodeSplitting: boolean;
  enablePreloading: boolean;
  bundleSizeWarningLimit: number;
  enableServiceWorker: boolean;
  cacheStrategy: 'aggressive' | 'conservative' | 'minimal';
  enableWebVitalsTracking: boolean;
  enableErrorBoundaries: boolean;
}

// Security configuration
interface SecurityConfig {
  enableCSRFProtection: boolean;
  enableContentSecurityPolicy: boolean;
  enableSecurityHeaders: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  enableAuditLogging: boolean;
  enableRateLimiting: boolean;
  trustedDomains: string[];
}

// Monitoring configuration
interface MonitoringConfig {
  enableSentry: boolean;
  enableAnalytics: boolean;
  enablePerformanceTracking: boolean;
  enableUserBehaviorTracking: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  apiKeys: {
    sentry?: string;
    analytics?: string;
    monitoring?: string;
  };
}

// Complete application configuration
interface AppConfig {
  environment: Environment;
  version: string;
  buildTime: string;
  api: APIConfig;
  features: FeatureFlags;
  performance: PerformanceConfig;
  security: SecurityConfig;
  monitoring: MonitoringConfig;
  app: {
    name: string;
    description: string;
    supportEmail: string;
    documentationUrl: string;
    maxUploadSize: number;
    allowedFileTypes: string[];
    defaultLanguage: string;
    supportedLanguages: string[];
    timezone: string;
  };
}

// Environment-specific configurations
const configurations: Record<Environment, Partial<AppConfig>> = {
  development: {
    api: {
      baseUrl: 'http://localhost:3000/api',
      timeout: 10000,
      retryAttempts: 1,
      retryDelay: 1000,
      rateLimitPerMinute: 1000,
    },
    features: {
      enableAnalytics: true,
      enableReports: true,
      enableRealTimeUpdates: false,
      enableOfflineMode: true,
      enablePushNotifications: false,
      enableAdvancedCharts: true,
      enableDataExport: true,
      enableUserManagement: true,
      enableBetaFeatures: true,
      enableDebugMode: true,
      enablePerformanceMonitoring: true,
      enableAccessibilityFeatures: true,
      enableMobileOptimizations: true,
      enablePWAFeatures: true,
    },
    performance: {
      enableCodeSplitting: true,
      enablePreloading: true,
      bundleSizeWarningLimit: 2000,
      enableServiceWorker: true,
      cacheStrategy: 'conservative',
      enableWebVitalsTracking: true,
      enableErrorBoundaries: true,
    },
    security: {
      enableCSRFProtection: true,
      enableContentSecurityPolicy: false,
      enableSecurityHeaders: false,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      maxLoginAttempts: 10,
      enableAuditLogging: true,
      enableRateLimiting: false,
      trustedDomains: ['localhost:3000', 'localhost:8080'],
    },
    monitoring: {
      enableSentry: false,
      enableAnalytics: false,
      enablePerformanceTracking: true,
      enableUserBehaviorTracking: false,
      logLevel: 'debug',
      enableConsoleLogging: true,
      enableRemoteLogging: false,
      apiKeys: {},
    },
  },

  staging: {
    api: {
      baseUrl: 'https://staging-api.pavemaster.app/api',
      timeout: 15000,
      retryAttempts: 2,
      retryDelay: 2000,
      rateLimitPerMinute: 500,
    },
    features: {
      enableAnalytics: true,
      enableReports: true,
      enableRealTimeUpdates: true,
      enableOfflineMode: true,
      enablePushNotifications: true,
      enableAdvancedCharts: true,
      enableDataExport: true,
      enableUserManagement: true,
      enableBetaFeatures: true,
      enableDebugMode: false,
      enablePerformanceMonitoring: true,
      enableAccessibilityFeatures: true,
      enableMobileOptimizations: true,
      enablePWAFeatures: true,
    },
    performance: {
      enableCodeSplitting: true,
      enablePreloading: true,
      bundleSizeWarningLimit: 1500,
      enableServiceWorker: true,
      cacheStrategy: 'aggressive',
      enableWebVitalsTracking: true,
      enableErrorBoundaries: true,
    },
    security: {
      enableCSRFProtection: true,
      enableContentSecurityPolicy: true,
      enableSecurityHeaders: true,
      sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
      maxLoginAttempts: 5,
      enableAuditLogging: true,
      enableRateLimiting: true,
      trustedDomains: ['staging.pavemaster.app'],
    },
    monitoring: {
      enableSentry: true,
      enableAnalytics: true,
      enablePerformanceTracking: true,
      enableUserBehaviorTracking: true,
      logLevel: 'info',
      enableConsoleLogging: false,
      enableRemoteLogging: true,
      apiKeys: {
        sentry: process.env.VITE_SENTRY_DSN,
        analytics: process.env.VITE_ANALYTICS_ID,
      },
    },
  },

  production: {
    api: {
      baseUrl: 'https://api.pavemaster.app/api',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 3000,
      rateLimitPerMinute: 300,
    },
    features: {
      enableAnalytics: true,
      enableReports: true,
      enableRealTimeUpdates: true,
      enableOfflineMode: true,
      enablePushNotifications: true,
      enableAdvancedCharts: true,
      enableDataExport: true,
      enableUserManagement: true,
      enableBetaFeatures: false,
      enableDebugMode: false,
      enablePerformanceMonitoring: true,
      enableAccessibilityFeatures: true,
      enableMobileOptimizations: true,
      enablePWAFeatures: true,
    },
    performance: {
      enableCodeSplitting: true,
      enablePreloading: true,
      bundleSizeWarningLimit: 1000,
      enableServiceWorker: true,
      cacheStrategy: 'aggressive',
      enableWebVitalsTracking: true,
      enableErrorBoundaries: true,
    },
    security: {
      enableCSRFProtection: true,
      enableContentSecurityPolicy: true,
      enableSecurityHeaders: true,
      sessionTimeout: 4 * 60 * 60 * 1000, // 4 hours
      maxLoginAttempts: 3,
      enableAuditLogging: true,
      enableRateLimiting: true,
      trustedDomains: ['pavemaster.app', 'www.pavemaster.app'],
    },
    monitoring: {
      enableSentry: true,
      enableAnalytics: true,
      enablePerformanceTracking: true,
      enableUserBehaviorTracking: true,
      logLevel: 'error',
      enableConsoleLogging: false,
      enableRemoteLogging: true,
      apiKeys: {
        sentry: process.env.VITE_SENTRY_DSN,
        analytics: process.env.VITE_ANALYTICS_ID,
        monitoring: process.env.VITE_MONITORING_API_KEY,
      },
    },
  },

  test: {
    api: {
      baseUrl: 'http://localhost:3001/api',
      timeout: 5000,
      retryAttempts: 0,
      retryDelay: 0,
      rateLimitPerMinute: 10000,
    },
    features: {
      enableAnalytics: false,
      enableReports: false,
      enableRealTimeUpdates: false,
      enableOfflineMode: false,
      enablePushNotifications: false,
      enableAdvancedCharts: false,
      enableDataExport: false,
      enableUserManagement: false,
      enableBetaFeatures: false,
      enableDebugMode: true,
      enablePerformanceMonitoring: false,
      enableAccessibilityFeatures: true,
      enableMobileOptimizations: false,
      enablePWAFeatures: false,
    },
    performance: {
      enableCodeSplitting: false,
      enablePreloading: false,
      bundleSizeWarningLimit: 10000,
      enableServiceWorker: false,
      cacheStrategy: 'minimal',
      enableWebVitalsTracking: false,
      enableErrorBoundaries: true,
    },
    security: {
      enableCSRFProtection: false,
      enableContentSecurityPolicy: false,
      enableSecurityHeaders: false,
      sessionTimeout: 60 * 60 * 1000, // 1 hour
      maxLoginAttempts: 100,
      enableAuditLogging: false,
      enableRateLimiting: false,
      trustedDomains: ['localhost:3001'],
    },
    monitoring: {
      enableSentry: false,
      enableAnalytics: false,
      enablePerformanceTracking: false,
      enableUserBehaviorTracking: false,
      logLevel: 'debug',
      enableConsoleLogging: true,
      enableRemoteLogging: false,
      apiKeys: {},
    },
  },
};

// Default configuration
const defaultConfig: AppConfig = {
  environment: 'development',
  version: process.env.VITE_APP_VERSION || '1.0.0',
  buildTime: new Date().toISOString(),
  api: {
    baseUrl: 'http://localhost:3000/api',
    timeout: 10000,
    retryAttempts: 1,
    retryDelay: 1000,
    rateLimitPerMinute: 100,
  },
  features: {
    enableAnalytics: false,
    enableReports: false,
    enableRealTimeUpdates: false,
    enableOfflineMode: false,
    enablePushNotifications: false,
    enableAdvancedCharts: false,
    enableDataExport: false,
    enableUserManagement: false,
    enableBetaFeatures: false,
    enableDebugMode: false,
    enablePerformanceMonitoring: false,
    enableAccessibilityFeatures: true,
    enableMobileOptimizations: false,
    enablePWAFeatures: false,
  },
  performance: {
    enableCodeSplitting: false,
    enablePreloading: false,
    bundleSizeWarningLimit: 1000,
    enableServiceWorker: false,
    cacheStrategy: 'minimal',
    enableWebVitalsTracking: false,
    enableErrorBoundaries: true,
  },
  security: {
    enableCSRFProtection: false,
    enableContentSecurityPolicy: false,
    enableSecurityHeaders: false,
    sessionTimeout: 60 * 60 * 1000,
    maxLoginAttempts: 5,
    enableAuditLogging: false,
    enableRateLimiting: false,
    trustedDomains: [],
  },
  monitoring: {
    enableSentry: false,
    enableAnalytics: false,
    enablePerformanceTracking: false,
    enableUserBehaviorTracking: false,
    logLevel: 'info',
    enableConsoleLogging: true,
    enableRemoteLogging: false,
    apiKeys: {},
  },
  app: {
    name: 'PaveMaster Suite',
    description: 'Comprehensive pavement management and construction business suite',
    supportEmail: 'support@pavemaster.app',
    documentationUrl: 'https://docs.pavemaster.app',
    maxUploadSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg'],
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'es', 'fr'],
    timezone: 'UTC',
  },
};

// Get current environment
function getCurrentEnvironment(): Environment {
  const env = import.meta.env.MODE as Environment;
  const validEnvironments: Environment[] = ['development', 'staging', 'production', 'test'];

  return validEnvironments.includes(env) ? env : 'development';
}

// Create configuration for current environment
function createConfig(): AppConfig {
  const environment = getCurrentEnvironment();
  const envConfig = configurations[environment];

  // Deep merge default config with environment-specific config
  const config: AppConfig = {
    ...defaultConfig,
    environment,
    ...envConfig,
    api: { ...defaultConfig.api, ...envConfig.api },
    features: { ...defaultConfig.features, ...envConfig.features },
    performance: { ...defaultConfig.performance, ...envConfig.performance },
    security: { ...defaultConfig.security, ...envConfig.security },
    monitoring: { ...defaultConfig.monitoring, ...envConfig.monitoring },
    app: { ...defaultConfig.app, ...envConfig.app },
  };

  // Override with environment variables if present
  if (process.env.VITE_API_BASE_URL) {
    config.api.baseUrl = process.env.VITE_API_BASE_URL;
  }

  if (process.env.VITE_FEATURE_FLAGS) {
    try {
      const envFeatures = JSON.parse(process.env.VITE_FEATURE_FLAGS);
      config.features = { ...config.features, ...envFeatures };
    } catch (error) {
      console.warn('Invalid VITE_FEATURE_FLAGS JSON:', error);
    }
  }

  return config;
}

// Export configuration
export const config = createConfig();

// Configuration utilities
export const configUtils = {
  // Check if feature is enabled
  isFeatureEnabled: (feature: keyof FeatureFlags): boolean => {
    return config.features[feature];
  },

  // Get API configuration
  getAPIConfig: (): APIConfig => {
    return config.api;
  },

  // Get performance configuration
  getPerformanceConfig: (): PerformanceConfig => {
    return config.performance;
  },

  // Get security configuration
  getSecurityConfig: (): SecurityConfig => {
    return config.security;
  },

  // Get monitoring configuration
  getMonitoringConfig: (): MonitoringConfig => {
    return config.monitoring;
  },

  // Check if environment is production
  isProduction: (): boolean => {
    return config.environment === 'production';
  },

  // Check if environment is development
  isDevelopment: (): boolean => {
    return config.environment === 'development';
  },

  // Check if environment is staging
  isStaging: (): boolean => {
    return config.environment === 'staging';
  },

  // Check if environment is test
  isTest: (): boolean => {
    return config.environment === 'test';
  },

  // Get current environment
  getEnvironment: (): Environment => {
    return config.environment;
  },

  // Get app version
  getVersion: (): string => {
    return config.version;
  },

  // Get build time
  getBuildTime: (): string => {
    return config.buildTime;
  },

  // Log current configuration (for debugging)
  logConfiguration: (): void => {
    if (config.monitoring.enableConsoleLogging) {
      console.group('🔧 Application Configuration');
      console.log('Environment:', config.environment);
      console.log('Version:', config.version);
      console.log('Build Time:', config.buildTime);
      console.log('API Base URL:', config.api.baseUrl);
      console.log('Features:', config.features);
      console.log('Performance:', config.performance);
      console.log('Security:', config.security);
      console.groupEnd();
    }
  },
};

// Initialize configuration logging
if (typeof window !== 'undefined' && config.monitoring.enableConsoleLogging) {
  configUtils.logConfiguration();
}

// Export types for use in other modules
export type {
  Environment,
  AppConfig,
  APIConfig,
  FeatureFlags,
  PerformanceConfig,
  SecurityConfig,
  MonitoringConfig,
};