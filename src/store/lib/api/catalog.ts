import { createApiClient } from "@/lib/api/http";
import type {
  BrandResponse,
  BrandsResponse,
  CategoriesResponse,
  CategoryResponse,
  GetItemsParams,
  ItemsResponse,
} from "@/lib/api/types/catalog";

const client = createApiClient("NEXT_PUBLIC_CATALOG_API_BASE_URL");

function buildItemsQuery(params?: GetItemsParams) {
  const query = new URLSearchParams();
  if (!params) {
    return query;
  }

  if (params.name) query.set("Name", params.name);
  if (params.brandId) query.set("BrandId", params.brandId.toString());
  if (params.categoryId) query.set("CategoryId", params.categoryId.toString());
  if (params.sortBy) query.set("SortBy", params.sortBy);
  if (params.page) query.set("Page", params.page.toString());
  if (params.pageSize) query.set("PageSize", params.pageSize.toString());

  return query;
}

export async function getCatalogItems(params?: GetItemsParams) {
  return client.request<ItemsResponse>("/api/items", { method: "GET" }, buildItemsQuery(params));
}

export async function getCatalogItem(idOrSlug: string) {
  return client.request(`/api/items/${encodeURIComponent(idOrSlug)}`, { method: "GET" });
}

export async function getBrands(params?: { name?: string; page?: number; pageSize?: number; sortBy?: string }) {
  const query = new URLSearchParams();
  if (params?.name) query.set("Name", params.name);
  if (params?.page) query.set("Page", params.page.toString());
  if (params?.pageSize) query.set("PageSize", params.pageSize.toString());
  if (params?.sortBy) query.set("SortBy", params.sortBy);
  return client.request<BrandsResponse>("/api/brand", { method: "GET" }, query);
}

export async function getBrand(id: number) {
  return client.request<BrandResponse>(`/api/brand/${id}`, { method: "GET" });
}

export async function getCategories(params?: { name?: string; page?: number; pageSize?: number; sortBy?: string }) {
  const query = new URLSearchParams();
  if (params?.name) query.set("Name", params.name);
  if (params?.page) query.set("Page", params.page.toString());
  if (params?.pageSize) query.set("PageSize", params.pageSize.toString());
  if (params?.sortBy) query.set("SortBy", params.sortBy);
  return client.request<CategoriesResponse>("/api/category", { method: "GET" }, query);
}

export async function getCategory(id: number) {
  return client.request<CategoryResponse>(`/api/category/${id}`, { method: "GET" });
}
