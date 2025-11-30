import { NextRequest, NextResponse } from "next/server";

import type { BasketItem } from "@/lib/basket-client";
import { clearCustomerBasket, fetchCustomerBasket, updateCustomerBasket } from "@/lib/server/basket-service";

export async function GET() {
  try {
    const basket = await fetchCustomerBasket();
    return NextResponse.json(basket);
  } catch (error) {
    console.error("Basket proxy GET failed", error);
    return NextResponse.json({ message: "Unable to load basket." }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { items?: BasketItem[] };
    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json({ message: "Items payload is required." }, { status: 400 });
    }

    const basket = await updateCustomerBasket(body.items);
    return NextResponse.json(basket);
  } catch (error) {
    console.error("Basket proxy POST failed", error);
    return NextResponse.json({ message: "Unable to update basket." }, { status: 502 });
  }
}

export async function DELETE() {
  try {
    await clearCustomerBasket();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Basket proxy DELETE failed", error);
    return NextResponse.json({ message: "Unable to clear basket." }, { status: 502 });
  }
}
