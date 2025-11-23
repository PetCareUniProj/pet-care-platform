// API Client with Axios

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT, RETRY_CONFIG } from '@/constants/api';
import { tokenStorage } from '@/utils/storage';
import { ApiError } from '@/types/api.types';

class ApiClient {
  private client: AxiosInstance;
  private retryCount = 0;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await tokenStorage.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => {
        this.retryCount = 0;
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await tokenStorage.getRefreshToken();
            if (refreshToken) {
              // TODO: Implement token refresh logic
              // const newTokens = await this.refreshToken(refreshToken);
              // await tokenStorage.saveTokens(newTokens.accessToken, newTokens.refreshToken);
              // originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              // return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - redirect to login
            await tokenStorage.clearTokens();
            // TODO: Navigate to login screen
            return Promise.reject(refreshError);
          }
        }

        // Retry logic for network errors
        if (
          !error.response &&
          error.request &&
          this.retryCount < RETRY_CONFIG.MAX_RETRIES
        ) {
          this.retryCount++;
          await new Promise((resolve) => setTimeout(resolve, RETRY_CONFIG.RETRY_DELAY * this.retryCount));
          return this.client(originalRequest);
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error
      const apiError: ApiError = {
        message: (error.response.data as any)?.message || error.message,
        statusCode: error.response.status,
        code: (error.response.data as any)?.code,
        errors: (error.response.data as any)?.errors,
      };
      return apiError;
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'Network error. Please check your internet connection.',
        statusCode: 0,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
      };
    }
  }

  // Public methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();


