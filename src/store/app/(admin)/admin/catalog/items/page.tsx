import { auth } from "@/auth";
import { getServiceEndpoint } from "@/service-discovery";
import type { BrandsResponse, CategoriesResponse, ItemsResponse } from "@/lib/api/types/catalog";
import { Agent as UndiciAgent, type Dispatcher } from "undici";
import CatalogItemsClient from "./catalog-items-client";
import {
  CatalogFilters,
  CatalogItemsApiResponse,
  MAX_PAGE_SIZE,
  buildApiItemsQueryString,
  buildFiltersFromSearchParamsRecord,
  RouteSearchParams,
} from "./catalog-items-shared";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const allowInsecureCatalogTls = process.env.ALLOW_INSECURE_CATALOG_TLS === "true";
const insecureCatalogDispatcher: Dispatcher | undefined = allowInsecureCatalogTls
  ? new UndiciAgent({ connect: { rejectUnauthorized: false } })
  : undefined;

type CatalogItemsPageSearchParams = RouteSearchParams | Promise<RouteSearchParams> | undefined;

interface CatalogItemsPageProps {
  readonly searchParams?: CatalogItemsPageSearchParams;
}

export default async function CatalogItemsPage({ searchParams }: CatalogItemsPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const filters = buildFiltersFromSearchParamsRecord(resolvedSearchParams);
  const { data, error } = await loadCatalogData(filters);
  return <CatalogItemsClient data={data} loadError={error} />;
}

async function loadCatalogData(filters: CatalogFilters): Promise<{ data: CatalogItemsApiResponse | null; error: string | null }> {
  const session = await auth();
  if (!session?.accessToken) {
    return { data: null, error: "Sign in to load catalog items." };
  }

  const catalogApiBaseUrl = getServiceEndpoint("catalog-api");
  if (!catalogApiBaseUrl) {
    return {
      data: null,
      error: "Catalog endpoint not found. Start Aspire or ensure catalog-api is registered.",
    };
  }

  const headers = new Headers({ Accept: "application/json" });
  headers.set("Authorization", `Bearer ${session.accessToken}`);

  type ExtendedRequestInit = RequestInit & { dispatcher?: Dispatcher };

  const commonFetchInit: ExtendedRequestInit = {
    method: "GET",
    headers,
    cache: "no-store",
    ...(insecureCatalogDispatcher ? { dispatcher: insecureCatalogDispatcher } : {}),
  };

  try {
    const taxonomyQuery = new URLSearchParams({ PageSize: String(MAX_PAGE_SIZE), Page: "1", SortBy: "name" }).toString();
    const itemsQuery = buildApiItemsQueryString(filters);
    const itemsUrl = `${catalogApiBaseUrl}/api/items?${itemsQuery}`;
    const brandsUrl = `${catalogApiBaseUrl}/api/brand?${taxonomyQuery}`;
    const categoriesUrl = `${catalogApiBaseUrl}/api/category?${taxonomyQuery}`;
    
    const [itemsResponse, brandsResponse, categoriesResponse] = await Promise.all([
      fetch(itemsUrl, commonFetchInit),
      fetch(brandsUrl, commonFetchInit),
      fetch(categoriesUrl, commonFetchInit),
    ]);

    if (!itemsResponse.ok) {
      throw await createResponseError(itemsResponse, "Failed to load catalog items.");
    }

    if (!brandsResponse.ok) {
      throw await createResponseError(brandsResponse, "Failed to load catalog brands.");
    }

    if (!categoriesResponse.ok) {
      throw await createResponseError(categoriesResponse, "Failed to load catalog categories.");
    }

    const itemsPayload = (await itemsResponse.json()) as ItemsResponse;
    const brandsPayload = (await brandsResponse.json()) as BrandsResponse;
    const categoriesPayload = (await categoriesResponse.json()) as CategoriesResponse;

    return {
      data: {
        items: itemsPayload.items,
        total: itemsPayload.total,
        page: itemsPayload.page,
        pageSize: itemsPayload.pageSize,
        brands: brandsPayload.items ?? [],
        categories: categoriesPayload.items ?? [],
      },
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load catalog items.";
    return { data: null, error: message };
  }
}

async function createResponseError(response: Response, fallback: string) {
  const message = await response.text();
  return new Error(message || fallback);
}
