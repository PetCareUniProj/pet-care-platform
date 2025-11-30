import { auth } from "@/auth";
import { ApiError } from "@/lib/api/http";
import type { OrderResponse, OrdersResponse } from "@/lib/api/types/ordering";
import { getServiceEndpoint } from "@/service-discovery";

const ORDERING_SERVICE_NAME = "ordering-api";

interface PagingParams {
  page?: number;
  pageSize?: number;
}

export interface GetOrdersParams extends PagingParams {
  statuses?: string[];
  sortBy?: string;
  isRecurring?: boolean;
}

function ensureOrderingBaseUrl(): string {
  const orderingApiBaseUrl = getServiceEndpoint(ORDERING_SERVICE_NAME) ?? process.env.NEXT_PUBLIC_ORDERING_API_BASE_URL;
  if (!orderingApiBaseUrl) {
    throw new Error("Ordering endpoint not found. Start Aspire or configure NEXT_PUBLIC_ORDERING_API_BASE_URL.");
  }
  return orderingApiBaseUrl;
}

async function ensureOrderingAccessToken(errorMessage: string): Promise<string> {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error(errorMessage);
  }
  return session.accessToken;
}

async function orderingRequest<T>(path: string, init: RequestInit = {}, query?: URLSearchParams) {
  const baseUrl = ensureOrderingBaseUrl();
  const accessToken = await ensureOrderingAccessToken("Sign in to call the Ordering API.");
  const url = new URL(path, baseUrl);
  if (query && [...query.keys()].length > 0) {
    url.search = query.toString();
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let details: unknown;
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      try {
        details = await response.json();
      } catch {
        details = await response.text();
      }
    } else {
      details = await response.text();
    }
    throw new ApiError(`Ordering request to ${url.pathname} failed with status ${response.status}.`, response.status, details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength === "0") {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

function buildPagingQuery(params?: PagingParams) {
  const query = new URLSearchParams();
  if (params?.page && Number.isFinite(params.page)) {
    query.set("Page", Math.max(1, params.page).toString());
  }
  if (params?.pageSize && Number.isFinite(params.pageSize)) {
    query.set("PageSize", Math.max(1, params.pageSize).toString());
  }
  return query;
}

export async function getOrders(params?: GetOrdersParams) {
  const query = buildPagingQuery(params);
  if (params?.statuses) {
    for (const status of params.statuses) {
      if (status) {
        query.append("Statuses", status);
      }
    }
  }
  if (params?.sortBy) {
    query.set("SortBy", params.sortBy);
  }
  if (typeof params?.isRecurring === "boolean") {
    query.set("IsRecurring", params.isRecurring ? "true" : "false");
  }
  return orderingRequest<OrdersResponse>("/api/orders/", { method: "GET" }, query);
}

export async function getOrdersForCurrentUser(params?: PagingParams) {
  return orderingRequest<OrdersResponse>("/api/orders/user/me", { method: "GET" }, buildPagingQuery(params));
}

export async function getOrdersByUserId(userId: string, params?: PagingParams) {
  return orderingRequest<OrdersResponse>(`/api/orders/user/${encodeURIComponent(userId)}`, { method: "GET" }, buildPagingQuery(params));
}

export async function getOrderById(orderId: number) {
  return orderingRequest<OrderResponse>(`/api/orders/${orderId}`, { method: "GET" });
}

export async function shipOrder(orderId: number) {
  return orderingRequest<void>(`/api/orders/ship/${orderId}`, { method: "PATCH" });
}

export async function cancelOrder(orderId: number) {
  return orderingRequest<void>(`/api/orders/cancel/${orderId}`, { method: "POST" });
}
