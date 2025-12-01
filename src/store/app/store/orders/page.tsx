import { auth } from "@/auth";
import { getOrdersForCurrentUser } from "@/lib/api/ordering";
import Link from "next/link";
import { redirect } from "next/navigation";

interface OrdersPageProps {
  searchParams?: {
    highlight?: string;
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function resolveStatusStyles(status: string) {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case "shipped":
      return {
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        card: "border-emerald-100 shadow-emerald-50",
      };
    case "paid":
    case "stockconfirmed":
      return {
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        card: "border-blue-100 shadow-blue-50",
      };
    case "awaitingvalidation":
    case "submitted":
      return {
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        card: "border-amber-100 shadow-amber-50",
      };
    case "cancelled":
      return {
        badge: "bg-rose-50 text-rose-700 border-rose-200",
        card: "border-rose-100 shadow-rose-50",
      };
    case "draft":
      return {
        badge: "bg-slate-100 text-slate-700 border-slate-200",
        card: "border-slate-200",
      };
    default:
      return {
        badge: "bg-gray-100 text-gray-700 border-gray-200",
        card: "border-gray-200",
      };
  }
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const aSearchParams = await searchParams;
  const session = await auth();
  if (!session) {
    const callbackUrl = encodeURIComponent("/store/orders");
    redirect(`/api/auth/signin?callbackUrl=${callbackUrl}`);
  }

  const orders = await getOrdersForCurrentUser();
  const orderItems = orders.items ?? [];
  const highlightId = Number(aSearchParams?.highlight);

  return (
    <div className="min-h-screen bg-[#F7F5F2] px-4 py-10 md:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 underline-offset-4 transition-colors hover:text-gray-900 hover:underline"
          >
            ← Go back to store
          </Link>
        </div>
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">Orders</p>
          <h1 className="text-3xl font-bold text-gray-900">Your recent orders</h1>
          <p className="text-gray-500">Track purchases and recurring deliveries in one place.</p>
        </header>

        {orderItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-lg font-semibold text-gray-700">You have no orders yet.</p>
            <p className="mt-2 text-gray-500">Start shopping to see them listed here.</p>
            <Link
              href="/store/products"
              className="mt-6 inline-flex rounded-2xl bg-black px-6 py-3 text-white transition-colors hover:bg-neutral-800"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orderItems.map((order) => (
              (() => {
                const styles = resolveStatusStyles(order.orderStatus ?? "");
                const isHighlight = highlightId === order.id;
                const cardBorder = isHighlight ? "border-orange-400 shadow-orange-100" : styles.card;
                const badge = styles.badge;
                return (
              <div
                key={order.id}
                className={`rounded-3xl border bg-white px-6 py-5 shadow-sm transition ${cardBorder}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase text-gray-500">Order #{order.id}</p>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(order.orderDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm uppercase text-gray-500">Status</p>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${badge}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm uppercase text-gray-500">Total</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {order.orderItems.slice(0, 4).map((item) => (
                    <div key={`${order.id}-${item.productId}`} className="rounded-2xl bg-gray-50 px-4 py-3">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500">
                        {item.units} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                  ))}
                </div>
                {order.orderItems.length > 4 && (
                  <p className="mt-2 text-sm text-gray-500">+{order.orderItems.length - 4} more items</p>
                )}
                <div className="mt-4 flex flex-wrap justify-end gap-3">
                  <Link
                    href={`/store/orders/${order.id}`}
                    className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-400"
                  >
                    View details
                  </Link>
                  {order.isDraft && (
                    <Link
                      href={`/store/checkout/${order.id}/details`}
                      className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-400"
                    >
                      Continue checkout
                    </Link>
                  )}
                </div>
              </div>
                );
              })()
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
