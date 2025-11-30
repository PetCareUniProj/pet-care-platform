"use server";

import "server-only";

import { auth } from "@/auth";
import type { BasketItem, CustomerBasket } from "@/lib/basket-client";
import { getServiceEndpoint } from "@/service-discovery";

const DEFAULT_BASKET_BASE_URL = process.env.NEXT_PUBLIC_BASKET_API_BASE_URL ?? "http://localhost:5001";
const BASKET_RESOURCE = "/api/basket";

function resolveBasketEndpoint() {
  const baseUrl = getServiceEndpoint("basket-api") ?? DEFAULT_BASKET_BASE_URL;
  if (!baseUrl) {
    throw new Error("Basket service endpoint is not configured.");
  }

  return new URL(BASKET_RESOURCE, baseUrl);
}

async function basketFetch<T>(init: RequestInit) {
  const url = resolveBasketEndpoint();
  const session = await auth();
  const headers = new Headers(init.headers);

  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Basket request failed with status ${response.status}: ${errorBody}`);
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

export async function fetchCustomerBasket() {
  return basketFetch<CustomerBasket>({ method: "GET" });
}

export async function updateCustomerBasket(items: BasketItem[]) {
  return basketFetch<CustomerBasket>({
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

export async function clearCustomerBasket() {
  await basketFetch<void>({ method: "DELETE" });
}
