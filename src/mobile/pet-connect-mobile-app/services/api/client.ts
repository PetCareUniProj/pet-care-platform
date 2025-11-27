// API Client with Axios

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { CATALOG_API_URL, ORDERING_API_URL, BASKET_API_URL, SUBSCRIPTION_API_URL, REQUEST_TIMEOUT, RETRY_CONFIG } from '@/constants/api';
import { tokenStorage } from '@/utils/storage';
import { ApiError } from '@/types/api.types';

class ApiClient {
  private catalogClient: AxiosInstance;
  private orderingClient: AxiosInstance;
  private basketClient: AxiosInstance;
  private subscriptionClient: AxiosInstance;
  private retryCount = 0;

  constructor() {
    const commonConfig = {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    this.catalogClient = axios.create({
      baseURL: CATALOG_API_URL,
      ...commonConfig,
    });

    this.orderingClient = axios.create({
      baseURL: ORDERING_API_URL,
      ...commonConfig,
    });

    this.basketClient = axios.create({
      baseURL: BASKET_API_URL,
      ...commonConfig,
    });

    this.subscriptionClient = axios.create({
      baseURL: SUBSCRIPTION_API_URL,
      ...commonConfig,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    const clients = [this.catalogClient, this.orderingClient, this.basketClient, this.subscriptionClient];
    
    clients.forEach((client) => {
      // Request interceptor - add auth token
      client.interceptors.request.use(
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
      client.interceptors.response.use(
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
                // return client(originalRequest);
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
            return client(originalRequest);
          }

          return Promise.reject(this.handleError(error));
        }
      );
    });
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error
      const apiError: ApiError = {
        message: (error.response.data as any)?.message || error.message,
        statusCode: error.response.status,
        code: (error.response.data as any)?.code || error.code,
        errors: (error.response.data as any)?.errors,
      };
      return apiError;
    } else if (error.request) {
      // Request made but no response
      const networkError: ApiError = {
        message: `Network error. Please check your internet connection. URL: ${error.config?.baseURL}${error.config?.url}`,
        statusCode: 0,
        code: error.code || 'NETWORK_ERROR',
      };
      return networkError;
    } else {
      // Something else happened
      const unexpectedError: ApiError = {
        message: error.message || 'An unexpected error occurred',
        code: error.code,
      };
      return unexpectedError;
    }
  }

  // Public methods - Catalog API
  async get<T>(url: string, config?: AxiosRequestConfig & { service?: 'catalog' | 'ordering' | 'basket' | 'subscription' }): Promise<T> {
    const client = this.getClient(config?.service || 'catalog');
    const response = await client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig & { service?: 'catalog' | 'ordering' | 'basket' | 'subscription' }): Promise<T> {
    const client = this.getClient(config?.service || 'catalog');
    const response = await client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig & { service?: 'catalog' | 'ordering' | 'basket' | 'subscription' }): Promise<T> {
    const client = this.getClient(config?.service || 'catalog');
    const response = await client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig & { service?: 'catalog' | 'ordering' | 'basket' | 'subscription' }): Promise<T> {
    const client = this.getClient(config?.service || 'catalog');
    const response = await client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig & { service?: 'catalog' | 'ordering' | 'basket' | 'subscription' }): Promise<T> {
    const client = this.getClient(config?.service || 'catalog');
    const response = await client.delete<T>(url, config);
    return response.data;
  }

  private getClient(service: 'catalog' | 'ordering' | 'basket' | 'subscription'): AxiosInstance {
    switch (service) {
      case 'catalog':
        return this.catalogClient;
      case 'ordering':
        return this.orderingClient;
      case 'basket':
        return this.basketClient;
      case 'subscription':
        return this.subscriptionClient;
      default:
        return this.catalogClient;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();


