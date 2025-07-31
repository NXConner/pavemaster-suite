// Global Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  address: Address;
  phone: string;
  email: string;
  website?: string;
  industry: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  settings: CompanySettings;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CompanySettings {
  timezone: string;
  currency: string;
  dateFormat: string;
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string | number }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormConfig {
  fields: FormField[];
  title?: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
}

// Navigation Types
export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  children?: NavigationItem[];
  badge?: string | number;
  permissions?: string[];
  external?: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive';
  }>;
}

// Theme Types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// File Types
export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
  metadata?: Record<string, any>;
}

// Search Types
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  aggregations?: Record<string, any>;
}

// Analytics Types
export interface AnalyticsEvent {
  id: string;
  event: string;
  properties: Record<string, any>;
  userId?: string;
  sessionId: string;
  timestamp: Date;
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  unit: string;
  change?: {
    value: number;
    percentage: number;
    period: string;
  };
  trend?: 'up' | 'down' | 'stable';
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  context?: Record<string, any>;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: Status;
  error: string | null;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface ActionableComponentProps extends BaseComponentProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

// Route Types
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  title?: string;
  description?: string;
  permissions?: string[];
  exact?: boolean;
  children?: RouteConfig[];
}

// Feature Flag Types
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
  conditions?: Record<string, any>;
}

// Integration Types
export interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  lastSync?: Date;
  error?: string;
}

export * from './achievements';
export * from './projects';
export * from './equipment';
export * from './estimates';
export * from './financial';