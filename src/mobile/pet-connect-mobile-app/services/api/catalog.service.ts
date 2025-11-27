// Catalog service based on Catalog API OpenAPI spec
// With mock data fallback for mobile development

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

// Mock data for development
const mockCategories: Category[] = [
  { id: '1', name: 'Корми', slug: 'food' },
  { id: '2', name: 'Наповнювачі', slug: 'litter' },
  { id: '3', name: 'Іграшки', slug: 'toys' },
  { id: '4', name: 'Догляд', slug: 'care' },
  { id: '5', name: 'Ліки', slug: 'medicine' },
  { id: '6', name: 'Амуніція', slug: 'accessories' },
];

const mockBrands: Brand[] = [
  { id: '1', name: 'Royal Canin' },
  { id: '2', name: 'Purina' },
  { id: '3', name: 'Hills' },
  { id: '4', name: 'Catsan' },
  { id: '5', name: 'Pedigree' },
  { id: '6', name: 'Whiskas' },
];

const mockProducts: CatalogItem[] = [
  {
    id: 1,
    name: 'Royal Canin Indoor Cat 4kg',
    slug: 'royal-canin-indoor-cat-4kg',
    description: 'Сухий корм для домашніх кішок',
    price: 890,
    pictureUri: undefined,
    availableStock: 25,
    brand: mockBrands[0],
    categories: [mockCategories[0]],
  },
  {
    id: 2,
    name: 'Наповнювач Catsan 10л',
    slug: 'catsan-10l',
    description: 'Гігієнічний наповнювач для котячих туалетів',
    price: 320,
    pictureUri: undefined,
    availableStock: 50,
    brand: mockBrands[3],
    categories: [mockCategories[1]],
  },
  {
    id: 3,
    name: 'Purina Pro Plan Adult Dog 12kg',
    slug: 'purina-pro-plan-adult-dog-12kg',
    description: 'Сухий корм для дорослих собак',
    price: 1250,
    pictureUri: undefined,
    availableStock: 15,
    brand: mockBrands[1],
    categories: [mockCategories[0]],
  },
  {
    id: 4,
    name: 'Hills Science Plan Kitten',
    slug: 'hills-science-plan-kitten',
    description: 'Сухий корм для кошенят',
    price: 650,
    pictureUri: undefined,
    availableStock: 30,
    brand: mockBrands[2],
    categories: [mockCategories[0]],
  },
  {
    id: 5,
    name: 'Іграшка-мишка для кота',
    slug: 'toy-mouse-cat',
    description: 'М\'яка іграшка з котячою м\'ятою',
    price: 85,
    pictureUri: undefined,
    availableStock: 100,
    brand: undefined,
    categories: [mockCategories[2]],
  },
  {
    id: 6,
    name: 'Щітка для шерсті',
    slug: 'grooming-brush',
    description: 'Професійна щітка для догляду за шерстю',
    price: 180,
    pictureUri: undefined,
    availableStock: 45,
    brand: undefined,
    categories: [mockCategories[3]],
  },
  {
    id: 7,
    name: 'Pedigree Adult Dog 10kg',
    slug: 'pedigree-adult-dog-10kg',
    description: 'Сухий корм для дорослих собак',
    price: 650,
    pictureUri: undefined,
    availableStock: 35,
    brand: mockBrands[4],
    categories: [mockCategories[0]],
  },
  {
    id: 8,
    name: 'Whiskas для кішок з куркою',
    slug: 'whiskas-chicken',
    description: 'Вологий корм для кішок',
    price: 35,
    pictureUri: undefined,
    availableStock: 200,
    brand: mockBrands[5],
    categories: [mockCategories[0]],
  },
  {
    id: 9,
    name: 'Нашийник від бліх',
    slug: 'flea-collar',
    description: 'Захисний нашийник від паразитів',
    price: 250,
    pictureUri: undefined,
    availableStock: 60,
    brand: undefined,
    categories: [mockCategories[4]],
  },
  {
    id: 10,
    name: 'Повідок для собак 2м',
    slug: 'dog-leash-2m',
    description: 'Міцний повідок для прогулянок',
    price: 320,
    pictureUri: undefined,
    availableStock: 40,
    brand: undefined,
    categories: [mockCategories[5]],
  },
  {
    id: 11,
    name: 'Вітаміни для котів',
    slug: 'cat-vitamins',
    description: 'Комплекс вітамінів для здоров\'я кота',
    price: 180,
    pictureUri: undefined,
    availableStock: 80,
    brand: undefined,
    categories: [mockCategories[4]],
  },
  {
    id: 12,
    name: 'Когтеточка висока',
    slug: 'scratching-post',
    description: 'Когтеточка з лежанкою для кота',
    price: 890,
    pictureUri: undefined,
    availableStock: 12,
    brand: undefined,
    categories: [mockCategories[2]],
  },
];

/**
 * Service for interacting with Catalog API
 * Handles: Items, Categories, Brands
 */
class CatalogService {
  private useMock = true; // Use mock data for mobile development

