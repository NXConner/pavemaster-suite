import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as dotenv from 'dotenv';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

// Configuration Source Types
export enum ConfigSourceType {
  FILE = 'file',
  ENVIRONMENT = 'environment',
  REMOTE = 'remote'
}

// Configuration Change Event
export interface ConfigChangeEvent {
  source: string;
  changedKeys: string[];
  timestamp: number;
}

// Configuration Source Interface
export interface ConfigSource {
  type: ConfigSourceType;
  path?: string;
  data?: Record<string, any>;
}

// Configuration Manager Options
export interface ConfigManagerOptions {
  sources: ConfigSource[];
  watchFiles?: boolean;
  refreshInterval?: number;
}

// Encryption Configuration
export interface EncryptionConfig {
  algorithm: string;
  key: Buffer;
  iv: Buffer;
}

export class ConfigurationManager {
  private static INSTANCE: ConfigurationManager;
  private configSources: Map<string, ConfigSource> = new Map();
  private mergedConfig: Record<string, any> = {};
  private eventEmitter: EventEmitter = new EventEmitter();
  private options: ConfigManagerOptions;
  private refreshIntervalId?: NodeJS.Timeout;
  private encryptionConfig?: EncryptionConfig;

  private constructor(options: ConfigManagerOptions) {
    this.options = {
      sources: options.sources,
      watchFiles: options.watchFiles ?? true,
      refreshInterval: options.refreshInterval ?? 60000 // 1 minute
    };

    // Initialize configuration sources
    this.initializeSources();

    // Start file watching and periodic refresh
    if (this.options.watchFiles) {
      this.startFileWatching();
      this.startPeriodicRefresh();
    }

    // Setup encryption
    this.setupEncryption();
  }

  // Singleton pattern
  public static getInstance(
    options: ConfigManagerOptions
  ): ConfigurationManager {
    if (!ConfigurationManager.INSTANCE) {
      ConfigurationManager.INSTANCE = new ConfigurationManager(options);
    }
    return ConfigurationManager.INSTANCE;
  }

  // Initialize configuration sources
  private initializeSources(): void {
    this.options.sources.forEach(source => {
      const sourceId = this.generateSourceId(source);
      
      switch (source.type) {
        case ConfigSourceType.FILE:
          this.loadFileConfig(source, sourceId);
          break;
        case ConfigSourceType.ENVIRONMENT:
          this.loadEnvironmentConfig(source, sourceId);
          break;
        case ConfigSourceType.REMOTE:
          this.loadRemoteConfig(source, sourceId);
          break;
      }
    });

    // Merge configurations
    this.mergeConfigurations();
  }

  // Load configuration from file
  private loadFileConfig(source: ConfigSource, sourceId: string): void {
    if (!source.path) {
      throw new Error('File path is required for file configuration source');
    }

    try {
      const fileExt = path.extname(source.path).toLowerCase();
      let configData: Record<string, any>;

      switch (fileExt) {
        case '.json':
          configData = JSON.parse(fs.readFileSync(source.path, 'utf8'));
          break;
        case '.yaml':
        case '.yml':
          configData = yaml.load(fs.readFileSync(source.path, 'utf8')) as Record<string, any>;
          break;
        case '.env':
          configData = dotenv.parse(fs.readFileSync(source.path, 'utf8'));
          break;
        default:
          throw new Error(`Unsupported file type: ${fileExt}`);
      }

      source.data = configData;
      this.configSources.set(sourceId, source);

      // Watch file for changes if enabled
      if (this.options.watchFiles) {
        fs.watch(source.path, (eventType) => {
          if (eventType === 'change') {
            this.reloadFileConfig(source, sourceId);
          }
        });
      }
    } catch (error) {
      console.error(`Error loading config from ${source.path}:`, error);
    }
  }

