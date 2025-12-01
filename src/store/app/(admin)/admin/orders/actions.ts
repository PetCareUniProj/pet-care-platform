"use server";

import { cancelOrder, shipOrder } from "@/lib/api/ordering";
import { revalidatePath } from "next/cache";

function parseOrderId(formData: FormData) {
  const raw = formData.get("orderId");
  const orderId = Number(raw);
  if (!Number.isFinite(orderId) || orderId <= 0) {
    throw new Error("Invalid order id.");
  }
  return orderId;
}

export async function shipOrderAction(formData: FormData) {
  const orderId = parseOrderId(formData);
  await shipOrder(orderId);
  revalidatePath("/admin/orders");
}

export async function cancelOrderAction(formData: FormData) {
  const orderId = parseOrderId(formData);
  await cancelOrder(orderId);
  revalidatePath("/admin/orders");
}