  // ============ Items ============

  /**
   * Get paginated list of catalog items
   * GET /api/items
   */
  async getItems(params?: CatalogItemsParams): Promise<PaginatedResponse<CatalogItem>> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      
      let filtered = [...mockProducts];
      
      if (params?.name) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(params.name!.toLowerCase())
        );
      }
      if (params?.categoryId) {
        filtered = filtered.filter(p => 
          p.categories?.some(c => c.id === params.categoryId)
        );
      }
      if (params?.brandId) {
        filtered = filtered.filter(p => p.brand?.id === params.brandId);
      }

      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const start = (page - 1) * pageSize;
      const items = filtered.slice(start, start + pageSize);

      return {
        items,
        total: filtered.length,
        page,
        pageSize,
        hasNextPage: start + pageSize < filtered.length,
      };
    }

    const queryParams: Record<string, string | number> = {};

    if (params?.name) queryParams.Name = params.name;
    if (params?.brandId) queryParams.BrandId = params.brandId;
    if (params?.categoryId) queryParams.CategoryId = params.categoryId;
    if (params?.sortBy) queryParams.SortBy = params.sortBy;
    if (params?.page) queryParams.Page = params.page;
    if (params?.pageSize) queryParams.PageSize = params.pageSize;

    return apiClient.get<PaginatedResponse<CatalogItem>>(
      API_ENDPOINTS.CATALOG.ITEMS.GET_ALL,
      { params: queryParams }
    );
  }

  /**
   * Get single item by ID or slug
   * GET /api/items/{idOrSlug}
   */
  async getItemByIdOrSlug(idOrSlug: string | number): Promise<CatalogItem> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const item = mockProducts.find(p => 
        p.id === Number(idOrSlug) || p.slug === String(idOrSlug)
      );
      if (!item) throw new Error('Item not found');
      return item;
    }

    return apiClient.get<CatalogItem>(
      API_ENDPOINTS.CATALOG.ITEMS.GET_BY_ID(String(idOrSlug))
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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      let filtered = [...mockCategories];
      if (params?.name) {
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(params.name!.toLowerCase())
        );
      }

      return {
        items: filtered,
        total: filtered.length,
        page: 1,
        pageSize: filtered.length,
        hasNextPage: false,
      };
    }

    const queryParams: Record<string, string | number> = {};

    if (params?.name) queryParams.Name = params.name;
    if (params?.sortBy) queryParams.SortBy = params.sortBy;
    if (params?.page) queryParams.Page = params.page;
    if (params?.pageSize) queryParams.PageSize = params.pageSize;

    return apiClient.get<PaginatedResponse<Category>>(
      API_ENDPOINTS.CATALOG.CATEGORIES.GET_ALL,
      { params: queryParams }
    );
  }

  /**
   * Get all categories (unpaginated helper)
   */
  async getAllCategories(): Promise<Category[]> {
    const response = await this.getCategories({ pageSize: 100 });
    return response.items;
  }

  /**
   * Get single category by ID
   * GET /api/category/{id}
   */
  async getCategoryById(id: number): Promise<Category> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const category = mockCategories.find(c => c.id === String(id));
      if (!category) throw new Error('Category not found');
      return category;
    }

    return apiClient.get<Category>(
      API_ENDPOINTS.CATALOG.CATEGORIES.GET_BY_ID(id)
    );
  }

  // ============ Brands ============

  /**
   * Get paginated list of brands
   * GET /api/brand
   */
  async getBrands(params?: BrandsParams): Promise<PaginatedResponse<Brand>> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      let filtered = [...mockBrands];
      if (params?.name) {
        filtered = filtered.filter(b => 
          b.name.toLowerCase().includes(params.name!.toLowerCase())
        );
      }

      return {
        items: filtered,
        total: filtered.length,
        page: 1,
        pageSize: filtered.length,
        hasNextPage: false,
      };
    }

    const queryParams: Record<string, string | number> = {};

    if (params?.name) queryParams.Name = params.name;
    if (params?.sortBy) queryParams.SortBy = params.sortBy;
    if (params?.page) queryParams.Page = params.page;
    if (params?.pageSize) queryParams.PageSize = params.pageSize;

    return apiClient.get<PaginatedResponse<Brand>>(
      API_ENDPOINTS.CATALOG.BRANDS.GET_ALL,
      { params: queryParams }
    );
  }

  /**
   * Get all brands (unpaginated helper)
   */
  async getAllBrands(): Promise<Brand[]> {
    const response = await this.getBrands({ pageSize: 100 });
    return response.items;
  }

  /**
   * Get single brand by ID
   * GET /api/brand/{id}
   */
  async getBrandById(id: number): Promise<Brand> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const brand = mockBrands.find(b => b.id === String(id));
      if (!brand) throw new Error('Brand not found');
      return brand;
    }

    return apiClient.get<Brand>(
      API_ENDPOINTS.CATALOG.BRANDS.GET_BY_ID(id)
    );
  }
}

export const catalogService = new CatalogService();
