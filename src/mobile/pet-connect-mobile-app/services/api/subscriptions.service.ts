// Subscriptions service
// Subscriptions are implemented as recurring orders in our backend

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import { ordersService } from './orders.service';
import {
  OrderResponse,
  CreateOrderDraftRequest,
  CreateOrderRequest,
  RECURRENCE_LABELS,
  RecurrenceInterval,
} from '@/types/order.types';
import {
  Subscription,
  SubscriptionDisplay,
  CreateSubscriptionRequest,
  isSubscription,
  getSubscriptionStatus,
} from '@/types/subscription.types';

/**
 * Service for managing subscriptions (recurring orders)
 */
class SubscriptionsService {
  /**
   * Get all subscriptions for current user
   * Filters recurring orders from user's order history
   */
  async getAll(): Promise<Subscription[]> {
    const ordersResponse = await ordersService.getUserOrders();
    return ordersResponse.items.filter(isSubscription);
  }

  /**
   * Get subscriptions formatted for UI display
   */
  async getSubscriptionsDisplay(): Promise<SubscriptionDisplay[]> {
    const subscriptions = await this.getAll();

    return subscriptions.map((sub) => ({
      id: sub.id,
      orderDate: sub.orderDate,
      nextDeliveryDate: sub.nextRecurrenceDate,
      recurrenceInterval: sub.recurrenceInterval as RecurrenceInterval,
      recurrenceLabel:
        RECURRENCE_LABELS[sub.recurrenceInterval as RecurrenceInterval] ||
        sub.recurrenceInterval,
      total: sub.total,
      itemsCount: sub.orderItems?.length || 0,
      status: getSubscriptionStatus(sub),
      items:
        sub.orderItems?.map((item) => ({
          productName: item.productName,
          quantity: item.units,
          unitPrice: item.unitPrice,
          pictureUrl: item.pictureUrl,
        })) || [],
    }));
  }

  /**
   * Create a new subscription
   * Creates a recurring order through order draft flow
   */
  async create(request: CreateSubscriptionRequest): Promise<OrderResponse> {
    // 1. Create order draft with recurring flag
    const draftRequest: CreateOrderDraftRequest = {
      isRecurring: true,
      recurrenceInterval: request.recurrenceInterval,
      items: request.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        unitPrice: item.unitPrice,
        oldUnitPrice: item.unitPrice,
        quantity: item.quantity,
        pictureUrl: item.pictureUrl,
      })),
    };

    const draft = await ordersService.createDraft(draftRequest);

    // 2. Create order from draft
    const orderRequest: CreateOrderRequest = {
      draftOrderId: draft.id,
      ...request.address,
      ...request.payment,
    };

    return ordersService.createOrder(orderRequest);
  }

  /**
   * Cancel a subscription
   * Cancels the recurring order
   */
  async cancel(subscriptionId: number): Promise<void> {
    return ordersService.cancelOrder(subscriptionId);
  }

  /**
   * Get subscription by ID
   */
  async getById(id: number): Promise<Subscription | null> {
    const order = await ordersService.getOrderById(id);
    return isSubscription(order) ? order : null;
  }
}

export const subscriptionsService = new SubscriptionsService();
