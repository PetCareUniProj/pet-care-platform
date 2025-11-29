"use client";

import { useCallback, useEffect, useMemo, useState, FormEvent, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type {
  BrandResponse,
  BrandsResponse,
  CategoryResponse,
  CategoriesResponse,
  ItemResponse,
  ItemsResponse,
} from "@/lib/api/types/catalog";

interface CatalogItemsApiResponse {
  readonly items: ItemResponse[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly brands: BrandResponse[];
  readonly categories: CategoryResponse[];
}

interface CatalogFilters {
  readonly name?: string;
  readonly brandId?: number;
  readonly categoryId?: number;
  readonly sortBy?: string;
  readonly page: number;
  readonly pageSize: number;
}

interface CatalogFilterFormState {
  readonly name: string;
  readonly brandId: string;
  readonly categoryId: string;
  readonly sortBy: string;
  readonly pageSize: string;
}

interface PaginationState {
  readonly summary: string;
  readonly totalPages: number;
  readonly pageInputValue: string;
  readonly currentPage: number;
  readonly canGoPrev: boolean;
  readonly canGoNext: boolean;
  readonly paginationDisabled: boolean;
  readonly handlePrevPage: () => void;
  readonly handleNextPage: () => void;
  readonly handlePageInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly handlePageInputSubmit: (event: FormEvent<HTMLFormElement>) => void;
  readonly isVisible: boolean;
}

type CatalogFilterField = keyof CatalogFilterFormState;

const selectInputClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const sortOptions = [
  { value: "", label: "Default order" },
  { value: "name", label: "Name (A–Z)" },
  { value: "-name", label: "Name (Z–A)" },
  { value: "price", label: "Price (low → high)" },
  { value: "-price", label: "Price (high → low)" },
];

const DEFAULT_PAGE_SIZE = 20;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 25;
const pageSizeOptions = Array.from({ length: MAX_PAGE_SIZE }, (_, index) => index + 1);

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const catalogApiBaseUrl = process.env.NEXT_PUBLIC_CATALOG_API_BASE_URL;

export default function CatalogItemsClient() {
  const { filters, applyFilters } = useQueryLinkedFilters();
  const { data, isLoading, loadError } = useCatalogData(filters);
  const filterForm = useCatalogFilterForm(filters, applyFilters);
  const pagination = usePaginationControls({
    filters,
    applyFilters,
    total: data?.total ?? 0,
    itemsCount: data?.items.length ?? 0,
    isLoading,
    hasData: data !== null,
  });

  return (
    <div className="space-y-4">
      <PageIntro />
      <CatalogFiltersCard
        formState={filterForm.formState}
        onFieldChange={filterForm.handleFieldChange}
        onSubmit={filterForm.handleSubmit}
        onReset={filterForm.handleReset}
        brandOptions={data?.brands ?? []}
        categoryOptions={data?.categories ?? []}
        isLoading={isLoading}
      />
      <CatalogInventoryCard
        items={data?.items ?? []}
        total={data?.total ?? 0}
        isLoading={isLoading}
        loadError={loadError}
        pagination={pagination}
      />
    </div>
  );
}

function PageIntro() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Catalog · Items</h1>
      <p className="text-muted-foreground text-sm">
        Create, update, or retire SKUs. Only admins reach the protected Catalog endpoints.
      </p>
    </div>
  );
}

type CatalogFiltersCardProps = {
  readonly formState: CatalogFilterFormState;
  readonly onFieldChange: (field: CatalogFilterField, value: string) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  readonly onReset: () => void;
  readonly brandOptions: BrandResponse[];
  readonly categoryOptions: CategoryResponse[];
  readonly isLoading: boolean;
};

