import { auth } from "@/auth";
import { getServiceEndpoint } from "@/service-discovery";
import type { BrandResponse, BrandsResponse } from "@/lib/api/types/catalog";
import { buildCatalogError } from "../catalog-actions-utils";
import type {
  CatalogTaxonomyApiResponse,
  CatalogTaxonomyFilters,
  RouteSearchParams,
} from "../taxonomy-shared";
import { buildTaxonomyApiQueryString, buildTaxonomyFiltersFromSearchParamsRecord } from "../taxonomy-shared";
import CatalogBrandsClient from "./catalog-brands-client";
import { Agent as UndiciAgent, type Dispatcher } from "undici";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const allowInsecureCatalogTls = process.env.ALLOW_INSECURE_CATALOG_TLS === "true";
const insecureCatalogDispatcher: Dispatcher | undefined = allowInsecureCatalogTls
  ? new UndiciAgent({ connect: { rejectUnauthorized: false } })
  : undefined;

type CatalogBrandsSearchParams = RouteSearchParams | Promise<RouteSearchParams> | undefined;

interface CatalogBrandsPageProps {
  readonly searchParams?: CatalogBrandsSearchParams;
}

export default async function CatalogBrandsPage({ searchParams }: CatalogBrandsPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const filters = buildTaxonomyFiltersFromSearchParamsRecord(resolvedSearchParams);
  const { data, error } = await loadCatalogBrands(filters);
  return <CatalogBrandsClient data={data} loadError={error} />;
}

async function loadCatalogBrands(
  filters: CatalogTaxonomyFilters
): Promise<{ data: CatalogTaxonomyApiResponse<BrandResponse> | null; error: string | null }> {
  const session = await auth();
  if (!session?.accessToken) {
    return { data: null, error: "Sign in to load catalog brands." };
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
  const requestUrl = `${catalogApiBaseUrl}/api/catalog/brand?${queryString}`;

  try {
    const response = await fetch(requestUrl, fetchInit);
    if (!response.ok) {
      throw await createResponseError(response, "Failed to load catalog brands.");
    }

    const payload = (await response.json()) as BrandsResponse;
    const data: CatalogTaxonomyApiResponse<BrandResponse> = {
      items: payload.items,
      total: payload.total,
      page: payload.page,
      pageSize: payload.pageSize,
    };

    return { data, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load catalog brands.";
    return { data: null, error: message };
  }
}

async function createResponseError(response: Response, fallback: string) {
  return buildCatalogError(response, fallback);
}
