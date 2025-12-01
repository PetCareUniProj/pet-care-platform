import { auth } from "@/auth";
import { getOrderById } from "@/lib/api/ordering";
import Link from "next/link";
import { redirect } from "next/navigation";

interface OrderDetailsPageProps {
  params: {
    orderId: string;
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function formatDate(value?: string | null, options: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" }) {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("en", options).format(new Date(value));
}

function resolveStatusStyles(status: string) {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case "shipped":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "paid":
    case "stockconfirmed":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "awaitingvalidation":
    case "submitted":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "cancelled":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "draft":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function formatAddressLine(value?: string | null) {
  return value?.trim() || "-";
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const rawOrderId = (await params)?.orderId;
  const orderId = Number(rawOrderId);
  console.log("Order ID:", orderId);
  if (!Number.isFinite(orderId) || orderId <= 0) {
    redirect("/store/orders");
  }

  const session = await auth();
  if (!session) {
    const callbackUrl = encodeURIComponent(`/store/orders/${orderId}`);
    redirect(`/api/auth/signin?callbackUrl=${callbackUrl}`);
  }

  let order;
  let loadError: string | null = null;
  try {
    order = await getOrderById(orderId);
  } catch (error) {
    loadError = "We couldn't load this order right now.";
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] px-4 py-10 md:px-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-gray-800">Order unavailable</p>
          <p className="mt-2 text-gray-500">{loadError ?? "We could not find an order with this identifier."}</p>
          <Link
            href="/store/orders"
            className="mt-6 inline-flex rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

//   const sessionUserId = session.user?.id;
//   if (order.buyerId && sessionUserId && order.buyerId !== sessionUserId) {
//     console.warn(`User ${sessionUserId} attempted to access order ${order.id} owned by ${order.buyerId}`);
//     redirect("/store/orders");
//   }

  const statusBadge = resolveStatusStyles(order.orderStatus ?? "");

  return (
    <div className="min-h-screen bg-[#F7F5F2] px-4 py-10 md:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <Link
            href="/store/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 underline-offset-4 transition-colors hover:text-gray-900 hover:underline"
          >
            ← Back to orders
          </Link>
        </div>

        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">Order #{order.id}</p>
          <h1 className="text-3xl font-bold text-gray-900">Order details</h1>
          <p className="text-gray-500">Placed on {formatDate(order.orderDate)}</p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-gray-200 bg-white p-5">
            <p className="text-sm uppercase text-gray-500">Status</p>
            <span className={`mt-2 inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${statusBadge}`}>
              {order.orderStatus}
            </span>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-5">
            <p className="text-sm uppercase text-gray-500">Total paid</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(order.total)}</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-5">
            <p className="text-sm uppercase text-gray-500">Next recurrence</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">
              {order.isRecurring ? formatDate(order.nextRecurrenceDate, { dateStyle: "medium" }) : "Not recurring"}
            </p>
            {order.isRecurring && order.recurrenceInterval && (
              <p className="text-sm text-gray-500">Every {order.recurrenceInterval.toLowerCase()}</p>
            )}
          </div>
        </div>

        {order.description && (
          <div className="rounded-3xl border border-gray-200 bg-white p-5">
            <p className="text-sm uppercase text-gray-500">Notes</p>
            <p className="mt-2 text-gray-800">{order.description}</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-3xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Shipping address</h2>
              {order.isDraft && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase text-gray-600">Draft</span>
              )}
            </div>
            <dl className="mt-4 space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-500">Street</dt>
                <dd>{formatAddressLine(order.address?.street)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-500">City</dt>
                <dd>{formatAddressLine(order.address?.city)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-500">State</dt>
                <dd>{formatAddressLine(order.address?.state)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-500">Country</dt>
                <dd>{formatAddressLine(order.address?.country)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-500">Postal code</dt>
                <dd>{formatAddressLine(order.address?.zipCode)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-gray-900">Order metadata</h2>
            <dl className="mt-4 space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-500">Order ID</dt>
                <dd>#{order.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-500">Placed on</dt>
                <dd>{formatDate(order.orderDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-500">Payment reference</dt>
                <dd>{order.paymentId ? `#${order.paymentId}` : "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-500">Parent order</dt>
                <dd>{order.parentOrderId ? `#${order.parentOrderId}` : "-"}</dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="rounded-3xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase text-gray-500">Items</p>
              <h2 className="text-xl font-semibold text-gray-900">{order.orderItems.length} product(s)</h2>
            </div>
          </div>
          <div className="mt-4 hidden text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] md:gap-4 md:border-b md:border-gray-100 md:pb-2">
            <span>Product</span>
            <span className="text-right">Unit price</span>
            <span className="text-right">Quantity</span>
            <span className="text-right">Line total</span>
          </div>
          <div className="divide-y divide-gray-100">
            {order.orderItems.map((item) => (
              <div
                key={`${order.id}-${item.productId}`}
                className="grid gap-4 py-4 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]"
              >
                <div>
                  <p className="font-semibold text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-500">Product #{item.productId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase text-gray-500 md:hidden">Unit price</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(item.unitPrice)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase text-gray-500 md:hidden">Quantity</p>
                  <p className="font-semibold text-gray-900">{item.units}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase text-gray-500 md:hidden">Line total</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(item.unitPrice * item.units)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-lg font-semibold text-gray-900">
            <span>Order total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
