"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { submitOrderAction } from "../actions";
import type { CheckoutActionState } from "../types";
import type { CardTypeResponse } from "@/lib/api/types/ordering";

interface CheckoutDetailsFormProps {
  draftOrderId: number;
  cardTypes: CardTypeResponse[];
}

const initialState: CheckoutActionState = {};

export function CheckoutDetailsForm({ draftOrderId, cardTypes }: CheckoutDetailsFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState<CheckoutActionState, FormData>(submitOrderAction, initialState);
  const inputClass =
    "w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500";

  useEffect(() => {
    if (state?.orderId) {
      router.push(`/store/orders?highlight=${state.orderId}`);
    }
  }, [state?.orderId, router]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="draftOrderId" value={draftOrderId} />
      <div className="bg-white rounded-3xl shadow-lg p-8 space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">Step 2</p>
          <h1 className="text-3xl font-bold text-gray-900">Shipping & Payment</h1>
          <p className="text-gray-500">Provide delivery and payment details to finalize your order.</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Shipping address</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input name="city" placeholder="City" className={inputClass} required />
            <input name="street" placeholder="Street" className={inputClass} required />
            <input name="state" placeholder="State" className={inputClass} required />
            <input name="country" placeholder="Country" className={inputClass} required />
            <input name="zipCode" placeholder="Postal code" className={inputClass} required />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Payment method</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input name="cardHolderName" placeholder="Cardholder name" className={inputClass} required />
            <input name="cardNumber" placeholder="Card number" inputMode="numeric" className={inputClass} required />
            <input name="cardSecurityNumber" placeholder="Security code" inputMode="numeric" className={inputClass} required />
            <input name="cardExpiration" type="month" placeholder="Expiration" className={inputClass} required />
            <select name="cardTypeId" className={`${inputClass} md:col-span-2`}>
              <option value="">Select card type (optional)</option>
              {cardTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        {state?.error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:justify-end">
          <Link
            href="/store/checkout/review"
            className="rounded-2xl border border-gray-200 px-6 py-3 text-center font-semibold text-gray-700 transition-colors hover:border-gray-300"
          >
            Back to Review
          </Link>
          <DetailsSubmitButton label="Place Order" />
        </div>
      </div>

    </form>
  );
}

function DetailsSubmitButton({ label }: { label: string }) {
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
