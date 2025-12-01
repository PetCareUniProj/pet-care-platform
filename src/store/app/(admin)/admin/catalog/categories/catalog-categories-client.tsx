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
import type { CategoryResponse } from "@/lib/api/types/catalog";
import type { CatalogTaxonomyApiResponse } from "../taxonomy-shared";
import { TAXONOMY_PAGE_SIZE_OPTIONS, TAXONOMY_SORT_OPTIONS } from "../taxonomy-shared";
import {
  useTaxonomyFilterForm,
  useTaxonomyPagination,
  useTaxonomyQueryFilters,
} from "../taxonomy-hooks";
import {
  createCatalogCategoryAction,
  deleteCatalogCategoryAction,
  updateCatalogCategoryAction,
} from "./actions";

interface CatalogCategoriesClientProps {
  readonly data: CatalogTaxonomyApiResponse<CategoryResponse> | null;
  readonly loadError: string | null;
}

const ROUTE_PATH = "/admin/catalog/categories";
const selectInputClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export default function CatalogCategoriesClient({ data, loadError }: CatalogCategoriesClientProps) {
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

  const [editTarget, setEditTarget] = useState<CategoryResponse | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const editFormRef = useRef<HTMLFormElement | null>(null);
  const [isEditPending, startEditTransition] = useTransition();

  const [deleteTarget, setDeleteTarget] = useState<CategoryResponse | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletePending, startDeleteTransition] = useTransition();

  const handleCreate = useCallback((formData: FormData) => {
    setCreateError(null);
    startCreateTransition(async () => {
      try {
        await createCatalogCategoryAction(formData);
        createFormRef.current?.reset();
        setIsCreateModalOpen(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create category.";
        setCreateError(message);
      }
    });
  }, []);

  const handleEdit = useCallback((formData: FormData) => {
    setEditError(null);
    startEditTransition(async () => {
      try {
        await updateCatalogCategoryAction(formData);
        editFormRef.current?.reset();
        setEditTarget(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update category.";
        setEditError(message);
      }
    });
  }, []);

  const handleDelete = useCallback((formData: FormData) => {
    setDeleteError(null);
    startDeleteTransition(async () => {
      try {
        await deleteCatalogCategoryAction(formData);
        setDeleteTarget(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete category.";
        setDeleteError(message);
      }
    });
  }, []);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Catalog · Categories</h1>
        <p className="text-muted-foreground text-sm">
          Manage storefront taxonomy that powers filtering and curated collections.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter `/api/catalog/category` by name, sort order, and page size.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" onSubmit={filterForm.handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="name">
                Name contains
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Search categories"
                value={filterForm.formState.name}
                onChange={(event) => filterForm.handleFieldChange("name", event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="sortBy">
                Sort by
              </label>
              <select
                id="sortBy"
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
              <label className="text-sm font-medium" htmlFor="pageSize">
                Items per page (max 25)
              </label>
              <select
                id="pageSize"
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
            <CardTitle>Categories</CardTitle>
            <CardDescription>Showing {data?.items.length ?? 0} of {data?.total ?? 0} records.</CardDescription>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>Create category</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {isNavigating ? <p className="text-sm text-muted-foreground">Loading categories…</p> : null}
          {loadError ? (
            <p className="text-sm text-destructive">{loadError}</p>
          ) : data && data.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories match the selected filters.</p>
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
                {data.items.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>#{category.id}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditTarget(category)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(category)}>
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
                  <label className="text-sm" htmlFor="categoriesPageInput">
                    Go to page
                  </label>
                  <Input
                    id="categoriesPageInput"
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

      <CreateCategoryModal
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

      <EditCategoryModal
        category={editTarget}
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

      <DeleteCategoryModal
        category={deleteTarget}
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

interface CreateCategoryModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly pending: boolean;
  readonly onSubmit: (formData: FormData) => void;
  readonly errorMessage: string | null;
  readonly formRef: MutableRefObject<HTMLFormElement | null>;
}

function CreateCategoryModal({ open, onOpenChange, pending, onSubmit, errorMessage, formRef }: CreateCategoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create category</DialogTitle>
          <DialogDescription>Add a new category to the catalog.</DialogDescription>
        </DialogHeader>
        <form action={onSubmit} ref={formRef} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="category-name">
              Name
            </label>
            <Input id="category-name" name="name" placeholder="e.g. Furniture" required disabled={pending} />
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

interface EditCategoryModalProps {
  readonly category: CategoryResponse | null;
  readonly onOpenChange: (open: boolean) => void;
  readonly pending: boolean;
  readonly onSubmit: (formData: FormData) => void;
  readonly errorMessage: string | null;
  readonly formRef: MutableRefObject<HTMLFormElement | null>;
}

function EditCategoryModal({ category, onOpenChange, pending, onSubmit, errorMessage, formRef }: EditCategoryModalProps) {
  return (
    <Dialog open={Boolean(category)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit category</DialogTitle>
          <DialogDescription>Rename the selected category.</DialogDescription>
        </DialogHeader>
        {category ? (
          <form action={onSubmit} ref={formRef} className="space-y-4">
            <input type="hidden" name="categoryId" value={category.id} />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="edit-category-name">
                Name
              </label>
              <Input
                id="edit-category-name"
                name="name"
                defaultValue={category.name}
                required
                disabled={pending}
              />
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

interface DeleteCategoryModalProps {
  readonly category: CategoryResponse | null;
  readonly onOpenChange: (open: boolean) => void;
  readonly pending: boolean;
  readonly onSubmit: (formData: FormData) => void;
  readonly errorMessage: string | null;
}

function DeleteCategoryModal({ category, onOpenChange, pending, onSubmit, errorMessage }: DeleteCategoryModalProps) {
  return (
    <Dialog open={Boolean(category)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete category</DialogTitle>
          <DialogDescription>
            This action removes the selected category from storefront metadata. Items assigned to it will lose the tag.
          </DialogDescription>
        </DialogHeader>
        {category ? (
          <form action={onSubmit} className="space-y-4">
            <input type="hidden" name="categoryId" value={category.id} />
            <p>
              Confirm deletion of <span className="font-semibold">{category.name}</span>?
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
