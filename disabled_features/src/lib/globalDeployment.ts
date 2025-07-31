/**
 * Global Deployment & CDN Optimization Engine
 * Enterprise-grade global distribution and localization system
 */

import { performanceMonitor } from './performance';
import { multiTenantManager } from './multiTenantManager';

export interface CDNRegion {
  id: string;
  name: string;
  location: string;
  endpoint: string;
  latency: number;
  status: 'active' | 'degraded' | 'offline';
  capacity: number;
  usage: number;
  priority: number;
}

export interface GeolocationData {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  currency: string;
  language: string;
}

export interface LocalizationData {
  locale: string;
  language: string;
  country: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    currency: string;
  };
  translations: Record<string, string>;
}

export interface DeploymentRegion {
  id: string;
  name: string;
  provider: 'aws' | 'gcp' | 'azure' | 'cloudflare';
  location: string;
  status: 'active' | 'standby' | 'maintenance';
  endpoints: {
    api: string;
    cdn: string;
    websocket: string;
    storage: string;
  };
  metrics: {
    latency: number;
    availability: number;
    throughput: number;
    errorRate: number;
  };
}

export interface GlobalConfiguration {
  primaryRegion: string;
  fallbackRegions: string[];
  cdnConfiguration: {
    enabled: boolean;
    provider: string;
    cachingRules: CachingRule[];
    compressionEnabled: boolean;
    minificationEnabled: boolean;
  };
  localization: {
    defaultLocale: string;
    supportedLocales: string[];
    autoDetection: boolean;
    fallbackLocale: string;
  };
  loadBalancing: {
    strategy: 'round_robin' | 'least_connections' | 'geographic' | 'weighted';
    healthCheckInterval: number;
    failoverThreshold: number;
  };
}

export interface CachingRule {
  pattern: string;
  ttl: number;
  headers: string[];
  compression: boolean;
  versioning: boolean;
}

class GlobalDeploymentEngine {
  private regions: Map<string, DeploymentRegion> = new Map();
  private localizations: Map<string, LocalizationData> = new Map();
  private currentRegion: DeploymentRegion | null = null;
  private userGeolocation: GeolocationData | null = null;
  private configuration: GlobalConfiguration;
  private isInitialized = false;

  constructor() {
    this.configuration = this.getDefaultConfiguration();
    this.initializeGlobalDeployment();
  }

  /**
   * Initialize global deployment system
   */
  private async initializeGlobalDeployment(): Promise<void> {
    try {
      console.log('🌍 Initializing Global Deployment Engine...');
      
      // Setup deployment regions
      await this.setupDeploymentRegions();
      
      // Detect user location
      await this.detectUserLocation();
      
      // Initialize localization
      await this.initializeLocalization();
      
      // Setup CDN optimization
      this.setupCDNOptimization();
      
      // Configure load balancing
      this.configureLoadBalancing();
      
      // Setup monitoring
      this.setupGlobalMonitoring();
      
      this.isInitialized = true;
      console.log('✅ Global Deployment Engine initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize Global Deployment Engine:', error);
    }
  }

