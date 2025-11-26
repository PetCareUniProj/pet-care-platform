// Product/Catalog types based on Catalog API OpenAPI spec

/**
 * Item (Product) response from Catalog API
 * Matches: /api/items endpoints
 */
export interface CatalogItem {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  price: number;
  pictureFileName?: string | null;
  catalogBrandId: number;
  availableStock: number;
  restockThreshold: number;
  maxStockThreshold: number;
  onReorder: boolean;
  categoryIds: number[];
}

/**
 * Brand response from Catalog API
 * Matches: /api/brand endpoints
 */
export interface Brand {
  id: number;
  name: string;
}

/**
 * Category response from Catalog API
 * Matches: /api/category endpoints
 */
export interface Category {
  id: number;
  name: string;
}

/**
 * Query parameters for fetching catalog items
 * Matches: GET /api/items query params
 */
export interface CatalogItemsParams {
  name?: string;
  brandId?: number;
  categoryId?: number;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Query parameters for fetching categories
 * Matches: GET /api/category query params
 */
export interface CategoriesParams {
  name?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Query parameters for fetching brands
 * Matches: GET /api/brand query params
 */
export interface BrandsParams {
  name?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

// ============ Product display helpers ============

/**
 * Enriched product for UI display (includes brand and categories data)
 */
export interface ProductDisplay extends CatalogItem {
  brand?: Brand;
  categories?: Category[];
  pictureUrl?: string;
}

/**
 * Product filters for catalog UI
 */
export interface ProductFilters {
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
}

/**
 * Sort options for catalog UI
 */
export type ProductSortField = 'name' | 'price' | '-name' | '-price';
