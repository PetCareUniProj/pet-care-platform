import { NextRequest, NextResponse } from "next/server";
import * as grpc from "@grpc/grpc-js";

import { addBasketItem } from "@/lib/server/basket-service";

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

function handleError(error: unknown) {
  if (isGrpcError(error)) {
    const status = grpcStatusToHttp[error.code] ?? 502;
    return NextResponse.json({ message: error.message }, { status });
  }

  console.error("Unexpected basket item failure", error);
  return NextResponse.json({ message: "Basket service unavailable." }, { status: 500 });
}

function parsePayload(body: unknown) {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const payload = body as Record<string, unknown>;
  const productId = Number(payload.productId ?? payload.product_id);
  const quantity = payload.quantity === undefined ? 1 : Number(payload.quantity);

  if (!Number.isInteger(productId) || productId <= 0) {
    return null;
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return null;
  }

  return { productId, quantity };
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Request body is required." }, { status: 400 });
    }

    const payload = parsePayload(body);
    if (!payload) {
      return NextResponse.json({ message: "Invalid basket item payload." }, { status: 400 });
    }

    const basket = await addBasketItem(payload.productId, payload.quantity);
    return NextResponse.json(basket);
  } catch (error) {
    return handleError(error);
  }
}
