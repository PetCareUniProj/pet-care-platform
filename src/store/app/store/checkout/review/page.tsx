import { auth } from "@/auth";
import { CheckoutReviewForm } from "@/app/store/checkout/components/CheckoutReviewForm";
import type { CheckoutSummaryItem } from "@/app/store/checkout/types";
import { fetchCustomerBasket } from "@/lib/server/basket-service";
import { redirect } from "next/navigation";

const CATALOG_IMAGE_BASE = "/api/storefront/catalog/images";

export default async function CheckoutReviewPage() {
  const session = await auth();
  if (!session) {
    const callbackUrl = encodeURIComponent("/store/checkout/review");
    redirect(`/api/auth/signin?callbackUrl=${callbackUrl}`);
  }

  const basket = await fetchCustomerBasket();
  if (!basket.items.length) {
    redirect("/store/products");
  }

  const items: CheckoutSummaryItem[] = basket.items.map((item) => ({
    productId: item.product_id,
    name: item.name ?? `Product ${item.product_id}`,
    price: Number(item.price ?? 0),
    quantity: item.quantity,
    pictureUrl: item.pictureFileName ? `${CATALOG_IMAGE_BASE}/${item.pictureFileName}` : undefined,
  }));

  const total = items.reduce((acc, current) => acc + current.price * current.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F7F5F2] px-4 py-10 md:px-10">
      <div className="mx-auto max-w-4xl">
        <CheckoutReviewForm items={items} total={total} />
      </div>
    </div>
  );
}