  // Reload file configuration
  private reloadFileConfig(source: ConfigSource, sourceId: string): void {
    try {
      const previousData = source.data;
      this.loadFileConfig(source, sourceId);
      
      // Detect changes
      const changedKeys = this.detectConfigChanges(previousData, source.data);
      
      if (changedKeys.length > 0) {
        this.mergeConfigurations();
        
        // Emit configuration change event
        this.eventEmitter.emit('configChanged', {
          source: sourceId,
          changedKeys,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error(`Error reloading config from ${source.path}:`, error);
    }
  }

  // Load environment variables
  private loadEnvironmentConfig(source: ConfigSource, sourceId: string): void {
    const envConfig: Record<string, any> = {};
    
    Object.keys(process.env).forEach(key => {
      envConfig[key] = process.env[key];
    });

    source.data = envConfig;
    this.configSources.set(sourceId, source);
  }

  // Load remote configuration (placeholder)
  private loadRemoteConfig(source: ConfigSource, sourceId: string): void {
    // In a real implementation, this would fetch configuration from a remote service
    // For now, it's a placeholder
    source.data = source.data || {};
    this.configSources.set(sourceId, source);
  }

  // Merge configurations from all sources
  private mergeConfigurations(): void {
    this.mergedConfig = {};

    // Merge in order of sources, with later sources overriding earlier ones
    Array.from(this.configSources.values()).forEach(source => {
      if (source.data) {
        this.mergedConfig = { 
          ...this.mergedConfig, 
          ...source.data 
        };
      }
    });
  }

  // Detect configuration changes
  private detectConfigChanges(
    previousData: Record<string, any> | undefined, 
    newData: Record<string, any> | undefined
  ): string[] {
    if (!previousData || !newData) return [];

    return Object.keys(newData).filter(
      key => JSON.stringify(previousData[key]) !== JSON.stringify(newData[key])
    );
  }

  // Start periodic configuration refresh
  private startPeriodicRefresh(): void {
    this.refreshIntervalId = setInterval(() => {
      this.options.sources.forEach(source => {
        const sourceId = this.generateSourceId(source);
        
        if (source.type === ConfigSourceType.FILE) {
          this.reloadFileConfig(source, sourceId);
        } else if (source.type === ConfigSourceType.REMOTE) {
          this.loadRemoteConfig(source, sourceId);
        }
      });
    }, this.options.refreshInterval);
  }

  // Setup encryption for sensitive configuration
  private setupEncryption(): void {
    // Generate encryption key and IV
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    this.encryptionConfig = {
      algorithm: 'aes-256-cbc',
      key,
      iv
    };
  }

  // Encrypt configuration value
  public encryptValue(value: string): string {
    if (!this.encryptionConfig) {
      throw new Error('Encryption not initialized');
    }

    const { algorithm, key, iv } = this.encryptionConfig;
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
  }

  // Decrypt configuration value
  public decryptValue(encryptedValue: string): string {
    if (!this.encryptionConfig) {
      throw new Error('Encryption not initialized');
    }

    const { algorithm, key, iv } = this.encryptionConfig;
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    
    let decrypted = decipher.update(encryptedValue, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // Get configuration value
  public get(key: string, defaultValue?: any): any {
    return this.mergedConfig[key] ?? defaultValue;
  }

  // Set configuration value
  public set(key: string, value: any): void {
    const previousValue = this.mergedConfig[key];
    this.mergedConfig[key] = value;

    // Emit configuration change event
    this.eventEmitter.emit('configChanged', {
      source: 'manual',
      changedKeys: [key],
      timestamp: Date.now()
    });
  }

  // Event subscription
  public on(
    event: 'configChanged', 
    listener: (event: ConfigChangeEvent) => void
  ): void {
    this.eventEmitter.on(event, listener);
  }

  // Generate unique source ID
  private generateSourceId(source: ConfigSource): string {
    const sourceString = `${source.type}-${source.path || 'default'}`;
    return crypto
      .createHash('md5')
      .update(sourceString)
      .digest('hex');
  }

  // Cleanup method
  public destroy(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
    }
    this.configSources.clear();
    this.mergedConfig = {};
    this.eventEmitter.removeAllListeners();
  }
}

// Example usage and initialization
export const configManager = ConfigurationManager.getInstance({
  sources: [
    { 
      type: ConfigSourceType.FILE, 
      path: path.join(__dirname, '../config/default.yaml') 
    },
    { 
      type: ConfigSourceType.ENVIRONMENT 
    }
  ],
  watchFiles: true,
  refreshInterval: 60000
});