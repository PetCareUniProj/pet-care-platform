"use server";

import { revalidatePath } from "next/cache";
import { ensureCatalogAccessToken, ensureCatalogBaseUrl, buildCatalogError } from "../catalog-actions-utils";

const ROUTE_PATH = "/admin/catalog/brands";

function readName(formData: FormData): string {
  const value = String(formData.get("name") ?? "").trim();
  if (!value) {
    throw new Error("Name is required.");
  }
  return value;
}

export async function createCatalogBrandAction(formData: FormData) {
  const accessToken = await ensureCatalogAccessToken("Sign in to manage catalog brands.");
  const baseUrl = ensureCatalogBaseUrl();
  const payload = { name: readName(formData) };

  const response = await fetch(`${baseUrl}/api/catalog/brand`, {
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
    throw await buildCatalogError(response, "Failed to create brand.");
  }

  revalidatePath(ROUTE_PATH);
}

export async function updateCatalogBrandAction(formData: FormData) {
  const accessToken = await ensureCatalogAccessToken("Sign in to manage catalog brands.");
  const baseUrl = ensureCatalogBaseUrl();
  const id = Number(formData.get("brandId"));

  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Valid brand id is required.");
  }

  const payload = { newName: readName(formData) };

  const response = await fetch(`${baseUrl}/api/catalog/brand/${id}`, {
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
    throw await buildCatalogError(response, "Failed to update brand.");
  }

  revalidatePath(ROUTE_PATH);
}

export async function deleteCatalogBrandAction(formData: FormData) {
  const accessToken = await ensureCatalogAccessToken("Sign in to manage catalog brands.");
  const baseUrl = ensureCatalogBaseUrl();
  const id = Number(formData.get("brandId"));

  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Valid brand id is required.");
  }

  const response = await fetch(`${baseUrl}/api/catalog/brand/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw await buildCatalogError(response, "Failed to delete brand.");
  }

  revalidatePath(ROUTE_PATH);
}
