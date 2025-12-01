"use server";

import { revalidatePath } from "next/cache";
import { ensureCatalogAccessToken, ensureCatalogBaseUrl, buildCatalogError } from "../catalog-actions-utils";

interface CatalogItemPayload {
  readonly slug: string;
  readonly name: string;
  readonly description?: string;
  readonly price: number;
  readonly pictureFileName?: string;
  readonly catalogBrandId: number;
  readonly availableStock: number;
  readonly restockThreshold: number;
  readonly maxStockThreshold: number;
  readonly onReorder: boolean;
  readonly categoryIds: number[];
}

function buildCatalogItemPayload(formData: FormData): CatalogItemPayload {
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || undefined,
    price: Number(formData.get("price") ?? 0),
    pictureFileName: String(formData.get("pictureFileName") ?? "").trim() || undefined,
    catalogBrandId: Number(formData.get("catalogBrandId") ?? 0),
    availableStock: Number(formData.get("availableStock") ?? 0),
    restockThreshold: Number(formData.get("restockThreshold") ?? 0),
    maxStockThreshold: Number(formData.get("maxStockThreshold") ?? 0),
    onReorder: formData.get("onReorder") === "on",
    categoryIds: formData
      .getAll("categoryIds")
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value)),
  };
}

function validateCatalogItemPayload(payload: CatalogItemPayload) {
  if (!payload.slug || !payload.name) {
    throw new Error("Slug and name are required.");
  }

  if (!Number.isFinite(payload.price) || payload.price <= 0) {
    throw new Error("Price must be greater than zero.");
  }

  if (!Number.isFinite(payload.catalogBrandId) || payload.catalogBrandId <= 0) {
    throw new Error("Select a brand for the catalog item.");
  }

  if (payload.categoryIds.length === 0) {
    throw new Error("Select at least one category.");
  }
}

export async function createCatalogItemAction(formData: FormData) {
  const accessToken = await ensureCatalogAccessToken("Sign in to manage catalog items.");
  const baseUrl = ensureCatalogBaseUrl();
  const payload = buildCatalogItemPayload(formData);
  validateCatalogItemPayload(payload);

  const response = await fetch(`${baseUrl}/api/catalog/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw await buildCatalogError(response, "Failed to create catalog item.");
  }

  revalidatePath("/admin/catalog/items");
}

export async function deleteCatalogItemAction(formData: FormData) {
  const accessToken = await ensureCatalogAccessToken("Sign in to manage catalog items.");
  const baseUrl = ensureCatalogBaseUrl();
  const id = Number(formData.get("itemId"));

  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Valid item id is required for deletion.");
  }

  const response = await fetch(`${baseUrl}/api/catalog/items/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw await buildCatalogError(response, "Failed to delete catalog item.");
  }

  revalidatePath("/admin/catalog/items");
}

export async function updateCatalogItemAction(formData: FormData) {
  const accessToken = await ensureCatalogAccessToken("Sign in to manage catalog items.");
  const baseUrl = ensureCatalogBaseUrl();
  const id = Number(formData.get("itemId"));

  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Valid item id is required for updates.");
  }

  const payload = buildCatalogItemPayload(formData);
  validateCatalogItemPayload(payload);

  const response = await fetch(`${baseUrl}/api/catalog/items/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw await buildCatalogError(response, "Failed to update catalog item.");
  }

  revalidatePath("/admin/catalog/items");
}
