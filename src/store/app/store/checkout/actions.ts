"use server";

import "server-only";

import type { BasketItem } from "@/lib/basket-client";
import { createOrder, createOrderDraft } from "@/lib/api/ordering";
import type { BasketItemPayload } from "@/lib/api/types/ordering";
import type { CheckoutActionState } from "./types";
import { clearCustomerBasket, fetchCustomerBasket } from "@/lib/server/basket-service";

function mapBasketItems(items: BasketItem[]): BasketItemPayload[] {
  if (!items.length) {
    throw new Error("Your cart is empty.");
  }

  return items.map((item) => ({
    productId: item.product_id,
    productName: item.name ?? `Product ${item.product_id}`,
    unitPrice: Number(item.price ?? 0),
    oldUnitPrice: typeof item.price === "number" ? item.price : undefined,
    quantity: item.quantity,
    pictureUrl: item.pictureFileName ?? "",
  }));
}

function parseBooleanFlag(value: FormDataEntryValue | null) {
  if (typeof value === "string") {
    return value === "true" || value === "on";
  }
  return false;
}

function getFormValue(formData: FormData, key: string) {
  const raw = formData.get(key);
  if (typeof raw !== "string" || raw.trim().length === 0) {
    throw new Error(`Field \"${key}\" is required.`);
  }
  return raw.trim();
}

function normalizeCardExpiration(raw: string | null) {
  if (!raw) {
    return undefined;
  }

  const normalized = raw.trim();
  if (!normalized) {
    return undefined;
  }

  if (/^\d{4}-\d{2}$/.test(normalized)) {
    return `${normalized}-01T00:00:00Z`;
  }

  return normalized;
}

export async function createDraftOrderAction(prevState: CheckoutActionState | undefined, formData: FormData) {
  try {
    const basket = await fetchCustomerBasket();
    const items = mapBasketItems(basket.items);
    const isRecurring = parseBooleanFlag(formData.get("isRecurring"));
    const recurrenceInterval = isRecurring ? (formData.get("recurrenceInterval") as string | null)?.trim() || null : null;

    const draft = await createOrderDraft({
      isRecurring,
      recurrenceInterval,
      items,
    });
    await clearCustomerBasket();
    return { draftId: draft.id } satisfies CheckoutActionState;
  } catch (error) {
    console.error("Failed to create order draft", error);
    const message = error instanceof Error ? error.message : "Unable to create draft order.";
    return { error: message } satisfies CheckoutActionState;
  }
}

export async function submitOrderAction(prevState: CheckoutActionState | undefined, formData: FormData) {
  try {
    const draftOrderId = Number(formData.get("draftOrderId"));
    if (!Number.isFinite(draftOrderId) || draftOrderId <= 0) {
      throw new Error("Draft order identifier is missing.");
    }

    const city = getFormValue(formData, "city");
    const street = getFormValue(formData, "street");
    const state = getFormValue(formData, "state");
    const country = getFormValue(formData, "country");
    const zipCode = getFormValue(formData, "zipCode");
    const cardNumber = getFormValue(formData, "cardNumber");
    const cardHolderName = getFormValue(formData, "cardHolderName");
    const cardSecurityNumber = getFormValue(formData, "cardSecurityNumber");

    const cardExpiration = normalizeCardExpiration(formData.get("cardExpiration") as string | null);
    const cardTypeIdRaw = formData.get("cardTypeId");
    const cardTypeId = typeof cardTypeIdRaw === "string" && cardTypeIdRaw.trim() !== "" ? Number(cardTypeIdRaw) : undefined;

    const order = await createOrder({
      draftOrderId,
      city,
      street,
      state,
      country,
      zipCode,
      cardNumber,
      cardHolderName,
      cardExpiration,
      cardSecurityNumber,
      cardTypeId: Number.isFinite(cardTypeId) ? cardTypeId : undefined,
    });

    await clearCustomerBasket();
    return { orderId: order.id } satisfies CheckoutActionState;
  } catch (error) {
    console.error("Failed to submit order", error);
    const message = error instanceof Error ? error.message : "Unable to submit the order.";
    return { error: message } satisfies CheckoutActionState;
  }
}
