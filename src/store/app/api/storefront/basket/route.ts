import { NextRequest, NextResponse } from "next/server";
import * as grpc from "@grpc/grpc-js";

import type { BasketItem } from "@/lib/basket-client";
import { clearCustomerBasket, fetchCustomerBasket, updateCustomerBasket } from "@/lib/server/basket-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const grpcStatusToHttp: Record<number, number> = {
  [grpc.status.UNAUTHENTICATED]: 401,
  [grpc.status.PERMISSION_DENIED]: 403,
  [grpc.status.NOT_FOUND]: 404,
  [grpc.status.INVALID_ARGUMENT]: 400,
};

function isGrpcError(error: unknown): error is grpc.ServiceError {
  return Boolean(error && typeof error === "object" && "code" in error);
}

function parseItems(body: unknown): BasketItem[] | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const payload = body as { items?: unknown };
  if (!Array.isArray(payload.items)) {
    return null;
  }

  const normalized: BasketItem[] = [];
  for (const rawItem of payload.items) {
    if (typeof rawItem !== "object" || rawItem === null) {
      return null;
    }

    const source = rawItem as Record<string, unknown>;
    const productId = Number(source.product_id ?? source.productId);
    const quantity = Number(source.quantity);
    if (!Number.isInteger(productId) || productId <= 0) {
      return null;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return null;
    }

    normalized.push({ product_id: productId, quantity });
  }

  return normalized;
}

function handleError(error: unknown) {
  if (isGrpcError(error)) {
    const status = grpcStatusToHttp[error.code] ?? 502;
    return NextResponse.json({ message: error.message }, { status });
  }

  console.error("Unexpected basket proxy failure", error);
  return NextResponse.json({ message: "Basket service unavailable." }, { status: 500 });
}

export async function GET() {
  try {
    const basket = await fetchCustomerBasket();
    return NextResponse.json(basket);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Request body is required." }, { status: 400 });
    }

    const items = parseItems(body);
    if (!items) {
      return NextResponse.json({ message: "Invalid basket payload." }, { status: 400 });
    }

    const basket = await updateCustomerBasket(items);
    return NextResponse.json(basket);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE() {
  try {
    await clearCustomerBasket();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleError(error);
  }
}
