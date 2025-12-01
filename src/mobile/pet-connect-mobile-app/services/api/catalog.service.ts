// Catalog service based on Catalog API OpenAPI spec

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import {
  CatalogItem,
  Brand,
  Category,
  CatalogItemsParams,
  CategoriesParams,
  BrandsParams,
} from '@/types/product.types';
import { PaginatedResponse } from '@/types/api.types';

/**
 * Service for interacting with Catalog API
 * Handles: Items, Categories, Brands
 */
class CatalogService {
  // ============ Items ============

  /**
   * Get paginated list of catalog items
   * GET /api/items
   */
  async getItems(params?: CatalogItemsParams): Promise<PaginatedResponse<CatalogItem>> {
    const queryParams: Record<string, string | number> = {};

    if (params?.name) queryParams.Name = params.name;
    if (params?.brandId) queryParams.BrandId = params.brandId;
    if (params?.categoryId) queryParams.CategoryId = params.categoryId;
    if (params?.sortBy) queryParams.SortBy = params.sortBy;
    if (params?.page) queryParams.Page = params.page;
    if (params?.pageSize) queryParams.PageSize = params.pageSize;

    return apiClient.get<PaginatedResponse<CatalogItem>>(
      API_ENDPOINTS.CATALOG.ITEMS.GET_ALL,
      { params: queryParams, service: 'catalog' }
    );
  }

  /**
   * Get single item by ID or slug
   * GET /api/items/{idOrSlug}
   */
  async getItemByIdOrSlug(idOrSlug: string | number): Promise<CatalogItem> {
    return apiClient.get<CatalogItem>(
      API_ENDPOINTS.CATALOG.ITEMS.GET_BY_ID(String(idOrSlug)),
      { service: 'catalog' }
    );
  }

  /**
   * Get item picture URL
   * Note: This returns a URL, not the actual image
   */
  getItemPictureUrl(id: number): string {
    return API_ENDPOINTS.CATALOG.ITEMS.GET_PICTURE(id);
  }

  // ============ Categories ============

  /**
   * Get paginated list of categories
   * GET /api/category
   */
  async getCategories(params?: CategoriesParams): Promise<PaginatedResponse<Category>> {
    const queryParams: Record<string, string | number> = {};

    if (params?.name) queryParams.Name = params.name;
    if (params?.sortBy) queryParams.SortBy = params.sortBy;
    if (params?.page) queryParams.Page = params.page;
    if (params?.pageSize) queryParams.PageSize = params.pageSize;

    return apiClient.get<PaginatedResponse<Category>>(
      API_ENDPOINTS.CATALOG.CATEGORIES.GET_ALL,
      { params: queryParams, service: 'catalog' }
    );
  }

  /**
   * Get all categories (unpaginated helper)
   */
  async getAllCategories(): Promise<Category[]> {
    const response = await this.getCategories({ pageSize: 25 });
    return response.items;
  }

  /**
   * Get single category by ID
   * GET /api/category/{id}
   */
  async getCategoryById(id: number): Promise<Category> {
    return apiClient.get<Category>(
      API_ENDPOINTS.CATALOG.CATEGORIES.GET_BY_ID(id),
      { service: 'catalog' }
    );
  }

  // ============ Brands ============

  /**
   * Get paginated list of brands
   * GET /api/brand
   */
  async getBrands(params?: BrandsParams): Promise<PaginatedResponse<Brand>> {
    const queryParams: Record<string, string | number> = {};

    if (params?.name) queryParams.Name = params.name;
    if (params?.sortBy) queryParams.SortBy = params.sortBy;
    if (params?.page) queryParams.Page = params.page;
    if (params?.pageSize) queryParams.PageSize = params.pageSize;

    return apiClient.get<PaginatedResponse<Brand>>(
      API_ENDPOINTS.CATALOG.BRANDS.GET_ALL,
      { params: queryParams, service: 'catalog' }
    );
  }

  /**
   * Get all brands (unpaginated helper)
   */
  async getAllBrands(): Promise<Brand[]> {
    const response = await this.getBrands({ pageSize: 25 });
    return response.items;
  }

  /**
   * Get single brand by ID
   * GET /api/brand/{id}
   */
  async getBrandById(id: number): Promise<Brand> {
    return apiClient.get<Brand>(
      API_ENDPOINTS.CATALOG.BRANDS.GET_BY_ID(id),
      { service: 'catalog' }
    );
  }
}

export const catalogService = new CatalogService();