  /**
   * Setup deployment regions
   */
  private async setupDeploymentRegions(): Promise<void> {
    const regions: DeploymentRegion[] = [
      {
        id: 'us-east-1',
        name: 'US East (N. Virginia)',
        provider: 'aws',
        location: 'Virginia, USA',
        status: 'active',
        endpoints: {
          api: 'https://api-us-east-1.pavementperformancesuite.com',
          cdn: 'https://cdn-us-east-1.pavementperformancesuite.com',
          websocket: 'wss://ws-us-east-1.pavementperformancesuite.com',
          storage: 'https://storage-us-east-1.pavementperformancesuite.com',
        },
        metrics: {
          latency: 45,
          availability: 99.99,
          throughput: 1000,
          errorRate: 0.01,
        },
      },
      {
        id: 'eu-west-1',
        name: 'EU West (Ireland)',
        provider: 'aws',
        location: 'Dublin, Ireland',
        status: 'active',
        endpoints: {
          api: 'https://api-eu-west-1.pavementperformancesuite.com',
          cdn: 'https://cdn-eu-west-1.pavementperformancesuite.com',
          websocket: 'wss://ws-eu-west-1.pavementperformancesuite.com',
          storage: 'https://storage-eu-west-1.pavementperformancesuite.com',
        },
        metrics: {
          latency: 52,
          availability: 99.98,
          throughput: 850,
          errorRate: 0.015,
        },
      },
      {
        id: 'ap-southeast-1',
        name: 'Asia Pacific (Singapore)',
        provider: 'aws',
        location: 'Singapore',
        status: 'active',
        endpoints: {
          api: 'https://api-ap-southeast-1.pavementperformancesuite.com',
          cdn: 'https://cdn-ap-southeast-1.pavementperformancesuite.com',
          websocket: 'wss://ws-ap-southeast-1.pavementperformancesuite.com',
          storage: 'https://storage-ap-southeast-1.pavementperformancesuite.com',
        },
        metrics: {
          latency: 78,
          availability: 99.95,
          throughput: 650,
          errorRate: 0.02,
        },
      },
      {
        id: 'ap-northeast-1',
        name: 'Asia Pacific (Tokyo)',
        provider: 'aws',
        location: 'Tokyo, Japan',
        status: 'active',
        endpoints: {
          api: 'https://api-ap-northeast-1.pavementperformancesuite.com',
          cdn: 'https://cdn-ap-northeast-1.pavementperformancesuite.com',
          websocket: 'wss://ws-ap-northeast-1.pavementperformancesuite.com',
          storage: 'https://storage-ap-northeast-1.pavementperformancesuite.com',
        },
        metrics: {
          latency: 65,
          availability: 99.97,
          throughput: 720,
          errorRate: 0.012,
        },
      },
      {
        id: 'sa-east-1',
        name: 'South America (São Paulo)',
        provider: 'aws',
        location: 'São Paulo, Brazil',
        status: 'active',
        endpoints: {
          api: 'https://api-sa-east-1.pavementperformancesuite.com',
          cdn: 'https://cdn-sa-east-1.pavementperformancesuite.com',
          websocket: 'wss://ws-sa-east-1.pavementperformancesuite.com',
          storage: 'https://storage-sa-east-1.pavementperformancesuite.com',
        },
        metrics: {
          latency: 85,
          availability: 99.92,
          throughput: 580,
          errorRate: 0.025,
        },
      },
    ];

    regions.forEach(region => {
      this.regions.set(region.id, region);
    });

    console.log(`🌐 Configured ${regions.length} deployment regions`);
  }

