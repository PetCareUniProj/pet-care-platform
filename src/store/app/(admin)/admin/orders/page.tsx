import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOrders } from "@/lib/api/ordering";
import { ApiError } from "@/lib/api/http";
import { ORDER_STATUS_VALUES, type OrdersResponse } from "@/lib/api/types/ordering";
import { OrdersFolderList } from "@/app/(admin)/admin/orders/orders-folders";
import {
  PAGE_SIZE_OPTIONS,
  buildGetOrdersParams,
  buildOrdersHref,
  parseOrdersFilters,
  type OrdersFilterState,
} from "@/app/(admin)/admin/orders/orders-filtering";
import { OrdersPagination } from "@/app/(admin)/admin/orders/orders-pagination";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface OrdersPageProps {
  searchParams?: Record<string, string | string[]>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const filters = await parseOrdersFilters(searchParams);
  const currentPath = buildOrdersHref("/admin/orders", filters);
  let ordersResponse: Awaited<ReturnType<typeof getOrders>> | null = null;
  let loadError: string | null = null;

  try {
    ordersResponse = await getOrders(buildGetOrdersParams(filters));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      ordersResponse = buildEmptyOrdersResponse(filters);
    } else {
      loadError = error instanceof Error ? error.message : "Failed to load orders.";
    }
  }

  const items = ordersResponse?.items ?? [];
  const total = ordersResponse?.total ?? 0;

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Order management</h1>
          <p className="text-muted-foreground text-sm">
            Audit every order via the Ordering API and ship paid orders from one workspace.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/orders/user/me">My orders</Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Query the `/api/orders` endpoint by status, page size, and recurrence.</CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersFiltersForm filters={filters} />
        </CardContent>
      </Card>

      {loadError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {loadError}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Fold open an order to inspect its shipping info and items.</CardDescription>
            </div>
            <p className="text-xs text-muted-foreground">{total} total records</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <OrdersFolderList orders={items} currentPath={currentPath} />
          <OrdersPagination filters={filters} total={total} itemsOnPage={items.length} basePath="/admin/orders" />
        </CardContent>
      </Card>
    </div>
  );
}

interface OrdersFiltersFormProps {
  filters: OrdersFilterState;
}

function buildEmptyOrdersResponse(filters: OrdersFilterState): OrdersResponse {
  return {
    items: [],
    total: 0,
    page: filters.page,
    pageSize: filters.pageSize,
    hasNextPage: false,
  };
}

function OrdersFiltersForm({ filters }: OrdersFiltersFormProps) {
  const recurringValue = typeof filters.isRecurring === "boolean" ? String(filters.isRecurring) : "";
  return (
    <form className="space-y-4" method="get">
      <input type="hidden" name="page" value="1" />
      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Statuses</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ORDER_STATUS_VALUES.map((status) => (
            <label key={status} className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="status"
                value={status}
                defaultChecked={filters.statuses.includes(status)}
                className="h-4 w-4 rounded border border-input text-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <span>{formatStatusLabel(status)}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="pageSize">
            Page size
          </label>
          <select
            id="pageSize"
            name="pageSize"
            defaultValue={String(filters.pageSize)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={String(size)}>
                {size} per page
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="recurring">
            Recurrence
          </label>
          <select
            id="recurring"
            name="recurring"
            defaultValue={recurringValue}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All orders</option>
            <option value="true">Recurring only</option>
            <option value="false">One-time orders</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit">Apply filters</Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/orders">Reset</Link>
        </Button>
      </div>
    </form>
  );
}

function formatStatusLabel(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}
