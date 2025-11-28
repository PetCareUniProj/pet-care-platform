import { shipOrderAction, cancelOrderAction } from "@/app/(admin)/admin/orders/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOrdersByUserId, getOrdersForCurrentUser } from "@/lib/api/ordering";
import type { OrderResponse } from "@/lib/api/types/ordering";

const friendlyStatusMap: Record<string, string> = {
  awaitingvalidation: "Awaiting validation",
  awaitingstock: "Awaiting stock",
  paid: "Paid",
  shipped: "Shipped",
};

function formatStatus(value: string) {
  const key = value.toLowerCase().replaceAll(" ", "");
  return friendlyStatusMap[key] ?? value;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function canShip(order: OrderResponse) {
  const status = order.orderStatus.toLowerCase();
  return status.includes("paid") || status.includes("ready");
}

function canCancel(order: OrderResponse) {
  const status = order.orderStatus.toLowerCase();
  return !status.includes("shipped");
}

interface OrdersPageProps {
  searchParams?: Record<string, string | string[]>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const userId = typeof searchParams?.userId === "string" ? searchParams.userId.trim() : "";
  const pageParam = typeof searchParams?.page === "string" ? Number(searchParams.page) : 1;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  let ordersResponse: Awaited<ReturnType<typeof getOrdersForCurrentUser>> | null = null;
  let error: string | null = null;

  try {
    if (userId) {
      ordersResponse = await getOrdersByUserId(userId, { page, pageSize: 20 });
    } else {
      ordersResponse = await getOrdersForCurrentUser({ page, pageSize: 20 });
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load orders.";
  }

  const orders = ordersResponse?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-muted-foreground text-sm">
            View, ship, or cancel orders through the protected Ordering API endpoints.
          </p>
        </div>
        <form className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center" action="/admin/orders">
          <Input
            name="userId"
            placeholder="User ID (GUID)"
            defaultValue={userId}
            className="md:w-72"
          />
          <Button type="submit">Load orders</Button>
        </form>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Live orders</CardTitle>
            <CardDescription>
              {userId ? `Showing orders for user ${userId}` : "Showing your own orders. Filter by user id to audit others."}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              Filter
            </Button>
            <Button disabled>Download CSV</Button>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-muted-foreground text-sm">No orders found for the selected user.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const status = formatStatus(order.orderStatus);
                  const shipAllowed = canShip(order);
                  const cancelAllowed = canCancel(order);
                  return (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {order.buyerId ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.toLowerCase().includes("awaiting") ? "destructive" : "secondary"}>{status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                      <TableCell className="text-right">{formatDate(order.orderDate)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <form action={cancelOrderAction}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <Button variant="outline" size="sm" type="submit" disabled={!cancelAllowed}>
                              Cancel
                            </Button>
                          </form>
                          <form action={shipOrderAction}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <Button size="sm" type="submit" disabled={!shipAllowed}>
                              Ship
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
