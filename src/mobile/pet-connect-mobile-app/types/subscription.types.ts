// Subscription types

export type SubscriptionFrequency = 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly';

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired';

export interface Subscription {
  id: string;
  userId: string;
  productId: number;
  productName: string;
  productSlug: string;
  quantity: number;
  frequency: SubscriptionFrequency;
  status: SubscriptionStatus;
  nextDeliveryDate: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
}

export interface CreateSubscriptionDto {
  productId: number;
  quantity: number;
  frequency: SubscriptionFrequency;
}

export interface UpdateSubscriptionDto {
  quantity?: number;
  frequency?: SubscriptionFrequency;
  status?: SubscriptionStatus;
}


