import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL, API_TIMEOUT, AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/constants';
import { storage } from '@/utils';
import { ApiResponse, PaginatedResponse, SearchParams, SearchResult } from '@/types';

// API Client Configuration
class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = storage.get<string>(AUTH_TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.client(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = storage.get<string>(REFRESH_TOKEN_KEY);
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await this.refreshToken(refreshToken);
            const { access_token } = response.data;

            storage.set(AUTH_TOKEN_KEY, access_token);
            this.processQueue(null, access_token);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private async refreshToken(refreshToken: string): Promise<AxiosResponse> {
    return this.client.post('/auth/refresh', { refresh_token: refreshToken });
  }

  private logout(): void {
    storage.remove(AUTH_TOKEN_KEY);
    storage.remove(REFRESH_TOKEN_KEY);
    window.location.href = '/auth/login';
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.message;
      return new Error(message);
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection.');
    } else {
      // Request setup error
      return new Error('An unexpected error occurred.');
    }
  }

  // Generic API methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Paginated requests
  async getPaginated<T>(
    url: string,
    params?: SearchParams,
    config?: AxiosRequestConfig
  ): Promise<PaginatedResponse<T>> {
    const response = await this.client.get<PaginatedResponse<T>>(url, {
      ...config,
      params: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
        ...params?.filters,
        q: params?.query,
      },
    });
    return response.data;
  }

  // Search requests
  async search<T>(url: string, params: SearchParams): Promise<SearchResult<T>> {
    const response = await this.client.get<SearchResult<T>>(url, { params });
    return response.data;
  }

  // File upload
  async uploadFile(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<ApiResponse<any>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Bulk upload
  async uploadFiles(
    url: string,
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<any>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    const response = await this.client.post<ApiResponse<any>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Download file
  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Batch requests
  async batch<T>(requests: Array<() => Promise<T>>): Promise<T[]> {
    return Promise.all(requests.map((request) => request()));
  }

  // Request with retry
  async retry<T>(
    request: () => Promise<T>,
    attempts: number = 3,
    delay: number = 1000
  ): Promise<T> {
    try {
      return await request();
    } catch (error) {
      if (attempts > 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retry(request, attempts - 1, delay * 2);
      }
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  // Get client instance for custom requests
  getInstance(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Convenience methods
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => apiClient.get<T>(url, config),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => apiClient.post<T>(url, data, config),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => apiClient.put<T>(url, data, config),
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => apiClient.patch<T>(url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) => apiClient.delete<T>(url, config),
  getPaginated: <T>(url: string, params?: SearchParams, config?: AxiosRequestConfig) =>
    apiClient.getPaginated<T>(url, params, config),
  search: <T>(url: string, params: SearchParams) => apiClient.search<T>(url, params),
  uploadFile: (url: string, file: File, onProgress?: (progress: number) => void) =>
    apiClient.uploadFile(url, file, onProgress),
  uploadFiles: (url: string, files: File[], onProgress?: (progress: number) => void) =>
    apiClient.uploadFiles(url, files, onProgress),
  downloadFile: (url: string, filename?: string) => apiClient.downloadFile(url, filename),
  batch: <T>(requests: Array<() => Promise<T>>) => apiClient.batch(requests),
  retry: <T>(request: () => Promise<T>, attempts?: number, delay?: number) =>
    apiClient.retry(request, attempts, delay),
  healthCheck: () => apiClient.healthCheck(),
};

export default api;