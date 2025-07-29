interface EnvironmentConfig {
  name: string;
  production: boolean;
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
    rateLimit: {
      requests: number;
      window: number; // in milliseconds
    };
  };
  database: {
    url: string;
    poolSize: number;
    ssl: boolean;
  };
  auth: {
    tokenExpiry: number; // in milliseconds
    refreshTokenExpiry: number;
    sessionTimeout: number;
  };
  features: {
    // Core Features
    gpsTracking: boolean;
    photoReports: boolean;
    measurements: boolean;
    parkingDesigner: boolean;
    projectManagement: boolean;
    
    // Management Features
    teamManagement: boolean;
    equipmentManagement: boolean;
    financialManagement: boolean;
    safetyManagement: boolean;
    schedulingSystem: boolean;
    
    // Advanced Features
    performanceMonitoring: boolean;
    advancedAnalytics: boolean;
    intelligentSearch: boolean;
    realtimeNotifications: boolean;
    offlineCapabilities: boolean;
    
    // AI/ML Features
    predictiveAnalytics: boolean;
    voiceCommands: boolean;
    automaticOptimization: boolean;
    smartSuggestions: boolean;
    
    // Integration Features
    weatherIntegration: boolean;
    gisIntegration: boolean;
    accountingIntegration: boolean;
    crmIntegration: boolean;
  };
  integrations: {
    weather: {
      apiKey: string;
      provider: 'openweather' | 'weatherapi' | 'noaa';
      updateInterval: number;
    };
    maps: {
      provider: 'google' | 'mapbox' | 'osm';
      apiKey: string;
      defaultZoom: number;
    };
    storage: {
      provider: 'supabase' | 'aws' | 'azure' | 'gcp';
      bucket: string;
      region: string;
    };
    analytics: {
      google: {
        trackingId: string;
        enabled: boolean;
      };
      mixpanel: {
        token: string;
        enabled: boolean;
      };
      sentry: {
        dsn: string;
        enabled: boolean;
        environment: string;
      };
    };
  };
  performance: {
    enableServiceWorker: boolean;
    cacheStrategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
    bundleAnalysis: boolean;
    lazyLoading: boolean;
    imageOptimization: boolean;
  };
  security: {
    enableCSP: boolean;
    encryptionKey: string;
    apiKeyRotation: boolean;
    auditLogging: boolean;
    dataRetentionDays: number;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    animations: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
    compactMode: boolean;
  };
  notifications: {
    push: {
      enabled: boolean;
      vapidKey: string;
      serviceWorkerPath: string;
    };
    email: {
      enabled: boolean;
      provider: 'sendgrid' | 'mailgun' | 'ses';
      templates: Record<string, string>;
    };
    sms: {
      enabled: boolean;
      provider: 'twilio' | 'messagebird';
      apiKey: string;
    };
  };
  monitoring: {
    healthCheck: {
      enabled: boolean;
      interval: number;
      endpoints: string[];
    };
    metrics: {
      enabled: boolean;
      collectInterval: number;
      retentionDays: number;
    };
    logging: {
      level: 'debug' | 'info' | 'warn' | 'error';
      enableConsole: boolean;
      enableRemote: boolean;
      remoteEndpoint?: string;
    };
  };
}

