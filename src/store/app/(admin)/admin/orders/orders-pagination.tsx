import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { OrdersFilterState } from "@/app/(admin)/admin/orders/orders-filtering";
import { buildOrdersHref } from "@/app/(admin)/admin/orders/orders-filtering";

interface OrdersPaginationProps {
  filters: OrdersFilterState;
  total: number;
  itemsOnPage: number;
  basePath: string;
}

export function OrdersPagination({ filters, total, itemsOnPage, basePath }: OrdersPaginationProps) {
  if (total <= 0) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, filters.pageSize)));
  const currentPage = Math.min(filters.page, totalPages);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const showingStart = itemsOnPage > 0 ? (currentPage - 1) * filters.pageSize + 1 : 0;
  const showingEnd = itemsOnPage > 0 ? showingStart + itemsOnPage - 1 : 0;
  const prevHref = buildOrdersHref(basePath, filters, { page: currentPage - 1 });
  const nextHref = buildOrdersHref(basePath, filters, { page: currentPage + 1 });

  return (
    <div className="mt-6 flex flex-col gap-3 border-t pt-4 text-sm md:flex-row md:items-center md:justify-between">
      <p className="text-muted-foreground">
        Showing {showingStart}–{showingEnd} of {total} · Page {currentPage} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={!canGoPrev} asChild={canGoPrev}>
          {canGoPrev ? <Link href={prevHref}>Previous</Link> : <span>Previous</span>}
        </Button>
        <Button variant="outline" size="sm" disabled={!canGoNext} asChild={canGoNext}>
          {canGoNext ? <Link href={nextHref}>Next</Link> : <span>Next</span>}
        </Button>
      </div>
    </div>
  );
}
