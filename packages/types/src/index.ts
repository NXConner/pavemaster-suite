/**
 * ISAC-OS TypeScript Definitions and Types
 * Core type definitions for the ISAC-OS ecosystem
 */

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Base entity types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User types
export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
}

export type UserRole = 'admin' | 'user' | 'viewer';

// API response types
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Configuration types
export interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'production' | 'test';
  features: Record<string, boolean>;
}

export * from './pavement';
export * from './components';