function CatalogFiltersCard({
  formState,
  onFieldChange,
  onSubmit,
  onReset,
  brandOptions,
  categoryOptions,
  isLoading,
}: CatalogFiltersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>Filter the `/api/items` feed by text, brand, category, sort order, and page size.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-5" onSubmit={onSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="name">
              Name
            </label>
            <Input
              id="name"
              name="name"
              placeholder="Search by name"
              value={formState.name}
              onChange={(event) => onFieldChange("name", event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="brandId">
              Brand
            </label>
            <select
              id="brandId"
              name="brandId"
              value={formState.brandId}
              onChange={(event) => onFieldChange("brandId", event.target.value)}
              className={selectInputClassName}
            >
              <option value="">All brands</option>
              {brandOptions.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="categoryId">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formState.categoryId}
              onChange={(event) => onFieldChange("categoryId", event.target.value)}
              className={selectInputClassName}
            >
              <option value="">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="sortBy">
              Sort by
            </label>
            <select
              id="sortBy"
              name="sortBy"
              value={formState.sortBy}
              onChange={(event) => onFieldChange("sortBy", event.target.value)}
              className={selectInputClassName}
            >
              {sortOptions.map((option) => (
                <option key={option.value || "default"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="pageSize">
              Items per page
            </label>
            <select
              id="pageSize"
              name="pageSize"
              value={formState.pageSize}
              onChange={(event) => onFieldChange("pageSize", event.target.value)}
              className={selectInputClassName}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-5 lg:flex-row lg:items-center">
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                Apply filters
              </Button>
              <Button type="button" variant="outline" onClick={onReset} disabled={isLoading}>
                Reset
              </Button>
            </div>
            {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

type CatalogInventoryCardProps = {
  readonly items: ItemResponse[];
  readonly total: number;
  readonly isLoading: boolean;
  readonly loadError: string | null;
  readonly pagination: PaginationState;
};

function CatalogInventoryCard({ items, total, isLoading, loadError, pagination }: CatalogInventoryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>
            Mirrors GET `/api/items` with filters and pagination. Showing {items.length} of {total} records.
          </CardDescription>
        </div>
        <Button>Create item</Button>
      </CardHeader>
      <CardContent>
        {isLoading ? <p className="text-sm text-muted-foreground">Loading inventory…</p> : null}
        {loadError ? (
          <p className="text-sm text-destructive">{loadError}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No catalog items match the selected filters.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const status = getInventoryStatus(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.slug}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.availableStock}</TableCell>
                    <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        {pagination.isVisible ? (
          <div className="mt-4 flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              {pagination.summary} · Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={pagination.handlePrevPage}
                disabled={!pagination.canGoPrev || pagination.paginationDisabled}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={pagination.handleNextPage}
                disabled={!pagination.canGoNext || pagination.paginationDisabled}
              >
                Next
              </Button>
              <form className="flex items-center gap-2" onSubmit={pagination.handlePageInputSubmit}>
                <label className="text-sm" htmlFor="pageInput">
                  Go to page
                </label>
                <Input
                  id="pageInput"
                  name="page"
                  type="number"
                  min={1}
                  max={pagination.totalPages}
                  value={pagination.pageInputValue}
                  onChange={pagination.handlePageInputChange}
                  className="w-20"
                />
                <Button type="submit" size="sm" disabled={pagination.paginationDisabled}>
                  Go
                </Button>
              </form>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function useQueryLinkedFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();

  const filters = useMemo<CatalogFilters>(() => {
    const params = new URLSearchParams(searchParamsKey);
    const parsedPage = parseNumber(params.get("page")) ?? 1;
    const parsedPageSize = parseNumber(params.get("pageSize")) ?? DEFAULT_PAGE_SIZE;
    return {
      name: params.get("name") ?? undefined,
      brandId: parseNumber(params.get("brandId")),
      categoryId: parseNumber(params.get("categoryId")),
      sortBy: params.get("sortBy") ?? undefined,
      page: Math.max(parsedPage, 1),
      pageSize: normalizePageSize(parsedPageSize),
    };
  }, [searchParamsKey]);

  const applyFilters = useCallback(
    (nextFilters: CatalogFilters) => {
      const queryString = buildRouterQueryString(nextFilters);
      const nextUrl = queryString ? `/admin/catalog/items?${queryString}` : "/admin/catalog/items";
      router.replace(nextUrl, { scroll: false });
    },
    [router]
  );

  return { filters, applyFilters };
}

function useCatalogFilterForm(filters: CatalogFilters, applyFilters: (filters: CatalogFilters) => void) {
  const [formState, setFormState] = useState<CatalogFilterFormState>({
    name: filters.name ?? "",
    brandId: filters.brandId ? String(filters.brandId) : "",
    categoryId: filters.categoryId ? String(filters.categoryId) : "",
    sortBy: filters.sortBy ?? "",
    pageSize: String(filters.pageSize),
  });

  useEffect(() => {
    setFormState({
      name: filters.name ?? "",
      brandId: filters.brandId ? String(filters.brandId) : "",
      categoryId: filters.categoryId ? String(filters.categoryId) : "",
      sortBy: filters.sortBy ?? "",
      pageSize: String(filters.pageSize),
    });
  }, [filters]);

  const handleFieldChange = useCallback((field: CatalogFilterField, value: string) => {
    setFormState((state) => ({
      ...state,
      [field]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const normalizedPageSize = normalizePageSize(Number(formState.pageSize));
      applyFilters({
        name: formState.name.trim() || undefined,
        brandId: formState.brandId ? Number(formState.brandId) : undefined,
        categoryId: formState.categoryId ? Number(formState.categoryId) : undefined,
        sortBy: formState.sortBy || undefined,
        page: 1,
        pageSize: normalizedPageSize,
      });
    },
    [applyFilters, formState]
  );

  const handleReset = useCallback(() => {
    setFormState({ name: "", brandId: "", categoryId: "", sortBy: "", pageSize: String(DEFAULT_PAGE_SIZE) });
    applyFilters({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  }, [applyFilters]);

  return { formState, handleFieldChange, handleSubmit, handleReset };
}

function useCatalogData(filters: CatalogFilters) {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = (session?.accessToken as string | undefined) ?? undefined;
  const [data, setData] = useState<CatalogItemsApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchData() {
      if (sessionStatus === "loading") {
        return;
      }

      if (sessionStatus !== "authenticated") {
        setLoadError("Sign in to load catalog items.");
        setData(null);
        setIsLoading(false);
        return;
      }

      if (!catalogApiBaseUrl) {
        setLoadError("Missing NEXT_PUBLIC_CATALOG_API_BASE_URL. Start Aspire or configure the variable.");
        setData(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const headers = new Headers({ Accept: "application/json" });
        if (accessToken) {
          headers.set("Authorization", `Bearer ${accessToken}`);
        }

        const taxonomyQuery = new URLSearchParams({ PageSize: String(MAX_PAGE_SIZE), Page: "1", SortBy: "name" }).toString();
        const itemsQuery = buildApiItemsQueryString(filters);
        const itemsUrl = `${catalogApiBaseUrl}/api/items?${itemsQuery}`;
        const brandsUrl = `${catalogApiBaseUrl}/api/brand?${taxonomyQuery}`;
        const categoriesUrl = `${catalogApiBaseUrl}/api/category?${taxonomyQuery}`;

        const [itemsResponse, brandsResponse, categoriesResponse] = await Promise.all([
          fetch(itemsUrl, { method: "GET", headers, cache: "no-store", signal: abortController.signal }),
          fetch(brandsUrl, { method: "GET", headers, cache: "no-store", signal: abortController.signal }),
          fetch(categoriesUrl, { method: "GET", headers, cache: "no-store", signal: abortController.signal }),
        ]);

        if (!itemsResponse.ok) {
          const message = await itemsResponse.text();
          throw new Error(message || "Failed to load catalog items.");
        }

        if (!brandsResponse.ok) {
          const message = await brandsResponse.text();
          throw new Error(message || "Failed to load catalog brands.");
        }

        if (!categoriesResponse.ok) {
          const message = await categoriesResponse.text();
          throw new Error(message || "Failed to load catalog categories.");
        }

        const itemsPayload = (await itemsResponse.json()) as ItemsResponse;
        const brandsPayload = (await brandsResponse.json()) as BrandsResponse;
        const categoriesPayload = (await categoriesResponse.json()) as CategoriesResponse;

        if (!abortController.signal.aborted) {
          setData({
            items: itemsPayload.items,
            total: itemsPayload.total,
            page: itemsPayload.page,
            pageSize: itemsPayload.pageSize,
            brands: brandsPayload.items ?? [],
            categories: categoriesPayload.items ?? [],
          });
          setLoadError(null);
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        const message = error instanceof Error ? error.message : "Failed to load catalog items.";
        setLoadError(message);
        setData(null);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [accessToken, filters, sessionStatus]);

  return { data, isLoading, loadError };
}

interface PaginationOptions {
  readonly filters: CatalogFilters;
  readonly applyFilters: (filters: CatalogFilters) => void;
  readonly total: number;
  readonly itemsCount: number;
  readonly isLoading: boolean;
  readonly hasData: boolean;
}

function usePaginationControls(options: PaginationOptions): PaginationState {
  const { filters, applyFilters, total, itemsCount, isLoading, hasData } = options;
  const [pageInputValue, setPageInputValue] = useState<string>(String(filters.page));

  useEffect(() => {
    setPageInputValue(String(filters.page));
  }, [filters.page]);

  const totalPages = Math.max(1, Math.ceil(total / Math.max(filters.pageSize, 1)));
  const showingStart = hasData && itemsCount > 0 ? (filters.page - 1) * filters.pageSize + 1 : 0;
  const showingEnd = hasData && itemsCount > 0 ? Math.min(showingStart + itemsCount - 1, total) : 0;
  const summary = hasData && itemsCount > 0 ? `Showing ${showingStart}–${showingEnd} of ${total}` : "No records to display.";
  const canGoPrev = filters.page > 1;
  const canGoNext = filters.page < totalPages;
  const paginationDisabled = isLoading || !hasData;

  const goToPage = useCallback(
    (pageNumber: number) => {
      const normalizedPage = Math.min(Math.max(pageNumber, 1), totalPages);
      applyFilters({
        name: filters.name,
        brandId: filters.brandId,
        categoryId: filters.categoryId,
        sortBy: filters.sortBy,
        page: normalizedPage,
        pageSize: filters.pageSize,
      });
    },
    [applyFilters, filters, totalPages]
  );

  const handlePageInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(event.target.value);
  }, []);

  const handlePageInputSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (paginationDisabled) {
        return;
      }
      const parsed = Number(pageInputValue);
      if (!Number.isFinite(parsed)) {
        return;
      }
      goToPage(parsed);
    },
    [goToPage, pageInputValue, paginationDisabled]
  );

  return {
    summary,
    totalPages,
    pageInputValue,
    currentPage: filters.page,
    canGoPrev,
    canGoNext,
    paginationDisabled,
    handlePrevPage: () => goToPage(filters.page - 1),
    handleNextPage: () => goToPage(filters.page + 1),
    handlePageInputChange,
    handlePageInputSubmit,
    isVisible: hasData,
  };
}

function parseNumber(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function formatPrice(value: number) {
  return currencyFormatter.format(value);
}

function buildRouterQueryString(filters: CatalogFilters) {
  const query = new URLSearchParams();
  if (filters.name) query.set("name", filters.name);
  if (filters.brandId) query.set("brandId", filters.brandId.toString());
  if (filters.categoryId) query.set("categoryId", filters.categoryId.toString());
  if (filters.sortBy) query.set("sortBy", filters.sortBy);
  if (filters.page > 1) query.set("page", filters.page.toString());
  if (filters.pageSize !== DEFAULT_PAGE_SIZE) query.set("pageSize", filters.pageSize.toString());
  return query.toString();
}

function buildApiItemsQueryString(filters: CatalogFilters) {
  const query = new URLSearchParams();
  if (filters.name) query.set("Name", filters.name);
  if (filters.brandId) query.set("BrandId", filters.brandId.toString());
  if (filters.categoryId) query.set("CategoryId", filters.categoryId.toString());
  if (filters.sortBy) query.set("SortBy", filters.sortBy);
  query.set("Page", filters.page.toString());
  query.set("PageSize", filters.pageSize.toString());
  return query.toString();
}

function getInventoryStatus(item: ItemResponse) {
  if (item.availableStock === 0) {
    return { label: "Out of stock", variant: "destructive" as const };
  }

  if (item.availableStock <= item.restockThreshold) {
    return { label: "Low stock", variant: "destructive" as const };
  }

  if (item.onReorder) {
    return { label: "On reorder", variant: "outline" as const };
  }

  return { label: "Active", variant: "secondary" as const };
}

function normalizePageSize(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(Math.max(value ?? DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE), MAX_PAGE_SIZE);
}
