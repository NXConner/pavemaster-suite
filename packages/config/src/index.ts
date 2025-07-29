/**
 * ISAC-OS Configuration Management
 * Centralized configuration for the ISAC-OS ecosystem
 */

import { z } from 'zod';
import { AppConfig } from '@isac-os/types';

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32).optional(),
  PORT: z.string().transform(Number).default('3000'),
});

export type Environment = z.infer<typeof envSchema>;

// Configuration loader
export function loadConfig(): AppConfig {
  const env = envSchema.parse(process.env);
  
  return {
    apiUrl: env.API_URL,
    environment: env.NODE_ENV,
    features: {
      analytics: env.NODE_ENV === 'production',
      debugging: env.NODE_ENV === 'development',
      maintenance: false,
      notifications: true,
      realTimeUpdates: true,
    },
  };
}

// Feature flag management
export class FeatureFlags {
  private flags: Record<string, boolean>;

  constructor(initialFlags: Record<string, boolean> = {}) {
    this.flags = initialFlags;
  }

  isEnabled(flag: string): boolean {
    return this.flags[flag] ?? false;
  }

  enable(flag: string): void {
    this.flags[flag] = true;
  }

  disable(flag: string): void {
    this.flags[flag] = false;
  }

  toggle(flag: string): void {
    this.flags[flag] = !this.isEnabled(flag);
  }

  getAll(): Record<string, boolean> {
    return { ...this.flags };
  }
}

// Default configuration
export const defaultConfig = loadConfig();
export const featureFlags = new FeatureFlags(defaultConfig.features);

// Configuration validation
export function validateConfig(config: Partial<AppConfig>): AppConfig {
  const configSchema = z.object({
    apiUrl: z.string().url(),
    environment: z.enum(['development', 'production', 'test']),
    features: z.record(z.boolean()),
  });

  return configSchema.parse(config);
}

export * from './database';
export * from './api';