const developmentConfig: EnvironmentConfig = {
  name: 'Development',
  production: false,
  api: {
    baseUrl: 'http://localhost:3000/api',
    timeout: 10000,
    retries: 3,
    rateLimit: {
      requests: 1000,
      window: 60000
    }
  },
  database: {
    url: import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321',
    poolSize: 10,
    ssl: false
  },
  auth: {
    tokenExpiry: 3600000, // 1 hour
    refreshTokenExpiry: 604800000, // 7 days
    sessionTimeout: 1800000 // 30 minutes
  },
  features: {
    // All features enabled in development
    gpsTracking: true,
    photoReports: true,
    measurements: true,
    parkingDesigner: true,
    projectManagement: true,
    teamManagement: true,
    equipmentManagement: true,
    financialManagement: true,
    safetyManagement: true,
    schedulingSystem: true,
    performanceMonitoring: true,
    advancedAnalytics: true,
    intelligentSearch: true,
    realtimeNotifications: true,
    offlineCapabilities: true,
    predictiveAnalytics: false, // AI features disabled in dev
    voiceCommands: false,
    automaticOptimization: false,
    smartSuggestions: true,
    weatherIntegration: true,
    gisIntegration: true,
    accountingIntegration: false,
    crmIntegration: false
  },
  integrations: {
    weather: {
      apiKey: import.meta.env.VITE_WEATHER_API_KEY || 'dev-key',
      provider: 'openweather',
      updateInterval: 300000 // 5 minutes
    },
    maps: {
      provider: 'osm', // Use free OSM in dev
      apiKey: '',
      defaultZoom: 15
    },
    storage: {
      provider: 'supabase',
      bucket: 'dev-pavemaster',
      region: 'us-east-1'
    },
    analytics: {
      google: {
        trackingId: '',
        enabled: false
      },
      mixpanel: {
        token: '',
        enabled: false
      },
      sentry: {
        dsn: '',
        enabled: false,
        environment: 'development'
      }
    }
  },
  performance: {
    enableServiceWorker: false,
    cacheStrategy: 'network-first',
    bundleAnalysis: true,
    lazyLoading: true,
    imageOptimization: false
  },
  security: {
    enableCSP: false,
    encryptionKey: 'dev-encryption-key-not-secure',
    apiKeyRotation: false,
    auditLogging: true,
    dataRetentionDays: 30
  },
  ui: {
    theme: 'auto',
    animations: true,
    reducedMotion: false,
    highContrast: false,
    compactMode: false
  },
  notifications: {
    push: {
      enabled: false,
      vapidKey: '',
      serviceWorkerPath: '/sw.js'
    },
    email: {
      enabled: false,
      provider: 'sendgrid',
      templates: {}
    },
    sms: {
      enabled: false,
      provider: 'twilio',
      apiKey: ''
    }
  },
  monitoring: {
    healthCheck: {
      enabled: true,
      interval: 30000,
      endpoints: ['/api/health']
    },
    metrics: {
      enabled: true,
      collectInterval: 10000,
      retentionDays: 7
    },
    logging: {
      level: 'debug',
      enableConsole: true,
      enableRemote: false
    }
  }
};

const stagingConfig: EnvironmentConfig = {
  ...developmentConfig,
  name: 'Staging',
  production: false,
  api: {
    baseUrl: 'https://staging-api.pavemaster.com',
    timeout: 15000,
    retries: 5,
    rateLimit: {
      requests: 500,
      window: 60000
    }
  },
  database: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    poolSize: 20,
    ssl: true
  },
  integrations: {
    ...developmentConfig.integrations,
    analytics: {
      google: {
        trackingId: import.meta.env.VITE_GA_TRACKING_ID || '',
        enabled: true
      },
      mixpanel: {
        token: import.meta.env.VITE_MIXPANEL_TOKEN || '',
        enabled: true
      },
      sentry: {
        dsn: import.meta.env.VITE_SENTRY_DSN || '',
        enabled: true,
        environment: 'staging'
      }
    }
  },
  performance: {
    enableServiceWorker: true,
    cacheStrategy: 'stale-while-revalidate',
    bundleAnalysis: false,
    lazyLoading: true,
    imageOptimization: true
  },
  security: {
    enableCSP: true,
    encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY || '',
    apiKeyRotation: true,
    auditLogging: true,
    dataRetentionDays: 90
  },
  monitoring: {
    healthCheck: {
      enabled: true,
      interval: 60000,
      endpoints: ['/api/health', '/api/status']
    },
    metrics: {
      enabled: true,
      collectInterval: 30000,
      retentionDays: 30
    },
    logging: {
      level: 'info',
      enableConsole: false,
      enableRemote: true,
      remoteEndpoint: 'https://logs.pavemaster.com'
    }
  }
};

