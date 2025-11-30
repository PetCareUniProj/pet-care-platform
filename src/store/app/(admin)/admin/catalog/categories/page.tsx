import { auth } from "@/auth";
import { getServiceEndpoint } from "@/service-discovery";
import type { CategoryResponse, CategoriesResponse } from "@/lib/api/types/catalog";
import { buildCatalogError } from "../catalog-actions-utils";
import type {
  CatalogTaxonomyApiResponse,
  CatalogTaxonomyFilters,
  RouteSearchParams,
} from "../taxonomy-shared";
import { buildTaxonomyApiQueryString, buildTaxonomyFiltersFromSearchParamsRecord } from "../taxonomy-shared";
import CatalogCategoriesClient from "./catalog-categories-client";
import { Agent as UndiciAgent, type Dispatcher } from "undici";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const allowInsecureCatalogTls = process.env.ALLOW_INSECURE_CATALOG_TLS === "true";
const insecureCatalogDispatcher: Dispatcher | undefined = allowInsecureCatalogTls
  ? new UndiciAgent({ connect: { rejectUnauthorized: false } })
  : undefined;

type CatalogCategoriesSearchParams = RouteSearchParams | Promise<RouteSearchParams> | undefined;

interface CatalogCategoriesPageProps {
  readonly searchParams?: CatalogCategoriesSearchParams;
}

export default async function CatalogCategoriesPage({ searchParams }: CatalogCategoriesPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const filters = buildTaxonomyFiltersFromSearchParamsRecord(resolvedSearchParams);
  const { data, error } = await loadCatalogCategories(filters);
  return <CatalogCategoriesClient data={data} loadError={error} />;
}

async function loadCatalogCategories(
  filters: CatalogTaxonomyFilters
): Promise<{ data: CatalogTaxonomyApiResponse<CategoryResponse> | null; error: string | null }> {
  const session = await auth();
  if (!session?.accessToken) {
    return { data: null, error: "Sign in to load catalog categories." };
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

  const fetchInit: ExtendedRequestInit = {
    method: "GET",
    headers,
    cache: "no-store",
    ...(insecureCatalogDispatcher ? { dispatcher: insecureCatalogDispatcher } : {}),
  };

  const queryString = buildTaxonomyApiQueryString(filters);
  const requestUrl = `${catalogApiBaseUrl}/api/catalog/category?${queryString}`;

  try {
    const response = await fetch(requestUrl, fetchInit);
    if (!response.ok) {
      throw await createResponseError(response, "Failed to load catalog categories.");
    }

    const payload = (await response.json()) as CategoriesResponse;
    const data: CatalogTaxonomyApiResponse<CategoryResponse> = {
      items: payload.items,
      total: payload.total,
      page: payload.page,
      pageSize: payload.pageSize,
    };

    return { data, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load catalog categories.";
    return { data: null, error: message };
  }
}

async function createResponseError(response: Response, fallback: string) {
  return buildCatalogError(response, fallback);
}
