// Subscriptions service - uses Ordering API for recurring orders

import { ordersService } from './orders.service';
import { OrderResponse, RecurrenceInterval, RECURRENCE_LABELS } from '@/types/order.types';

/**
 * Subscription is a recurring order (isRecurring = true)
 * This service provides a higher-level abstraction for working with subscriptions
 */

export type SubscriptionStatus = 'active' | 'shipped' | 'cancelled';

/**
 * Subscription view model for UI
 */
export interface Subscription {
  id: number;
  orderId: number;
  productName: string;
  productImage?: string;
  frequency: string;
  frequencyLabel: string;
  nextDelivery: string | null;
  price: number;
  quantity: number;
  status: SubscriptionStatus;
  createdAt: string;
  items: {
    productId: number;
    productName: string;
    unitPrice: number;
    units: number;
    pictureUrl: string;
  }[];
}

/**
 * Map order status to subscription status
 */
function mapOrderStatusToSubscriptionStatus(orderStatus: string): SubscriptionStatus {
  switch (orderStatus.toLowerCase()) {
    case 'cancelled':
      return 'cancelled';
    case 'shipped':
      return 'shipped';
    default:
      return 'active';
  }
}

/**
 * Parse recurrence interval from backend format (TimeSpan) to display format
 */
function parseRecurrenceInterval(interval: string | null | undefined): string {
  if (!interval) return 'Monthly';
  
  // Backend returns TimeSpan format like "30.00:00:00" (30 days)
  // or might return already formatted
  if (interval.includes('.')) {
    const days = parseInt(interval.split('.')[0], 10);
    if (days <= 7) return '7.00:00:00';
    if (days <= 14) return '14.00:00:00';
    if (days <= 30) return '30.00:00:00';
    if (days <= 60) return '60.00:00:00';
    return '90.00:00:00';
  }
  
  return interval as RecurrenceInterval;
}

/**
 * Get recurrence label for display
 */
function getRecurrenceLabel(interval: string): string {
  const normalized = parseRecurrenceInterval(interval);
  return RECURRENCE_LABELS[normalized as RecurrenceInterval] || interval;
}

/**
 * Convert OrderResponse to Subscription
 */
function orderToSubscription(order: OrderResponse): Subscription {
  const items = order.orderItems || [];
  const firstItem = items[0];
  
  // Calculate total quantity and price from items
  const totalQuantity = items.reduce((sum, item) => sum + item.units, 0);
  
  return {
    id: order.id,
    orderId: order.id,
    productName: items.length === 1 
      ? firstItem?.productName || 'Підписка'
      : `${items.length} товарів`,
    productImage: firstItem?.pictureUrl,
    frequency: order.recurrenceInterval || '30.00:00:00',
    frequencyLabel: getRecurrenceLabel(order.recurrenceInterval || '30.00:00:00'),
    nextDelivery: order.nextRecurrenceDate || null,
    price: order.total,
    quantity: totalQuantity,
    status: mapOrderStatusToSubscriptionStatus(order.orderStatus),
    createdAt: order.orderDate,
    items: items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      unitPrice: item.unitPrice,
      units: item.units,
      pictureUrl: item.pictureUrl,
    })),
  };
}

class SubscriptionsService {
  /**
   * Get all subscriptions (recurring orders) for current user
   */
  async getAll(): Promise<Subscription[]> {
    try {
      const response = await ordersService.getUserOrders();
      const orders = response.items || [];
      
      // Filter only recurring orders that are not drafts
      const recurringOrders = orders.filter(
        order => order.isRecurring && !order.isDraft
      );
      
      return recurringOrders.map(orderToSubscription);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }
  }

  /**
   * Get active subscriptions (not cancelled, not shipped)
   */
  async getActive(): Promise<Subscription[]> {
    const all = await this.getAll();
    return all.filter(sub => sub.status === 'active');
  }

  /**
   * Get subscription by ID
   */
  async getById(id: number): Promise<Subscription | null> {
    try {
      const order = await ordersService.getOrderById(id);
      if (!order.isRecurring) return null;
      return orderToSubscription(order);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancel(id: number): Promise<void> {
    await ordersService.cancelOrder(id);
  }

  /**
   * Get recurrence label for display
   */
  getFrequencyLabel(frequency: string): string {
    return getRecurrenceLabel(frequency);
  }

  /**
   * Calculate total monthly cost of active subscriptions
   */
  calculateMonthlyTotal(subscriptions: Subscription[]): number {
    return subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((sum, sub) => {
        // Parse frequency to get multiplier
        const days = parseInt(sub.frequency.split('.')[0], 10) || 30;
        const multiplier = 30 / days; // How many times per month
        return sum + (sub.price * multiplier);
      }, 0);
  }
}

export const subscriptionsService = new SubscriptionsService();
