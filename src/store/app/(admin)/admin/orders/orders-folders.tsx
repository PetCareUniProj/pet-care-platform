import Link from "next/link";
import { shipOrderAction } from "@/app/(admin)/admin/orders/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { OrderItemDto, OrderResponse } from "@/lib/api/types/ordering";
import { cn } from "@/lib/utils";
import { CalendarClock, ChevronDown, PackageCheck, Repeat, User } from "lucide-react";

interface OrdersFolderListProps {
  orders: OrderResponse[];
  currentPath: string;
  emptyState?: string;
  showShipAction?: boolean;
  showUserLinks?: boolean;
}

export function OrdersFolderList({ orders, currentPath, emptyState = "No orders found for the selected filters.", showShipAction = true, showUserLinks = true }: OrdersFolderListProps) {
  if (orders.length === 0) {
    return <p className="text-muted-foreground text-sm">{emptyState}</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <OrderFolder key={order.id} order={order} currentPath={currentPath} showShipAction={showShipAction} showUserLinks={showUserLinks} />
      ))}
    </div>
  );
}

interface OrderFolderProps {
  order: OrderResponse;
  currentPath: string;
  showShipAction: boolean;
  showUserLinks: boolean;
}

function OrderFolder({ order, currentPath, showShipAction, showUserLinks }: OrderFolderProps) {
  const statusMeta = getStatusMeta(order.orderStatus);
  const shipmentAllowed = canShip(order);
  const buyerId = order.buyerId ?? undefined;
  const recurringLabel = buildRecurringLabel(order.recurrenceInterval);

  return (
    <details className="group rounded-lg border bg-card shadow-sm">
      <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-3">
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
        <div className="flex flex-1 flex-col gap-1 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">Order #{order.id}</span>
            <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
            {order.isDraft ? <Badge variant="outline">Draft</Badge> : null}
            {order.isRecurring ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Repeat className="size-3.5" />
                {recurringLabel ?? "Recurring"}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <User className="size-3.5" />
              {buyerId ?? "Unassigned"}
            </span>
            <span className="inline-flex items-center gap-1">
              <PackageCheck className="size-3.5" />
              {order.orderItems.length} items
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="size-3.5" />
              {formatDate(order.orderDate)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold">{formatCurrency(order.total)}</p>
          <p className="text-xs text-muted-foreground">Total value</p>
        </div>
      </summary>
      <div className="space-y-4 border-t px-4 py-4 text-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Order ID: {order.id}</span>
          {order.paymentId ? <span>Payment #{order.paymentId}</span> : null}
          {order.parentOrderId ? <span>Parent #{order.parentOrderId}</span> : null}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-md border p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Shipping address</p>
            <address className="not-italic text-sm leading-relaxed">
              {order.address.street}
              <br />
              {order.address.city}, {order.address.state} {order.address.zipCode}
              <br />
              {order.address.country}
            </address>
          </div>
          <div className="rounded-md border p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Buyer</p>
            {buyerId ? (
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">{buyerId}</span>
                {showUserLinks ? (
                  <Link className="text-xs text-primary underline" href={`/admin/orders/user/${buyerId}`}>
                    View user orders
                  </Link>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No buyer assigned.</p>
            )}
          </div>
          <div className="rounded-md border p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Status & actions</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Order status</p>
                <p className="font-medium">{statusMeta.label}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {showShipAction ? (
                  <form action={shipOrderAction} className="flex items-center gap-2">
                    <input type="hidden" name="orderId" value={order.id} />
                    <input type="hidden" name="redirectPath" value={currentPath} />
                    <Button size="sm" type="submit" disabled={!shipmentAllowed} title={shipmentAllowed ? undefined : "Only paid orders can be shipped."}>
                      Ship order
                    </Button>
                  </form>
                ) : null}
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/orders/order/${order.id}`}>Open details</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <OrderItemsTable items={order.orderItems} />
        {order.description ? (
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Notes</p>
            <p>{order.description}</p>
          </div>
        ) : null}
        {order.isRecurring ? (
          <div className="rounded-md border p-3 text-sm">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Recurring schedule</p>
            <ul className="mt-2 list-disc pl-5 text-muted-foreground">
              {order.recurrenceInterval ? <li>Interval: {recurringLabel ?? order.recurrenceInterval}</li> : null}
              {order.nextRecurrenceDate ? <li>Next run: {formatDate(order.nextRecurrenceDate)}</li> : null}
            </ul>
          </div>
        ) : null}
      </div>
    </details>
  );
}

interface OrderItemsTableProps {
  items: OrderItemDto[];
}

function OrderItemsTable({ items }: OrderItemsTableProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Order has no items.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Unit price</TableHead>
            <TableHead className="text-right">Discount</TableHead>
            <TableHead className="text-right">Line total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={`${item.productId}-${item.productName}`}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{item.productName}</span>
                  <span className="text-xs text-muted-foreground">SKU #{item.productId}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">{item.units}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
              <TableCell className={cn("text-right", item.discount > 0 ? "text-muted-foreground" : undefined)}>
                {item.discount > 0 ? `- ${formatCurrency(item.discount)}` : "—"}
              </TableCell>
              <TableCell className="text-right">{formatCurrency(calculateLineTotal(item))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function calculateLineTotal(item: OrderItemDto) {
  const effectiveUnitPrice = item.unitPrice - item.discount;
  return Math.max(0, effectiveUnitPrice) * item.units;
}

function canShip(order: OrderResponse) {
  return order.orderStatus.toLowerCase() === "paid";
}

function getStatusMeta(status: string) {
  const normalized = status.trim().toLowerCase();
  if (normalized === "paid") {
    return { label: "Paid", variant: "secondary" as const };
  }
  if (normalized === "shipped") {
    return { label: "Shipped", variant: "outline" as const };
  }
  if (normalized === "stockconfirmed") {
    return { label: "Stock confirmed", variant: "secondary" as const };
  }
  if (normalized === "awaitingvalidation") {
    return { label: "Awaiting validation", variant: "destructive" as const };
  }
  if (normalized === "submitted") {
    return { label: "Submitted", variant: "secondary" as const };
  }
  if (normalized === "cancelled") {
    return { label: "Cancelled", variant: "destructive" as const };
  }
  if (normalized === "draft") {
    return { label: "Draft", variant: "outline" as const };
  }
  return { label: status, variant: "secondary" as const };
}

const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function buildRecurringLabel(value?: string | null) {
  if (!value) {
    return null;
  }

  const match = value.match(/^(?:(\d+)\.)?(\d{1,2}):(\d{2})(?::(\d{2}))?.*$/);
  if (!match) {
    return value;
  }

  const [, daysRaw, hoursRaw, minutesRaw, secondsRaw] = match;
  const days = daysRaw ? Number(daysRaw) : 0;
  const hours = hoursRaw ? Number(hoursRaw) : 0;
  const minutes = minutesRaw ? Number(minutesRaw) : 0;
  const seconds = secondsRaw ? Number(secondsRaw) : 0;
  const parts: string[] = [];

  if (days) {
    parts.push(`${days}d`);
  }
  if (hours) {
    parts.push(`${hours}h`);
  }
  if (minutes) {
    parts.push(`${minutes}m`);
  }
  if (seconds && parts.length === 0) {
    parts.push(`${seconds}s`);
  }

  return parts.length > 0 ? parts.join(" ") : value;
}
