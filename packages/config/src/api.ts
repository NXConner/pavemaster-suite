/**
 * API Configuration
 */

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  rateLimit: {
    requests: number;
    windowMs: number;
  };
  cors: {
    origin: string[];
    credentials: boolean;
  };
}

export const defaultApiConfig: ApiConfig = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
  timeout: parseInt(process.env.API_TIMEOUT || '30000'),
  retries: parseInt(process.env.API_RETRIES || '3'),
  rateLimit: {
    requests: parseInt(process.env.RATE_LIMIT_REQUESTS || '100'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  },
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
};