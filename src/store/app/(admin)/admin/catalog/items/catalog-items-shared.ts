import type {
  BrandResponse,
  CategoryResponse,
  ItemResponse,
} from "@/lib/api/types/catalog";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  normalizePageSize,
} from "../catalog-constants";

export interface CatalogItemsApiResponse {
  readonly items: ItemResponse[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly brands: BrandResponse[];
  readonly categories: CategoryResponse[];
}

export interface CatalogFilters {
  readonly name?: string;
  readonly brandId?: number;
  readonly categoryId?: number;
  readonly sortBy?: string;
  readonly page: number;
  readonly pageSize: number;
}

export type RouteSearchParams = Record<string, string | string[] | undefined> | undefined;

export function parseNumber(value: string | null | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export { DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE, MAX_PAGE_SIZE, PAGE_SIZE_OPTIONS, normalizePageSize } from "../catalog-constants";

export function buildRouterQueryString(filters: CatalogFilters) {
  const query = new URLSearchParams();
  if (filters.name) query.set("name", filters.name);
  if (filters.brandId) query.set("brandId", filters.brandId.toString());
  if (filters.categoryId) query.set("categoryId", filters.categoryId.toString());
  if (filters.sortBy) query.set("sortBy", filters.sortBy);
  if (filters.page > 1) query.set("page", filters.page.toString());
  if (filters.pageSize !== DEFAULT_PAGE_SIZE) query.set("pageSize", filters.pageSize.toString());
  return query.toString();
}

export function buildApiItemsQueryString(filters: CatalogFilters) {
  const query = new URLSearchParams();
  if (filters.name) query.set("Name", filters.name);
  if (filters.brandId) query.set("BrandId", filters.brandId.toString());
  if (filters.categoryId) query.set("CategoryId", filters.categoryId.toString());
  if (filters.sortBy) query.set("SortBy", filters.sortBy);
  query.set("Page", filters.page.toString());
  query.set("PageSize", filters.pageSize.toString());
  return query.toString();
}

export function buildFiltersFromUrlSearchParams(params: URLSearchParams): CatalogFilters {
  const parsedPage = parseNumber(params.get("page")) ?? 1;
  const parsedPageSize = parseNumber(params.get("pageSize")) ?? DEFAULT_PAGE_SIZE;
  return {
    name: params.get("name") ?? undefined,
    brandId: parseNumber(params.get("brandId")),
    categoryId: parseNumber(params.get("categoryId")),
    sortBy: params.get("sortBy") ?? undefined,
    page: Math.max(parsedPage, 1),
    pageSize: normalizePageSize(parsedPageSize),
  };
}

export function buildFiltersFromSearchParamsRecord(searchParams: RouteSearchParams): CatalogFilters {
  const params = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (Array.isArray(value)) {
        for (const entry of value) {
          params.append(key, entry);
        }
      } else if (typeof value === "string") {
        params.set(key, value);
      }
    }
  }

  return buildFiltersFromUrlSearchParams(params);
}
