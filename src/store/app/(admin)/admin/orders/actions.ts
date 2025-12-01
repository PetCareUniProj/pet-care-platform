"use server";

import { cancelOrder, shipOrder } from "@/lib/api/ordering";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseOrderId(formData: FormData) {
  const raw = formData.get("orderId");
  const orderId = Number(raw);
  if (!Number.isFinite(orderId) || orderId <= 0) {
    throw new Error("Invalid order id.");
  }
  return orderId;
}

function parseRedirectPath(formData: FormData) {
  const raw = formData.get("redirectPath");
  if (typeof raw === "string" && raw.startsWith("/")) {
    return raw;
  }
  return "/admin/orders";
}

function revalidateAndRedirect(path: string) {
  const basePath = path.split("?")[0] || "/admin/orders";
  revalidatePath(basePath);
  redirect(path);
}

export async function shipOrderAction(formData: FormData) {
  const orderId = parseOrderId(formData);
  const redirectPath = parseRedirectPath(formData);
  await shipOrder(orderId);
  revalidateAndRedirect(redirectPath);
}

export async function cancelOrderAction(formData: FormData) {
  const orderId = parseOrderId(formData);
  const redirectPath = parseRedirectPath(formData);
  await cancelOrder(orderId);
  revalidateAndRedirect(redirectPath);
}
