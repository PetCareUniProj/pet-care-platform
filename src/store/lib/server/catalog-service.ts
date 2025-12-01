"use server";

import "server-only";

import { auth } from "@/auth";
import { getServiceEndpoint } from "@/service-discovery";
import type {
  BrandResponse,
  BrandsResponse,
  CategoriesResponse,
  CategoryResponse,
  GetItemsParams,
  ItemResponse,
  ItemsResponse,
} from "@/lib/api/types/catalog";

const DEFAULT_CATALOG_BASE_URL = process.env.NEXT_PUBLIC_CATALOG_API_BASE_URL ?? "http://localhost:5000";
const CATALOG_PREFIX = "/api/catalog";

function resolveCatalogBaseUrl() {
  return getServiceEndpoint("catalog-api") ?? DEFAULT_CATALOG_BASE_URL;
}

function buildCatalogUrl(path: string, searchParams?: URLSearchParams) {
  const baseUrl = resolveCatalogBaseUrl();
  if (!baseUrl) {
    throw new Error("Catalog service endpoint is not configured.");
  }

  const url = new URL(path, baseUrl);
  if (searchParams) {
    searchParams.forEach((value, key) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });
  }

  return url;
}

async function catalogFetch<T>(path: string, init?: RequestInit, searchParams?: URLSearchParams) {
  const url = buildCatalogUrl(path, searchParams);
  const session = await auth();
  const headers = new Headers(init?.headers);

  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
    cache: init?.cache ?? "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Catalog request to ${url.pathname} failed with status ${response.status}: ${errorBody}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

function buildItemsQuery(params?: GetItemsParams) {
  const query = new URLSearchParams();
  if (!params) {
    return query;
  }

  if (params.name) {
    query.set("Name", params.name);
  }
  if (params.brandId) {
    query.set("BrandId", params.brandId.toString());
  }
  if (params.categoryId) {
    query.set("CategoryId", params.categoryId.toString());
  }
  if (params.sortBy) {
    query.set("SortBy", params.sortBy);
  }
  if (params.page) {
    query.set("Page", params.page.toString());
  }
  if (params.pageSize) {
    query.set("PageSize", params.pageSize.toString());
  }

  return query;
}

export async function fetchCatalogItems(params?: GetItemsParams) {
  return catalogFetch<ItemsResponse>(`${CATALOG_PREFIX}/items`, { method: "GET" }, buildItemsQuery(params));
}

export async function fetchCatalogItem(idOrSlug: string) {
  return catalogFetch<ItemResponse>(`${CATALOG_PREFIX}/items/${encodeURIComponent(idOrSlug)}`, { method: "GET" });
}

export async function fetchCatalogBrands(params?: { name?: string; page?: number; pageSize?: number; sortBy?: string }) {
  const query = new URLSearchParams();
  if (params?.name) {
    query.set("Name", params.name);
  }
  if (params?.page) {
    query.set("Page", params.page.toString());
  }
  if (params?.pageSize) {
    query.set("PageSize", params.pageSize.toString());
  }
  if (params?.sortBy) {
    query.set("SortBy", params.sortBy);
  }

  return catalogFetch<BrandsResponse>(`${CATALOG_PREFIX}/brand`, { method: "GET" }, query);
}

export async function fetchCatalogBrand(id: number) {
  return catalogFetch<BrandResponse>(`${CATALOG_PREFIX}/brand/${id}`, { method: "GET" });
}

export async function fetchCatalogCategories(params?: { name?: string; page?: number; pageSize?: number; sortBy?: string }) {
  const query = new URLSearchParams();
  if (params?.name) {
    query.set("Name", params.name);
  }
  if (params?.page) {
    query.set("Page", params.page.toString());
  }
  if (params?.pageSize) {
    query.set("PageSize", params.pageSize.toString());
  }
  if (params?.sortBy) {
    query.set("SortBy", params.sortBy);
  }

  return catalogFetch<CategoriesResponse>(`${CATALOG_PREFIX}/category`, { method: "GET" }, query);
}

export async function fetchCatalogCategory(id: number) {
  return catalogFetch<CategoryResponse>(`${CATALOG_PREFIX}/category/${id}`, { method: "GET" });
}

export async function createCatalogResourceUrl(path: string, searchParams?: URLSearchParams) {
  return buildCatalogUrl(path, searchParams);
}
