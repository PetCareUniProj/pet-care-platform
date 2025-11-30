import { NextRequest, NextResponse } from "next/server";
import * as grpc from "@grpc/grpc-js";

import { removeBasketItem } from "@/lib/server/basket-service";

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

export async function DELETE(_: NextRequest, context: { params: { productId: string } }) {
  try {
    const productId = Number(context.params.productId);
    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ message: "Product id must be a positive integer." }, { status: 400 });
    }

    const basket = await removeBasketItem(productId);
    return NextResponse.json(basket);
  } catch (error) {
    return handleError(error);
  }
}
