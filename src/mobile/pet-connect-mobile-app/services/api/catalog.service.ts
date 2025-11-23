// Catalog service

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import {
  Product,
  Brand,
  Category,
  ProductFilters,
  ProductSortOption,
  PaginatedResponse,
  PaginationParams,
} from '@/types/product.types';

class CatalogService {
  async getProducts(
    params?: PaginationParams & ProductFilters & { sortBy?: ProductSortOption }
  ): Promise<PaginatedResponse<Product>> {
    return apiClient.get<PaginatedResponse<Product>>(API_ENDPOINTS.CATALOG.ITEMS.GET_ALL, {
      params,
    });
  }

  async getProductById(idOrSlug: string): Promise<Product> {
    return apiClient.get<Product>(API_ENDPOINTS.CATALOG.ITEMS.GET_BY_ID(idOrSlug));
  }

  async getProductPicture(id: number): Promise<string> {
    return API_ENDPOINTS.CATALOG.ITEMS.GET_PICTURE(id);
  }

  async getCategories(): Promise<Category[]> {
    return apiClient.get<Category[]>(API_ENDPOINTS.CATALOG.CATEGORIES.GET_ALL);
  }

  async getCategoryById(id: number): Promise<Category> {
    return apiClient.get<Category>(API_ENDPOINTS.CATALOG.CATEGORIES.GET_BY_ID(id));
  }

  async getBrands(): Promise<Brand[]> {
    return apiClient.get<Brand[]>(API_ENDPOINTS.CATALOG.BRANDS.GET_ALL);
  }

  async getBrandById(id: number): Promise<Brand> {
    return apiClient.get<Brand>(API_ENDPOINTS.CATALOG.BRANDS.GET_BY_ID(id));
  }
}

export const catalogService = new CatalogService();


