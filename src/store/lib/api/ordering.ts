import { createApiClient } from "@/lib/api/http";
import type { OrdersResponse } from "@/lib/api/types/ordering";

const client = createApiClient("NEXT_PUBLIC_ORDERING_API_BASE_URL");

export async function getOrdersForCurrentUser(params?: { page?: number; pageSize?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("Page", params.page.toString());
  if (params?.pageSize) query.set("PageSize", params.pageSize.toString());
  return client.request<OrdersResponse>("/api/orders/user/me", { method: "GET" }, query);
}

export async function getOrdersByUserId(userId: string, params?: { page?: number; pageSize?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("Page", params.page.toString());
  if (params?.pageSize) query.set("PageSize", params.pageSize.toString());
  return client.request<OrdersResponse>(`/api/orders/user/${encodeURIComponent(userId)}`, { method: "GET" }, query);
}

export async function shipOrder(orderId: number) {
  return client.request<void>(`/api/orders/ship/${orderId}`, { method: "PATCH" });
}

export async function cancelOrder(orderId: number) {
  return client.request<void>(`/api/orders/cancel/${orderId}`, { method: "POST" });
}
