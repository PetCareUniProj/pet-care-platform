import { auth } from "@/auth";
import { CheckoutDetailsForm } from "@/app/store/checkout/components/CheckoutDetailsForm";
import { getCardTypes } from "@/lib/api/ordering";
import type { CardTypeResponse } from "@/lib/api/types/ordering";
import Link from "next/link";
import { redirect } from "next/navigation";

interface DetailsPageProps {
  params: {
    draftId: string;
  };
}

export default async function CheckoutDetailsPage({ params }: DetailsPageProps) {
  const aParams = await params;
  const session = await auth();
  if (!session) {
    const callbackUrl = encodeURIComponent(`/store/checkout/${aParams.draftId}/details`);
    redirect(`/api/auth/signin?callbackUrl=${callbackUrl}`);
  }

  const draftOrderId = Number(aParams.draftId);
  const invalidDraft = !Number.isFinite(draftOrderId) || draftOrderId <= 0;

  let cardTypes: CardTypeResponse[] = [];
  try {
    cardTypes = await getCardTypes();
  } catch (error) {
    console.warn("Unable to load card types", error);
  }

  if (invalidDraft) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] px-4 py-10 md:px-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Checkout session expired</h1>
          <p className="mt-2 text-gray-500">Your draft information is missing. Please restart checkout.</p>
          <Link
            href="/store/checkout/review"
            className="mt-6 inline-flex rounded-2xl bg-black px-6 py-3 text-white transition-colors hover:bg-neutral-800"
          >
            Return to review
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2] px-4 py-10 md:px-10">
      <div className="mx-auto max-w-3xl">
        <CheckoutDetailsForm draftOrderId={draftOrderId} cardTypes={cardTypes} />
      </div>
    </div>
  );
}
