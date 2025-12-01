"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  FormEvent,
  ChangeEvent,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BrandResponse, CategoryResponse, ItemResponse } from "@/lib/api/types/catalog";
import {
  CatalogFilters,
  CatalogItemsApiResponse,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  buildFiltersFromUrlSearchParams,
  buildRouterQueryString,
  normalizePageSize,
} from "./catalog-items-shared";
import { createCatalogItemAction, deleteCatalogItemAction, updateCatalogItemAction } from "./actions";

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

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

interface CatalogItemsClientProps {
  readonly data: CatalogItemsApiResponse | null;
  readonly loadError: string | null;
}

export default function CatalogItemsClient({ data, loadError }: CatalogItemsClientProps) {
  const { filters, applyFilters, isNavigating } = useQueryLinkedFilters();
  const filterForm = useCatalogFilterForm(filters, applyFilters);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ItemResponse | null>(null);
  const createFormRef = useRef<HTMLFormElement | null>(null);
  const [isCreatePending, startCreateTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [editTarget, setEditTarget] = useState<ItemResponse | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const editFormRef = useRef<HTMLFormElement | null>(null);
  const [isEditPending, startEditTransition] = useTransition();

  const handleCreateItem = useCallback(
    (formData: FormData) => {
      setCreateError(null);
      startCreateTransition(async () => {
        try {
          await createCatalogItemAction(formData);
          createFormRef.current?.reset();
          setIsCreateModalOpen(false);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to create item.";
          setCreateError(message);
        }
      });
    },
    []
  );

  const handleEditItem = useCallback((formData: FormData) => {
    setEditError(null);
    startEditTransition(async () => {
      try {
        await updateCatalogItemAction(formData);
        editFormRef.current?.reset();
        setEditTarget(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update item.";
        setEditError(message);
      }
    });
  }, []);

  const handleDeleteItem = useCallback(
    (formData: FormData) => {
      setDeleteError(null);
      startDeleteTransition(async () => {
        try {
          await deleteCatalogItemAction(formData);
          setDeleteTarget(null);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to delete item.";
          setDeleteError(message);
        }
      });
    },
    []
  );

  const pagination = usePaginationControls({
    filters,
    applyFilters,
    total: data?.total ?? 0,
    itemsCount: data?.items.length ?? 0,
    isLoading: isNavigating,
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
        isLoading={isNavigating}
      />
      <CatalogInventoryCard
        items={data?.items ?? []}
        total={data?.total ?? 0}
        isLoading={isNavigating}
        loadError={loadError}
        pagination={pagination}
        onCreateItem={() => setIsCreateModalOpen(true)}
        onEditItem={setEditTarget}
        onDeleteItem={setDeleteTarget}
      />
      <CreateItemModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        brandOptions={data?.brands ?? []}
        categoryOptions={data?.categories ?? []}
        onSubmit={handleCreateItem}
        pending={isCreatePending}
        errorMessage={createError}
        formRef={createFormRef}
      />
      <EditItemModal
        item={editTarget}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditTarget(null);
            setEditError(null);
          }
        }}
        brandOptions={data?.brands ?? []}
        categoryOptions={data?.categories ?? []}
        onSubmit={handleEditItem}
        pending={isEditPending}
        errorMessage={editError}
        formRef={editFormRef}
      />
      <DeleteItemModal
        item={deleteTarget}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
        onSubmit={handleDeleteItem}
        pending={isDeletePending}
        errorMessage={deleteError}
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
              {PAGE_SIZE_OPTIONS.map((size) => (
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
  readonly onCreateItem: () => void;
  readonly onEditItem: (item: ItemResponse) => void;
  readonly onDeleteItem: (item: ItemResponse) => void;
};

function CatalogInventoryCard({ items, total, isLoading, loadError, pagination, onCreateItem, onEditItem, onDeleteItem }: CatalogInventoryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>
            Mirrors GET `/api/items` with filters and pagination. Showing {items.length} of {total} records.
          </CardDescription>
        </div>
        <Button onClick={onCreateItem}>Create item</Button>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditItem(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteItem(item)}
                        >
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

interface CatalogItemModalProps {
  readonly mode: "create" | "edit";
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly brandOptions: BrandResponse[];
  readonly categoryOptions: CategoryResponse[];
  readonly onSubmit: (formData: FormData) => void;
  readonly pending: boolean;
  readonly errorMessage: string | null;
  readonly formRef: MutableRefObject<HTMLFormElement | null>;
  readonly item?: ItemResponse | null;
}

function CatalogItemModal({
  mode,
  open,
  onOpenChange,
  brandOptions,
  categoryOptions,
  onSubmit,
  pending,
  errorMessage,
  formRef,
  item,
}: CatalogItemModalProps) {
  const isEdit = mode === "edit";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit catalog item" : "Create catalog item"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the catalog record and save your changes."
              : "Provide item details and submit to create a new SKU."}
          </DialogDescription>
        </DialogHeader>
        <form
          key={item?.id ?? mode}
          ref={formRef}
          className="space-y-4"
          action={onSubmit}
        >
          {isEdit ? <input type="hidden" name="itemId" value={item?.id ?? ""} /> : null}
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Slug" required>
              <Input
                name="slug"
                placeholder="example-item"
                required
                disabled={pending}
                defaultValue={item?.slug}
              />
            </FormField>
            <FormField label="Name" required>
              <Input
                name="name"
                placeholder="Example Item"
                required
                disabled={pending}
                defaultValue={item?.name}
              />
            </FormField>
            <FormField label="Price" required>
              <Input
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="19.99"
                required
                disabled={pending}
                defaultValue={item?.price}
              />
            </FormField>
            <FormField label="Brand" required>
              <select
                name="catalogBrandId"
                className={selectInputClassName}
                required
                disabled={pending}
                defaultValue={item?.catalogBrandId ?? ""}
              >
                <option value="">Select brand</option>
                {brandOptions.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Available stock" required>
              <Input
                name="availableStock"
                type="number"
                min="0"
                defaultValue={item?.availableStock ?? 0}
                disabled={pending}
              />
            </FormField>
            <FormField label="Restock threshold" required>
              <Input
                name="restockThreshold"
                type="number"
                min="0"
                defaultValue={item?.restockThreshold ?? 0}
                disabled={pending}
              />
            </FormField>
            <FormField label="Max stock threshold" required>
              <Input
                name="maxStockThreshold"
                type="number"
                min="0"
                defaultValue={item?.maxStockThreshold ?? 0}
                disabled={pending}
              />
            </FormField>
            <FormField label="Picture file name">
              <Input
                name="pictureFileName"
                placeholder="item.png"
                disabled={pending}
                defaultValue={item?.pictureFileName ?? ""}
              />
            </FormField>
          </div>
          <FormField label="Description">
            <Textarea
              name="description"
              placeholder="Optional description"
              rows={3}
              disabled={pending}
              defaultValue={item?.description ?? ""}
            />
          </FormField>
          <FormField label="Categories" required helperText="Hold Ctrl/Cmd to select multiple categories.">
            <select
              name="categoryIds"
              multiple
              className={`${selectInputClassName} h-32`}
              required
              disabled={pending}
              defaultValue={item?.categoryIds.map((categoryId) => String(categoryId))}
            >
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>
          <div className="flex items-center gap-2">
            <input
              id={`onReorder-${mode}`}
              name="onReorder"
              type="checkbox"
              disabled={pending}
              defaultChecked={item?.onReorder ?? false}
            />
            <label htmlFor={`onReorder-${mode}`} className="text-sm">
              Item currently on reorder
            </label>
          </div>
          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save changes" : "Create item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type CreateItemModalProps = Omit<CatalogItemModalProps, "mode" | "item">;

function CreateItemModal(props: CreateItemModalProps) {
  return <CatalogItemModal mode="create" {...props} />;
}

interface EditItemModalProps extends Omit<CatalogItemModalProps, "mode" | "item" | "open"> {
  readonly item: ItemResponse | null;
}

function EditItemModal({ item, ...rest }: EditItemModalProps) {
  return <CatalogItemModal mode="edit" item={item} open={Boolean(item)} {...rest} />;
}

interface DeleteItemModalProps {
  readonly item: ItemResponse | null;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSubmit: (formData: FormData) => void;
  readonly pending: boolean;
  readonly errorMessage: string | null;
}

function DeleteItemModal({ item, onOpenChange, onSubmit, pending, errorMessage }: DeleteItemModalProps) {
  const open = item !== null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete catalog item</DialogTitle>
          <DialogDescription>Deleting an item removes it from the admin catalog feed.</DialogDescription>
        </DialogHeader>
        {item ? (
          <form className="space-y-4" action={onSubmit}>
            <input type="hidden" name="itemId" value={item.id} />
            <p className="text-sm text-muted-foreground">
              Confirm deletion of <strong>{item.name}</strong> (SKU {item.slug}). This action cannot be undone.
            </p>
            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={pending}>
                {pending ? "Deleting…" : "Delete item"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

interface FormFieldProps {
  readonly label: string;
  readonly children: ReactNode;
  readonly required?: boolean;
  readonly helperText?: string;
}

function FormField({ label, children, required, helperText }: FormFieldProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      <span>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      {children}
      {helperText ? <span className="text-xs font-normal text-muted-foreground">{helperText}</span> : null}
    </label>
  );
}

function useQueryLinkedFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const [isNavigating, startTransition] = useTransition();

  const filters = useMemo<CatalogFilters>(() => {
    const params = new URLSearchParams(searchParamsKey);
    return buildFiltersFromUrlSearchParams(params);
  }, [searchParamsKey]);

  const applyFilters = useCallback(
    (nextFilters: CatalogFilters) => {
      const queryString = buildRouterQueryString(nextFilters);
      const nextUrl = queryString ? `/admin/catalog/items?${queryString}` : "/admin/catalog/items";
      startTransition(() => {
        router.replace(nextUrl, { scroll: false });
      });
    },
    [router]
  );

  return { filters, applyFilters, isNavigating };
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Sync form controls with URL-driven filters after navigation completes.
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Keep pagination input aligned with router state without remounting the control.
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

function formatPrice(value: number) {
  return currencyFormatter.format(value);
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