const productionConfig: EnvironmentConfig = {
  ...stagingConfig,
  name: 'Production',
  production: true,
  api: {
    baseUrl: 'https://api.pavemaster.com',
    timeout: 20000,
    retries: 3,
    rateLimit: {
      requests: 200,
      window: 60000
    }
  },
  database: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    poolSize: 50,
    ssl: true
  },
  auth: {
    tokenExpiry: 3600000, // 1 hour
    refreshTokenExpiry: 2592000000, // 30 days
    sessionTimeout: 3600000 // 1 hour
  },
  features: {
    ...stagingConfig.features,
    // Enable all AI features in production
    predictiveAnalytics: true,
    voiceCommands: true,
    automaticOptimization: true,
    accountingIntegration: true,
    crmIntegration: true
  },
  integrations: {
    ...stagingConfig.integrations,
    weather: {
      apiKey: import.meta.env.VITE_WEATHER_API_KEY || '',
      provider: 'openweather',
      updateInterval: 600000 // 10 minutes
    },
    maps: {
      provider: 'google',
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
      defaultZoom: 15
    },
    storage: {
      provider: 'supabase',
      bucket: 'prod-pavemaster',
      region: 'us-east-1'
    },
    analytics: {
      google: {
        trackingId: import.meta.env.VITE_GA_TRACKING_ID || '',
        enabled: true
      },
      mixpanel: {
        token: import.meta.env.VITE_MIXPANEL_TOKEN || '',
        enabled: true
      },
      sentry: {
        dsn: import.meta.env.VITE_SENTRY_DSN || '',
        enabled: true,
        environment: 'production'
      }
    }
  },
  performance: {
    enableServiceWorker: true,
    cacheStrategy: 'cache-first',
    bundleAnalysis: false,
    lazyLoading: true,
    imageOptimization: true
  },
  security: {
    enableCSP: true,
    encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY || '',
    apiKeyRotation: true,
    auditLogging: true,
    dataRetentionDays: 365
  },
  notifications: {
    push: {
      enabled: true,
      vapidKey: import.meta.env.VITE_VAPID_KEY || '',
      serviceWorkerPath: '/sw.js'
    },
    email: {
      enabled: true,
      provider: 'sendgrid',
      templates: {
        welcome: 'welcome-template-id',
        passwordReset: 'password-reset-template-id',
        projectUpdate: 'project-update-template-id'
      }
    },
    sms: {
      enabled: true,
      provider: 'twilio',
      apiKey: import.meta.env.VITE_TWILIO_API_KEY || ''
    }
  },
  monitoring: {
    healthCheck: {
      enabled: true,
      interval: 30000,
      endpoints: ['/api/health', '/api/status', '/api/metrics']
    },
    metrics: {
      enabled: true,
      collectInterval: 60000,
      retentionDays: 365
    },
    logging: {
      level: 'warn',
      enableConsole: false,
      enableRemote: true,
      remoteEndpoint: 'https://logs.pavemaster.com'
    }
  }
};

// Environment detection
function getEnvironment(): string {
  // Check for explicit environment variable
  if (import.meta.env.VITE_APP_ENV) {
    return import.meta.env.VITE_APP_ENV;
  }
  
  // Check hostname patterns
  const hostname = window.location.hostname;
  
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return 'development';
  }
  
  if (hostname.includes('staging') || hostname.includes('dev')) {
    return 'staging';
  }
  
  return 'production';
}

// Configuration getter
export function getConfig(): EnvironmentConfig {
  const environment = getEnvironment();
  
  switch (environment) {
    case 'development':
      return developmentConfig;
    case 'staging':
      return stagingConfig;
    case 'production':
      return productionConfig;
    default:
      console.warn(`Unknown environment: ${environment}, defaulting to development`);
      return developmentConfig;
  }
}

// Feature flag checker
export function isFeatureEnabled(feature: keyof EnvironmentConfig['features']): boolean {
  return getConfig().features[feature];
}

// Environment info
export function getEnvironmentInfo() {
  const config = getConfig();
  return {
    name: config.name,
    production: config.production,
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    buildDate: import.meta.env.VITE_BUILD_DATE || new Date().toISOString(),
    commit: import.meta.env.VITE_GIT_COMMIT || 'unknown'
  };
}

// Configuration validation
export function validateConfig(): { valid: boolean; errors: string[] } {
  const config = getConfig();
  const errors: string[] = [];
  
  // Validate required production settings
  if (config.production) {
    if (!config.database.url) {
      errors.push('Database URL is required in production');
    }
    
    if (!config.security.encryptionKey || config.security.encryptionKey.includes('dev')) {
      errors.push('Secure encryption key is required in production');
    }
    
    if (config.integrations.analytics.sentry.enabled && !config.integrations.analytics.sentry.dsn) {
      errors.push('Sentry DSN is required when Sentry is enabled');
    }
  }
  
  // Validate API configuration
  if (!config.api.baseUrl) {
    errors.push('API base URL is required');
  }
  
  if (config.api.timeout < 1000) {
    errors.push('API timeout should be at least 1000ms');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Export current config
export const config = getConfig();
export default config;