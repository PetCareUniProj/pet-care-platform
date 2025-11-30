import type { GetOrdersParams } from "@/lib/api/ordering";
import { ORDER_STATUS_VALUES, type OrderStatusValue } from "@/lib/api/types/ordering";

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

export interface OrdersFilterState {
  statuses: OrderStatusValue[];
  isRecurring?: boolean;
  page: number;
  pageSize: number;
  sortBy?: string;
}

type SearchParamsRecord = Record<string, string | string[] | undefined> | undefined;

export async function parseOrdersFilters(sParams: SearchParamsRecord, overrides?: Partial<OrdersFilterState>): Promise<OrdersFilterState> {
  const searchParams = await sParams;
  const statusParams = normalizeArray(searchParams?.["status"] ?? searchParams?.["statuses"]);
  const parsedStatuses = statusParams
    .map((status) => status.trim())
    .filter((status): status is OrderStatusValue => ORDER_STATUS_VALUES.includes(status as OrderStatusValue));

  const pageParam = normalizeSingle(searchParams?.["page"]);
  const parsedPage = clampPositiveInteger(pageParam, overrides?.page ?? 1);

  const pageSizeParam = normalizeSingle(searchParams?.["pageSize"]);
  const parsedPageSize = clampPageSize(pageSizeParam, overrides?.pageSize ?? DEFAULT_PAGE_SIZE);

  const recurringParam = normalizeSingle(searchParams?.["recurring"]);
  const parsedRecurring = parseBooleanQueryValue(recurringParam, overrides?.isRecurring);

  const sortParam = normalizeSingle(searchParams?.["sort"]) ?? overrides?.sortBy;

  const statuses = parsedStatuses.length > 0 ? parsedStatuses : overrides?.statuses ?? [];

  return {
    statuses,
    isRecurring: parsedRecurring,
    page: parsedPage,
    pageSize: parsedPageSize,
    sortBy: sortParam?.trim() || undefined,
  };
}

export function buildOrdersHref(basePath: string, filters: OrdersFilterState, overrides?: Partial<OrdersFilterState>) {
  const query = buildOrdersQuery(filters, overrides);
  if (!query) {
    return basePath;
  }
  return `${basePath}?${query}`;
}

export function buildOrdersQuery(filters: OrdersFilterState, overrides?: Partial<OrdersFilterState>) {
  const merged = mergeFilters(filters, overrides);
  const query = new URLSearchParams();
  merged.statuses.forEach((status) => query.append("status", status));
  if (typeof merged.isRecurring === "boolean") {
    query.set("recurring", merged.isRecurring ? "true" : "false");
  }
  query.set("page", merged.page.toString());
  query.set("pageSize", merged.pageSize.toString());
  if (merged.sortBy) {
    query.set("sort", merged.sortBy);
  }
  return query.toString();
}

export function buildGetOrdersParams(filters: OrdersFilterState): GetOrdersParams {
  return {
    page: filters.page,
    pageSize: filters.pageSize,
    statuses: filters.statuses,
    isRecurring: filters.isRecurring,
    sortBy: filters.sortBy,
  };
}

function mergeFilters(filters: OrdersFilterState, overrides?: Partial<OrdersFilterState>): OrdersFilterState {
  if (!overrides) {
    return filters;
  }
  return {
    statuses: overrides.statuses ?? filters.statuses,
    isRecurring: overrides.isRecurring ?? filters.isRecurring,
    page: normalizePageNumber(overrides.page ?? filters.page),
    pageSize: normalizePageSize(overrides.pageSize ?? filters.pageSize),
    sortBy: overrides.sortBy ?? filters.sortBy,
  };
}

function normalizeArray(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string") {
    return [value];
  }
  return [];
}

function normalizeSingle(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value.at(0);
  }
  if (typeof value === "string") {
    return value;
  }
  return undefined;
}

function clampPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return Math.max(1, fallback);
  }
  return Math.min(9999, Math.trunc(parsed));
}

function clampPageSize(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return normalizePageSize(fallback);
  }
  return normalizePageSize(parsed);
}

export function normalizePageSize(value: number) {
  const allowed = PAGE_SIZE_OPTIONS.includes(value) ? value : DEFAULT_PAGE_SIZE;
  return allowed;
}

function normalizePageNumber(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }
  return Math.min(9999, Math.trunc(value));
}

function parseBooleanQueryValue(value: string | undefined, fallback?: boolean) {
  if (typeof value !== "string") {
    return fallback;
  }
  const normalized = value.toLowerCase();
  if (["true", "1", "yes"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no"].includes(normalized)) {
    return false;
  }
  return fallback;
}
