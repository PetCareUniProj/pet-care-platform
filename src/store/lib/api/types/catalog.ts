import type { PagedResponse } from "./shared";

export interface BrandResponse {
  id: number;
  name: string;
}

export type BrandsResponse = PagedResponse<BrandResponse>;

export interface CategoryResponse {
  id: number;
  name: string;
}

export type CategoriesResponse = PagedResponse<CategoryResponse>;

export interface ItemResponse {
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

export type ItemsResponse = PagedResponse<ItemResponse>;

export interface GetItemsParams {
  name?: string;
  brandId?: number;
  categoryId?: number;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchCatalogParams {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}
