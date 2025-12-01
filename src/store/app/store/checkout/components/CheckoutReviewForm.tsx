"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createDraftOrderAction } from "../actions";
import type { CheckoutActionState, CheckoutSummaryItem } from "../types";

interface CheckoutReviewFormProps {
  items: CheckoutSummaryItem[];
  total: number;
}

const recurrenceOptions = [
  { label: "Every week", value: "7.00:00:00" },
  { label: "Every 2 weeks", value: "14.00:00:00" },
  { label: "Every month", value: "30.00:00:00" },
];

const initialState: CheckoutActionState = {};

export function CheckoutReviewForm({ items, total }: CheckoutReviewFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState<CheckoutActionState, FormData>(createDraftOrderAction, initialState);
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState(recurrenceOptions[0].value);

  const recurringDescription = useMemo(() => {
    const option = recurrenceOptions.find((candidate) => candidate.value === selectedInterval);
    return option?.label ?? "Recurring schedule";
  }, [selectedInterval]);

  useEffect(() => {
    if (state?.draftId) {
      router.push(`/store/checkout/${state.draftId}/details`);
    }
  }, [state?.draftId, router]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">Step 1</p>
          <h1 className="text-3xl font-bold text-gray-900">Review your order</h1>
          <p className="text-gray-500">Confirm the items in your basket before continuing to payment.</p>
        </header>

        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 p-4">
              <div className="h-20 w-20 flex-shrink-0 rounded-2xl bg-gray-50 overflow-hidden">
                {item.pictureUrl ? (
                  <img
                    src={item.pictureUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = `https://placehold.co/80x80/f5f5f5/999999?text=${encodeURIComponent(item.name ?? "Pet")}`;
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">🐾</div>
                )}
              </div>
              <div className="flex flex-1 items-center">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-6 py-4">
          <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">Subtotal</span>
          <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
        </div>

        <div className="space-y-3 rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Recurring order</p>
              <p className="text-sm text-gray-500">Schedule automatic re-orders for your pets.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
              <span>{isRecurring ? "Enabled" : "Disabled"}</span>
              <input
                type="checkbox"
                name="isRecurring"
                value="true"
                checked={isRecurring}
                onChange={(event) => setIsRecurring(event.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
            </label>
          </div>

          <div className="transition-opacity" aria-hidden={!isRecurring}>
            <label className="text-sm font-semibold text-gray-700">Repeat interval</label>
            <select
              name="recurrenceInterval"
              value={selectedInterval}
              disabled={!isRecurring}
              onChange={(event) => setSelectedInterval(event.target.value)}
              className="mt-1 w-full rounded-2xl border-gray-200 px-4 py-2 text-gray-900 focus:border-orange-500 focus:ring-orange-500 disabled:opacity-50"
            >
              {recurrenceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">Current schedule: {recurringDescription}</p>
          </div>
        </div>

        {state?.error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:justify-end">
          <Link
            href="/store/products"
            className="rounded-2xl border border-gray-200 px-6 py-3 text-center font-semibold text-gray-700 transition-colors hover:border-gray-300"
          >
            Continue Shopping
          </Link>
          <SubmitButton label="Confirm & Continue" />
        </div>
      </div>
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-2xl bg-black px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Processing..." : label}
    </button>
  );
}
