// Standardized API Client for PaveMaster Suite
// Provides type-safe HTTP client with interceptors and error handling

interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

interface RequestOptions {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;
  private requestInterceptors: Array<(config: any) => any> = [];
  private responseInterceptors: Array<(response: any) => any> = [];
  private errorInterceptors: Array<(error: any) => any> = [];

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.defaultTimeout = config.timeout || 10000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  // Interceptor methods
  addRequestInterceptor(interceptor: (config: any) => any) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: (response: any) => any) {
    this.responseInterceptors.push(interceptor);
  }

  addErrorInterceptor(interceptor: (error: any) => any) {
    this.errorInterceptors.push(interceptor);
  }

  // HTTP methods
  async get<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, options);
  }

  async post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, options);
  }

  async put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, options);
  }

  async patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data, options);
  }

  async delete<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, options);
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      // Build full URL
      const fullUrl = new URL(url, this.baseURL);
      
      // Add query parameters
      if (options?.params) {
        Object.keys(options.params).forEach(key => {
          fullUrl.searchParams.append(key, options.params![key]);
        });
      }

      // Prepare request config
      let requestConfig: RequestInit = {
        method,
        headers: {
          ...this.defaultHeaders,
          ...options?.headers,
        },
        signal: AbortSignal.timeout(options?.timeout || this.defaultTimeout),
      };

      // Add body for non-GET requests
      if (data && method !== 'GET') {
        requestConfig.body = JSON.stringify(data);
      }

      // Apply request interceptors
      for (const interceptor of this.requestInterceptors) {
        requestConfig = interceptor(requestConfig);
      }

      // Make the request
      const response = await fetch(fullUrl.toString(), requestConfig);

      // Parse response
      let responseData: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text() as any;
      }

      const apiResponse: ApiResponse<T> = {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      };

      // Apply response interceptors
      let finalResponse = apiResponse;
      for (const interceptor of this.responseInterceptors) {
        finalResponse = interceptor(finalResponse);
      }

      // Handle HTTP errors
      if (!response.ok) {
        const error: ApiError = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          details: responseData,
        };
        throw error;
      }

      return finalResponse;
    } catch (error) {
      // Apply error interceptors
      let finalError = error;
      for (const interceptor of this.errorInterceptors) {
        finalError = interceptor(finalError);
      }

      throw finalError;
    }
  }
}

// Create default client instance
const defaultClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});

// Add default auth interceptor
defaultClient.addRequestInterceptor((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

// Add default error handling
defaultClient.addErrorInterceptor((error) => {
  if (error.status === 401) {
    // Handle unauthorized - redirect to login
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }
  return error;
});

export { ApiClient, defaultClient as apiClient };
export type { ApiResponse, ApiError, RequestOptions };