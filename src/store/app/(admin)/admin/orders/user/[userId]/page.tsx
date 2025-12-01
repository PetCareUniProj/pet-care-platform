import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrdersByUserId, getOrdersForCurrentUser } from "@/lib/api/ordering";
import { ApiError } from "@/lib/api/http";
import type { OrdersResponse } from "@/lib/api/types/ordering";
import { OrdersFolderList } from "@/app/(admin)/admin/orders/orders-folders";
import {
  PAGE_SIZE_OPTIONS,
  buildOrdersHref,
  parseOrdersFilters,
  type OrdersFilterState, buildGetOrdersParams,
} from "@/app/(admin)/admin/orders/orders-filtering";
import { OrdersPagination } from "@/app/(admin)/admin/orders/orders-pagination";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface OrdersByUserPageProps {
  params: { userId: string };
  searchParams?: Record<string, string | string[]>;
}

export default async function OrdersByUserPage({ params, searchParams }: OrdersByUserPageProps) {
  const aParams = await params;
  const rawUserId = aParams.userId.trim();
  const parsed = parseOrdersFilters(searchParams, { statuses: [] });
  const filters: OrdersFilterState = {
    page: 0, pageSize: 0,
    ...parsed,
    statuses: []
  };
  const currentPath = buildOrdersHref(`/admin/orders/user/${rawUserId}`, filters);

  let ordersResponse: Awaited<ReturnType<typeof getOrdersByUserId>> | Awaited<ReturnType<typeof getOrdersForCurrentUser>> | null = null;
  let loadError: string | null = null;
  const isCurrentUser = rawUserId.toLowerCase() === "me";

  try {
    if (isCurrentUser) {
      ordersResponse = await getOrdersForCurrentUser({ page: filters.page, pageSize: filters.pageSize });
    } else {
      ordersResponse = await getOrdersByUserId(rawUserId, { page: filters.page, pageSize: filters.pageSize });
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      ordersResponse = buildEmptyUserResponse(filters);
    } else {
      loadError = error instanceof Error ? error.message : "Failed to load user orders.";
    }
  }

  const items = ordersResponse?.items ?? [];
  const total = ordersResponse?.total ?? 0;
  const titleUser = isCurrentUser ? "the signed-in user" : rawUserId;

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orders for {titleUser}</h1>
          <p className="text-muted-foreground text-sm">
            Use this page to audit a specific buyer. Only admins can view other users' orders.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/orders">Back to order management</Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>View options</CardTitle>
          <CardDescription>Adjust pagination for this user feed.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap items-end gap-3" method="get">
            <input type="hidden" name="page" value="1" />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="pageSize">
                Page size
              </label>
              <select
                id="pageSize"
                name="pageSize"
                defaultValue={String(filters.pageSize)}
                className="h-10 min-w-32 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={String(size)}>
                    {size} per page
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">Apply</Button>
          </form>
        </CardContent>
      </Card>

      {loadError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{loadError}</div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>User orders</CardTitle>
          <CardDescription>{total} records found.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <OrdersFolderList orders={items} currentPath={currentPath} />
          <OrdersPagination filters={filters} total={total} itemsOnPage={items.length} basePath={`/admin/orders/user/${rawUserId}`} />
        </CardContent>
      </Card>
    </div>
  );
}

function buildEmptyUserResponse(filters: OrdersFilterState): OrdersResponse {
  return {
    items: [],
    total: 0,
    page: filters.page,
    pageSize: filters.pageSize,
    hasNextPage: false,
  };
}
