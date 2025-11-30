export interface CheckoutActionState {
  error?: string;
  draftId?: number;
  orderId?: number;
}

export interface CheckoutSummaryItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  pictureUrl?: string;
}
