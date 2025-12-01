"use server";

import { revalidatePath } from "next/cache";
import { ensureCatalogAccessToken, ensureCatalogBaseUrl, buildCatalogError } from "../catalog-actions-utils";

const ROUTE_PATH = "/admin/catalog/categories";

function readName(formData: FormData): string {
  const value = String(formData.get("name") ?? "").trim();
  if (!value) {
    throw new Error("Name is required.");
  }
  return value;
}

export async function createCatalogCategoryAction(formData: FormData) {
  const accessToken = await ensureCatalogAccessToken("Sign in to manage catalog categories.");
  const baseUrl = ensureCatalogBaseUrl();
  const payload = { name: readName(formData) };

  const response = await fetch(`${baseUrl}/api/catalog/category`, {
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
    throw await buildCatalogError(response, "Failed to create category.");
  }

  revalidatePath(ROUTE_PATH);
}

export async function updateCatalogCategoryAction(formData: FormData) {
  const accessToken = await ensureCatalogAccessToken("Sign in to manage catalog categories.");
  const baseUrl = ensureCatalogBaseUrl();
  const id = Number(formData.get("categoryId"));

  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Valid category id is required.");
  }

  const payload = { newName: readName(formData) };

  const response = await fetch(`${baseUrl}/api/catalog/category/${id}`, {
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
    throw await buildCatalogError(response, "Failed to update category.");
  }

  revalidatePath(ROUTE_PATH);
}

export async function deleteCatalogCategoryAction(formData: FormData) {
  const accessToken = await ensureCatalogAccessToken("Sign in to manage catalog categories.");
  const baseUrl = ensureCatalogBaseUrl();
  const id = Number(formData.get("categoryId"));

  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Valid category id is required.");
  }

  const response = await fetch(`${baseUrl}/api/catalog/category/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw await buildCatalogError(response, "Failed to delete category.");
  }

  revalidatePath(ROUTE_PATH);
}
