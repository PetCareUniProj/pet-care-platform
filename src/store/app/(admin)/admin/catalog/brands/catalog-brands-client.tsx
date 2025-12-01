"use client";

import { useCallback, useRef, useState, useTransition, type MutableRefObject } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BrandResponse } from "@/lib/api/types/catalog";
import type { CatalogTaxonomyApiResponse } from "../taxonomy-shared";
import { TAXONOMY_PAGE_SIZE_OPTIONS, TAXONOMY_SORT_OPTIONS } from "../taxonomy-shared";
import { useTaxonomyFilterForm, useTaxonomyPagination, useTaxonomyQueryFilters } from "../taxonomy-hooks";
import {
  createCatalogBrandAction,
  deleteCatalogBrandAction,
  updateCatalogBrandAction,
} from "./actions";

interface CatalogBrandsClientProps {
  readonly data: CatalogTaxonomyApiResponse<BrandResponse> | null;
  readonly loadError: string | null;
}

const ROUTE_PATH = "/admin/catalog/brands";
const selectInputClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export default function CatalogBrandsClient({ data, loadError }: CatalogBrandsClientProps) {
  const { filters, applyFilters, isNavigating } = useTaxonomyQueryFilters(ROUTE_PATH);
  const filterForm = useTaxonomyFilterForm(filters, applyFilters);
  const pagination = useTaxonomyPagination({
    filters,
    applyFilters,
    total: data?.total ?? 0,
    itemsCount: data?.items.length ?? 0,
    isLoading: isNavigating,
    hasData: Boolean(data),
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const createFormRef = useRef<HTMLFormElement | null>(null);
  const [isCreatePending, startCreateTransition] = useTransition();

  const [editTarget, setEditTarget] = useState<BrandResponse | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const editFormRef = useRef<HTMLFormElement | null>(null);
  const [isEditPending, startEditTransition] = useTransition();

  const [deleteTarget, setDeleteTarget] = useState<BrandResponse | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletePending, startDeleteTransition] = useTransition();

  const handleCreate = useCallback((formData: FormData) => {
    setCreateError(null);
    startCreateTransition(async () => {
      try {
        await createCatalogBrandAction(formData);
        createFormRef.current?.reset();
        setIsCreateModalOpen(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create brand.";
        setCreateError(message);
      }
    });
  }, []);

  const handleEdit = useCallback((formData: FormData) => {
    setEditError(null);
    startEditTransition(async () => {
      try {
        await updateCatalogBrandAction(formData);
        editFormRef.current?.reset();
        setEditTarget(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update brand.";
        setEditError(message);
      }
    });
  }, []);

  const handleDelete = useCallback((formData: FormData) => {
    setDeleteError(null);
    startDeleteTransition(async () => {
      try {
        await deleteCatalogBrandAction(formData);
        setDeleteTarget(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete brand.";
        setDeleteError(message);
      }
    });
  }, []);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Catalog · Brands</h1>
        <p className="text-muted-foreground text-sm">
          Maintain the brand taxonomy used for filtering, promotions, and analytics.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter `/api/catalog/brand` by name, sort order, and page size.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" onSubmit={filterForm.handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="brand-name">
                Name contains
              </label>
              <Input
                id="brand-name"
                name="name"
                placeholder="Search brands"
                value={filterForm.formState.name}
                onChange={(event) => filterForm.handleFieldChange("name", event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="brand-sortBy">
                Sort by
              </label>
              <select
                id="brand-sortBy"
                name="sortBy"
                value={filterForm.formState.sortBy}
                onChange={(event) => filterForm.handleFieldChange("sortBy", event.target.value)}
                className={selectInputClassName}
              >
                {TAXONOMY_SORT_OPTIONS.map((option) => (
                  <option key={option.value || "default"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="brand-pageSize">
                Items per page (max 25)
              </label>
              <select
                id="brand-pageSize"
                name="pageSize"
                value={filterForm.formState.pageSize}
                onChange={(event) => filterForm.handleFieldChange("pageSize", event.target.value)}
                className={selectInputClassName}
              >
                {TAXONOMY_PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-4 lg:flex-row lg:items-center">
              <div className="flex gap-2">
                <Button type="submit" disabled={isNavigating}>
                  Apply filters
                </Button>
                <Button type="button" variant="outline" onClick={filterForm.handleReset} disabled={isNavigating}>
                  Reset
                </Button>
              </div>
              {isNavigating ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Brands</CardTitle>
            <CardDescription>Showing {data?.items.length ?? 0} of {data?.total ?? 0} records.</CardDescription>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>Create brand</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {isNavigating ? <p className="text-sm text-muted-foreground">Loading brands…</p> : null}
          {loadError ? (
            <p className="text-sm text-destructive">{loadError}</p>
          ) : data && data.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No brands match the selected filters.</p>
          ) : data ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell>#{brand.id}</TableCell>
                    <TableCell>{brand.name}</TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditTarget(brand)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(brand)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}

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
                  <label className="text-sm" htmlFor="brandsPageInput">
                    Go to page
                  </label>
                  <Input
                    id="brandsPageInput"
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

      <CreateBrandModal
        open={isCreateModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setIsCreateModalOpen(false);
            setCreateError(null);
            createFormRef.current?.reset();
          }
        }}
        pending={isCreatePending}
        onSubmit={handleCreate}
        errorMessage={createError}
        formRef={createFormRef}
      />

      <EditBrandModal
        brand={editTarget}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditTarget(null);
            setEditError(null);
            editFormRef.current?.reset();
          }
        }}
        pending={isEditPending}
        onSubmit={handleEdit}
        errorMessage={editError}
        formRef={editFormRef}
      />

      <DeleteBrandModal
        brand={deleteTarget}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
        pending={isDeletePending}
        onSubmit={handleDelete}
        errorMessage={deleteError}
      />
    </div>
  );
}

interface CreateBrandModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly pending: boolean;
  readonly onSubmit: (formData: FormData) => void;
  readonly errorMessage: string | null;
  readonly formRef: MutableRefObject<HTMLFormElement | null>;
}

function CreateBrandModal({ open, onOpenChange, pending, onSubmit, errorMessage, formRef }: CreateBrandModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create brand</DialogTitle>
          <DialogDescription>Add a new brand to the catalog.</DialogDescription>
        </DialogHeader>
        <form action={onSubmit} ref={formRef} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="brand-name-input">
              Name
            </label>
            <Input id="brand-name-input" name="name" placeholder="e.g. Pawfect" required disabled={pending} />
          </div>
          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditBrandModalProps {
  readonly brand: BrandResponse | null;
  readonly onOpenChange: (open: boolean) => void;
  readonly pending: boolean;
  readonly onSubmit: (formData: FormData) => void;
  readonly errorMessage: string | null;
  readonly formRef: MutableRefObject<HTMLFormElement | null>;
}

function EditBrandModal({ brand, onOpenChange, pending, onSubmit, errorMessage, formRef }: EditBrandModalProps) {
  return (
    <Dialog open={Boolean(brand)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit brand</DialogTitle>
          <DialogDescription>Rename the selected brand.</DialogDescription>
        </DialogHeader>
        {brand ? (
          <form action={onSubmit} ref={formRef} className="space-y-4">
            <input type="hidden" name="brandId" value={brand.id} />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="edit-brand-name">
                Name
              </label>
              <Input id="edit-brand-name" name="name" defaultValue={brand.name} required disabled={pending} />
            </div>
            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

interface DeleteBrandModalProps {
  readonly brand: BrandResponse | null;
  readonly onOpenChange: (open: boolean) => void;
  readonly pending: boolean;
  readonly onSubmit: (formData: FormData) => void;
  readonly errorMessage: string | null;
}

function DeleteBrandModal({ brand, onOpenChange, pending, onSubmit, errorMessage }: DeleteBrandModalProps) {
  return (
    <Dialog open={Boolean(brand)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete brand</DialogTitle>
          <DialogDescription>
            Deleting a brand removes it from storefront filters. Items previously associated will lose the tag.
          </DialogDescription>
        </DialogHeader>
        {brand ? (
          <form action={onSubmit} className="space-y-4">
            <input type="hidden" name="brandId" value={brand.id} />
            <p>
              Confirm deletion of <span className="font-semibold">{brand.name}</span>?
            </p>
            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={pending}>
                {pending ? "Deleting…" : "Delete"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
