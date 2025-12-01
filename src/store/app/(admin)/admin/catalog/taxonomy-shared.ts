import type { BrandResponse, CategoryResponse } from "@/lib/api/types/catalog";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  normalizePageSize,
} from "./catalog-constants";

export interface CatalogTaxonomyApiResponse<TItem> {
  readonly items: TItem[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface CatalogTaxonomyFilters {
  readonly name?: string;
  readonly sortBy?: string;
  readonly page: number;
  readonly pageSize: number;
}

export type RouteSearchParams = Record<string, string | string[] | undefined> | undefined;

export const TAXONOMY_SORT_OPTIONS = [
  { value: "", label: "Default order" },
  { value: "name", label: "Name (A–Z)" },
  { value: "-name", label: "Name (Z–A)" },
];

export const TAXONOMY_PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;

export function parseNumber(value: string | null | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function buildTaxonomyApiQueryString(filters: CatalogTaxonomyFilters): string {
  const query = new URLSearchParams();
  if (filters.name) query.set("Name", filters.name);
  if (filters.sortBy) query.set("SortBy", filters.sortBy);
  query.set("Page", filters.page.toString());
  query.set("PageSize", filters.pageSize.toString());
  return query.toString();
}

export function buildTaxonomyRouterQueryString(filters: CatalogTaxonomyFilters): string {
  const query = new URLSearchParams();
  if (filters.name) query.set("name", filters.name);
  if (filters.sortBy) query.set("sortBy", filters.sortBy);
  if (filters.page > 1) query.set("page", filters.page.toString());
  if (filters.pageSize !== DEFAULT_PAGE_SIZE) {
    query.set("pageSize", filters.pageSize.toString());
  }
  return query.toString();
}

export function buildTaxonomyFiltersFromUrlSearchParams(params: URLSearchParams): CatalogTaxonomyFilters {
  const parsedPage = parseNumber(params.get("page")) ?? 1;
  const parsedPageSize = parseNumber(params.get("pageSize")) ?? DEFAULT_PAGE_SIZE;
  return {
    name: params.get("name") ?? undefined,
    sortBy: params.get("sortBy") ?? undefined,
    page: Math.max(parsedPage, 1),
    pageSize: normalizePageSize(parsedPageSize),
  };
}

export function buildTaxonomyFiltersFromSearchParamsRecord(searchParams: RouteSearchParams): CatalogTaxonomyFilters {
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

  return buildTaxonomyFiltersFromUrlSearchParams(params);
}

export type CatalogTaxonomyCreatePayload = {
  readonly name: string;
};

export type CatalogTaxonomyItem = BrandResponse | CategoryResponse;

export {
  DEFAULT_PAGE_SIZE,
  MIN_PAGE_SIZE,
  MAX_PAGE_SIZE,
  normalizePageSize,
};
