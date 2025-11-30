"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  DEFAULT_PAGE_SIZE,
  CatalogTaxonomyFilters,
  buildTaxonomyFiltersFromUrlSearchParams,
  buildTaxonomyRouterQueryString,
  normalizePageSize,
} from "./taxonomy-shared";

export function useTaxonomyQueryFilters(routePath: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const [isNavigating, startTransition] = useTransition();

  const filters = useMemo<CatalogTaxonomyFilters>(() => {
    const params = new URLSearchParams(searchParamsKey);
    return buildTaxonomyFiltersFromUrlSearchParams(params);
  }, [searchParamsKey]);

  const applyFilters = useCallback(
    (nextFilters: CatalogTaxonomyFilters) => {
      const queryString = buildTaxonomyRouterQueryString(nextFilters);
      const nextUrl = queryString ? `${routePath}?${queryString}` : routePath;
      startTransition(() => {
        router.replace(nextUrl, { scroll: false });
      });
    },
    [routePath, router]
  );

  return { filters, applyFilters, isNavigating };
}

export function useTaxonomyFilterForm(filters: CatalogTaxonomyFilters, applyFilters: (filters: CatalogTaxonomyFilters) => void) {
  const [formState, setFormState] = useState({
    name: filters.name ?? "",
    sortBy: filters.sortBy ?? "",
    pageSize: String(filters.pageSize),
  });

  useEffect(() => {
    setFormState({
      name: filters.name ?? "",
      sortBy: filters.sortBy ?? "",
      pageSize: String(filters.pageSize),
    });
  }, [filters]);

  const handleFieldChange = useCallback((field: "name" | "sortBy" | "pageSize", value: string) => {
    setFormState((state) => ({
      ...state,
      [field]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      applyFilters({
        name: formState.name.trim() || undefined,
        sortBy: formState.sortBy || undefined,
        page: 1,
        pageSize: normalizePageSize(Number(formState.pageSize)),
      });
    },
    [applyFilters, formState.name, formState.pageSize, formState.sortBy]
  );

  const handleReset = useCallback(() => {
    setFormState({ name: "", sortBy: "", pageSize: String(DEFAULT_PAGE_SIZE) });
    applyFilters({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  }, [applyFilters]);

  return { formState, handleFieldChange, handleSubmit, handleReset };
}

interface PaginationOptions {
  readonly filters: CatalogTaxonomyFilters;
  readonly applyFilters: (filters: CatalogTaxonomyFilters) => void;
  readonly total: number;
  readonly itemsCount: number;
  readonly isLoading: boolean;
  readonly hasData: boolean;
}

export function useTaxonomyPagination(options: PaginationOptions) {
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
        sortBy: filters.sortBy,
        page: normalizedPage,
        pageSize: filters.pageSize,
      });
    },
    [applyFilters, filters.name, filters.pageSize, filters.sortBy, totalPages]
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
