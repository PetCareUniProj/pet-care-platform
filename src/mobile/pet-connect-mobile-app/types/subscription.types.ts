// Subscription types
// Subscriptions are implemented as recurring orders in our backend

import { OrderResponse, RecurrenceInterval } from './order.types';

/**
 * Subscription status based on order status
 */
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

/**
 * Subscription is a recurring order
 * Filtered from orders where isRecurring = true
 */
export interface Subscription extends OrderResponse {
  isRecurring: true;
  recurrenceInterval: string;
  nextRecurrenceDate: string;
}

/**
 * Subscription display item for UI
 */
export interface SubscriptionDisplay {
  id: number;
  orderDate: string;
  nextDeliveryDate: string;
  recurrenceInterval: RecurrenceInterval;
  recurrenceLabel: string;
  total: number;
  itemsCount: number;
  status: SubscriptionStatus;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    pictureUrl: string;
  }[];
}

/**
 * Request to create subscription (recurring order)
 */
export interface CreateSubscriptionRequest {
  items: {
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    pictureUrl: string;
  }[];
  recurrenceInterval: RecurrenceInterval;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  payment: {
    cardNumber: string;
    cardHolderName: string;
    cardExpiration: string;
    cardSecurityNumber: string;
    cardTypeId: number;
  };
}

/**
 * Helper to check if order is a subscription
 */
export function isSubscription(order: OrderResponse): order is Subscription {
  return order.isRecurring && !!order.recurrenceInterval && !!order.nextRecurrenceDate;
}

/**
 * Helper to get subscription status from order
 */
export function getSubscriptionStatus(order: OrderResponse): SubscriptionStatus {
  if (order.orderStatus === 'Cancelled') return 'cancelled';
  if (order.orderStatus === 'Shipped' || order.orderStatus === 'Paid') return 'active';
  return 'paused';
}