  /**
   * Detect user location for optimal region selection
   */
  private async detectUserLocation(): Promise<void> {
    try {
      // Try to get geolocation from browser API
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: false,
          });
        });

        // Get additional location data from IP geolocation service
        const locationData = await this.getLocationFromIP();
        
        this.userGeolocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          ...locationData,
        };
      } else {
        // Fallback to IP-based geolocation
        this.userGeolocation = await this.getLocationFromIP();
      }

      // Select optimal region based on location
      this.selectOptimalRegion();

      console.log(`📍 User location detected: ${this.userGeolocation?.city}, ${this.userGeolocation?.country}`);
      
    } catch (error) {
      console.warn('Could not detect user location, using default region');
      this.currentRegion = this.regions.get(this.configuration.primaryRegion) || null;
    }
  }

  /**
   * Get location data from IP geolocation service
   */
  private async getLocationFromIP(): Promise<GeolocationData> {
    try {
      // Mock implementation - in real deployment, use a service like MaxMind or IP-API
      const mockLocation: GeolocationData = {
        country: 'United States',
        countryCode: 'US',
        region: 'Virginia',
        city: 'Ashburn',
        latitude: 39.0458,
        longitude: -77.5311,
        timezone: 'America/New_York',
        currency: 'USD',
        language: 'en',
      };

      return mockLocation;
    } catch (error) {
      console.error('Error getting IP geolocation:', error);
      throw error;
    }
  }

  /**
   * Select optimal region based on user location and metrics
   */
  private selectOptimalRegion(): void {
    if (!this.userGeolocation) return;

    let bestRegion: DeploymentRegion | null = null;
    let bestScore = Infinity;

    this.regions.forEach(region => {
      if (region.status !== 'active') return;

      // Calculate geographic distance score
      const distance = this.calculateDistance(
        this.userGeolocation!.latitude,
        this.userGeolocation!.longitude,
        this.getRegionCoordinates(region.id)
      );

      // Calculate composite score (distance + latency + availability)
      const score = distance * 0.4 + region.metrics.latency * 0.3 + (100 - region.metrics.availability) * 0.3;

      if (score < bestScore) {
        bestScore = score;
        bestRegion = region;
      }
    });

    this.currentRegion = bestRegion || this.regions.get(this.configuration.primaryRegion) || null;
    
    if (this.currentRegion) {
      console.log(`🎯 Selected optimal region: ${this.currentRegion.name}`);
    }
  }

  /**
   * Initialize localization system
   */
  private async initializeLocalization(): Promise<void> {
    // Load supported localizations
    const localizations: LocalizationData[] = [
      {
        locale: 'en-US',
        language: 'English',
        country: 'United States',
        direction: 'ltr',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: 'h:mm A',
        numberFormat: {
          decimal: '.',
          thousands: ',',
          currency: '$',
        },
        translations: await this.loadTranslations('en-US'),
      },
      {
        locale: 'es-ES',
        language: 'Español',
        country: 'Spain',
        direction: 'ltr',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm',
        numberFormat: {
          decimal: ',',
          thousands: '.',
          currency: '€',
        },
        translations: await this.loadTranslations('es-ES'),
      },
      {
        locale: 'fr-FR',
        language: 'Français',
        country: 'France',
        direction: 'ltr',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm',
        numberFormat: {
          decimal: ',',
          thousands: ' ',
          currency: '€',
        },
        translations: await this.loadTranslations('fr-FR'),
      },
      {
        locale: 'de-DE',
        language: 'Deutsch',
        country: 'Germany',
        direction: 'ltr',
        dateFormat: 'DD.MM.YYYY',
        timeFormat: 'HH:mm',
        numberFormat: {
          decimal: ',',
          thousands: '.',
          currency: '€',
        },
        translations: await this.loadTranslations('de-DE'),
      },
      {
        locale: 'ja-JP',
        language: '日本語',
        country: 'Japan',
        direction: 'ltr',
        dateFormat: 'YYYY/MM/DD',
        timeFormat: 'HH:mm',
        numberFormat: {
          decimal: '.',
          thousands: ',',
          currency: '¥',
        },
        translations: await this.loadTranslations('ja-JP'),
      },
      {
        locale: 'zh-CN',
        language: '中文',
        country: 'China',
        direction: 'ltr',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
        numberFormat: {
          decimal: '.',
          thousands: ',',
          currency: '¥',
        },
        translations: await this.loadTranslations('zh-CN'),
      },
    ];

    localizations.forEach(localization => {
      this.localizations.set(localization.locale, localization);
    });

    // Set initial locale based on user location or browser preference
    this.setInitialLocale();

    console.log(`🌐 Loaded ${localizations.length} localizations`);
  }

  /**
   * Load translations for a specific locale
   */
  private async loadTranslations(locale: string): Promise<Record<string, string>> {
    try {
      // In a real implementation, this would load from translation files
      // For now, return a mock set of key translations
      const mockTranslations: Record<string, Record<string, string>> = {
        'en-US': {
          'app.title': 'PaveMaster Suite',
          'dashboard.title': 'Dashboard',
          'projects.title': 'Projects',
          'equipment.title': 'Equipment',
          'reports.title': 'Reports',
          'settings.title': 'Settings',
          'welcome.message': 'Welcome to PaveMaster Suite',
          'loading': 'Loading...',
          'save': 'Save',
          'cancel': 'Cancel',
          'delete': 'Delete',
          'edit': 'Edit',
          'view': 'View',
        },
        'es-ES': {
          'app.title': 'PaveMaster Suite',
          'dashboard.title': 'Panel de Control',
          'projects.title': 'Proyectos',
          'equipment.title': 'Equipos',
          'reports.title': 'Informes',
          'settings.title': 'Configuración',
          'welcome.message': 'Bienvenido a PaveMaster Suite',
          'loading': 'Cargando...',
          'save': 'Guardar',
          'cancel': 'Cancelar',
          'delete': 'Eliminar',
          'edit': 'Editar',
          'view': 'Ver',
        },
        'fr-FR': {
          'app.title': 'PaveMaster Suite',
          'dashboard.title': 'Tableau de Bord',
          'projects.title': 'Projets',
          'equipment.title': 'Équipement',
          'reports.title': 'Rapports',
          'settings.title': 'Paramètres',
          'welcome.message': 'Bienvenue dans PaveMaster Suite',
          'loading': 'Chargement...',
          'save': 'Enregistrer',
          'cancel': 'Annuler',
          'delete': 'Supprimer',
          'edit': 'Modifier',
          'view': 'Voir',
        },
        'de-DE': {
          'app.title': 'PaveMaster Suite',
          'dashboard.title': 'Dashboard',
          'projects.title': 'Projekte',
          'equipment.title': 'Ausrüstung',
          'reports.title': 'Berichte',
          'settings.title': 'Einstellungen',
          'welcome.message': 'Willkommen bei PaveMaster Suite',
          'loading': 'Laden...',
          'save': 'Speichern',
          'cancel': 'Abbrechen',
          'delete': 'Löschen',
          'edit': 'Bearbeiten',
          'view': 'Anzeigen',
        },
        'ja-JP': {
          'app.title': 'PaveMaster Suite',
          'dashboard.title': 'ダッシュボード',
          'projects.title': 'プロジェクト',
          'equipment.title': '機器',
          'reports.title': 'レポート',
          'settings.title': '設定',
          'welcome.message': 'PaveMaster Suiteへようこそ',
          'loading': '読み込み中...',
          'save': '保存',
          'cancel': 'キャンセル',
          'delete': '削除',
          'edit': '編集',
          'view': '表示',
        },
        'zh-CN': {
          'app.title': 'PaveMaster Suite',
          'dashboard.title': '仪表板',
          'projects.title': '项目',
          'equipment.title': '设备',
          'reports.title': '报告',
          'settings.title': '设置',
          'welcome.message': '欢迎使用PaveMaster Suite',
          'loading': '加载中...',
          'save': '保存',
          'cancel': '取消',
          'delete': '删除',
          'edit': '编辑',
          'view': '查看',
        },
      };

      return mockTranslations[locale] || mockTranslations['en-US'];
      
    } catch (error) {
      console.error(`Error loading translations for ${locale}:`, error);
      return {};
    }
  }

  /**
   * Setup CDN optimization
   */
  private setupCDNOptimization(): void {
    if (!this.configuration.cdnConfiguration.enabled) return;

    // Configure resource hints for better performance
    this.addResourceHints();

    // Setup intelligent preloading
    this.setupIntelligentPreloading();

    // Configure compression and caching
    this.configureCaching();

    console.log('🚀 CDN optimization configured');
  }

  /**
   * Add resource hints for better performance
   */
  private addResourceHints(): void {
    if (!this.currentRegion) return;

    const hints = [
      { rel: 'dns-prefetch', href: this.currentRegion.endpoints.api },
      { rel: 'dns-prefetch', href: this.currentRegion.endpoints.cdn },
      { rel: 'preconnect', href: this.currentRegion.endpoints.api },
      { rel: 'preconnect', href: this.currentRegion.endpoints.cdn },
    ];

    hints.forEach(hint => {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      document.head.appendChild(link);
    });
  }

  /**
   * Setup intelligent preloading based on user behavior
   */
  private setupIntelligentPreloading(): void {
    // Preload critical resources based on current route
    const criticalResources = this.getCriticalResources();
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.url;
      link.as = resource.type;
      if (resource.type === 'font') {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  }

  /**
   * Configure caching strategies
   */
  private configureCaching(): void {
    // Setup service worker for advanced caching
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      }).catch(error => {
        console.error('Service Worker registration failed:', error);
      });
    }
  }

  /**
   * Setup global monitoring
   */
  private setupGlobalMonitoring(): void {
    // Monitor region performance
    setInterval(() => {
      this.monitorRegionPerformance();
    }, 60000); // Every minute

    // Monitor CDN performance
    setInterval(() => {
      this.monitorCDNPerformance();
    }, 30000); // Every 30 seconds
  }

  // Public API methods

  /**
   * Get current region
   */
  getCurrentRegion(): DeploymentRegion | null {
    return this.currentRegion;
  }

  /**
   * Get current localization
   */
  getCurrentLocalization(): LocalizationData | null {
    const locale = this.getCurrentLocale();
    return this.localizations.get(locale) || null;
  }

  /**
   * Switch to a different region
   */
  async switchRegion(regionId: string): Promise<void> {
    const region = this.regions.get(regionId);
    if (!region || region.status !== 'active') {
      throw new Error(`Region ${regionId} is not available`);
    }

    this.currentRegion = region;
    
    // Update environment variables for API endpoints
    this.updateEndpoints();
    
    console.log(`🔄 Switched to region: ${region.name}`);
  }

  /**
   * Set locale and update application language
   */
  setLocale(locale: string): void {
    const localization = this.localizations.get(locale);
    if (!localization) {
      console.warn(`Locale ${locale} not supported`);
      return;
    }

    // Store locale preference
    localStorage.setItem('preferred_locale', locale);
    
    // Update document language
    document.documentElement.lang = localization.language;
    document.documentElement.dir = localization.direction;
    
    // Update page title and meta tags
    document.title = this.translate('app.title');
    
    // Trigger locale change event
    window.dispatchEvent(new CustomEvent('localechange', { detail: { locale, localization } }));
    
    console.log(`🌐 Locale changed to: ${localization.language} (${locale})`);
  }

  /**
   * Translate a key using current locale
   */
  translate(key: string, params?: Record<string, string>): string {
    const localization = this.getCurrentLocalization();
    if (!localization) return key;

    let translation = localization.translations[key] || key;

    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, value);
      });
    }

    return translation;
  }

  /**
   * Get all available regions
   */
  getAvailableRegions(): DeploymentRegion[] {
    return Array.from(this.regions.values()).filter(region => region.status === 'active');
  }

  /**
   * Get all supported locales
   */
  getSupportedLocales(): LocalizationData[] {
    return Array.from(this.localizations.values());
  }

  // Private helper methods
  private getDefaultConfiguration(): GlobalConfiguration {
    return {
      primaryRegion: 'us-east-1',
      fallbackRegions: ['eu-west-1', 'ap-southeast-1'],
      cdnConfiguration: {
        enabled: true,
        provider: 'cloudflare',
        cachingRules: [
          { pattern: '*.js', ttl: 31536000, headers: ['Cache-Control'], compression: true, versioning: true },
          { pattern: '*.css', ttl: 31536000, headers: ['Cache-Control'], compression: true, versioning: true },
          { pattern: '*.png', ttl: 2592000, headers: ['Cache-Control'], compression: false, versioning: false },
          { pattern: '*.jpg', ttl: 2592000, headers: ['Cache-Control'], compression: false, versioning: false },
          { pattern: '/api/*', ttl: 300, headers: ['Cache-Control'], compression: true, versioning: false },
        ],
        compressionEnabled: true,
        minificationEnabled: true,
      },
      localization: {
        defaultLocale: 'en-US',
        supportedLocales: ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN'],
        autoDetection: true,
        fallbackLocale: 'en-US',
      },
      loadBalancing: {
        strategy: 'geographic',
        healthCheckInterval: 30000,
        failoverThreshold: 3,
      },
    };
  }

  private calculateDistance(lat1: number, lon1: number, coords: { lat: number; lon: number }): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coords.lat - lat1) * Math.PI / 180;
    const dLon = (coords.lon - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(coords.lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private getRegionCoordinates(regionId: string): { lat: number; lon: number } {
    const coordinates: Record<string, { lat: number; lon: number }> = {
      'us-east-1': { lat: 39.0458, lon: -77.5311 }, // Virginia
      'eu-west-1': { lat: 53.3498, lon: -6.2603 },  // Dublin
      'ap-southeast-1': { lat: 1.3521, lon: 103.8198 }, // Singapore
      'ap-northeast-1': { lat: 35.6762, lon: 139.6503 }, // Tokyo
      'sa-east-1': { lat: -23.5505, lon: -46.6333 }, // São Paulo
    };
    return coordinates[regionId] || { lat: 0, lon: 0 };
  }

  private setInitialLocale(): void {
    let locale = this.configuration.localization.defaultLocale;

    // Check user preference
    const storedLocale = localStorage.getItem('preferred_locale');
    if (storedLocale && this.localizations.has(storedLocale)) {
      locale = storedLocale;
    }
    // Check browser language
    else if (this.configuration.localization.autoDetection) {
      const browserLocale = navigator.language || navigator.languages?.[0];
      if (browserLocale && this.localizations.has(browserLocale)) {
        locale = browserLocale;
      }
    }
    // Check user location
    else if (this.userGeolocation) {
      const locationLocale = `${this.userGeolocation.language}-${this.userGeolocation.countryCode}`;
      if (this.localizations.has(locationLocale)) {
        locale = locationLocale;
      }
    }

    this.setLocale(locale);
  }

  private getCurrentLocale(): string {
    return localStorage.getItem('preferred_locale') || this.configuration.localization.defaultLocale;
  }

  private updateEndpoints(): void {
    if (!this.currentRegion) return;

    // Update environment variables or global configuration
    // In a real implementation, this would update API base URLs
    (window as any).__RUNTIME_CONFIG__ = {
      API_BASE_URL: this.currentRegion.endpoints.api,
      CDN_BASE_URL: this.currentRegion.endpoints.cdn,
      WS_BASE_URL: this.currentRegion.endpoints.websocket,
      STORAGE_BASE_URL: this.currentRegion.endpoints.storage,
    };
  }

  private getCriticalResources(): Array<{ url: string; type: string }> {
    return [
      { url: '/fonts/inter-400.woff2', type: 'font' },
      { url: '/fonts/inter-500.woff2', type: 'font' },
      { url: '/fonts/inter-600.woff2', type: 'font' },
      { url: '/icons/sprite.svg', type: 'image' },
    ];
  }

  private monitorRegionPerformance(): void {
    if (!this.currentRegion) return;

    // Record performance metrics
    performanceMonitor.recordMetric('region_latency', this.currentRegion.metrics.latency, 'ms', {
      regionId: this.currentRegion.id,
      regionName: this.currentRegion.name,
    });

    performanceMonitor.recordMetric('region_availability', this.currentRegion.metrics.availability, '%', {
      regionId: this.currentRegion.id,
      regionName: this.currentRegion.name,
    });
  }

  private monitorCDNPerformance(): void {
    // Monitor CDN metrics like cache hit rate, bandwidth usage, etc.
    performanceMonitor.recordMetric('cdn_active', 1, 'count', {
      provider: this.configuration.cdnConfiguration.provider,
      enabled: this.configuration.cdnConfiguration.enabled,
    });
  }
}

// Export singleton instance
export const globalDeployment = new GlobalDeploymentEngine();