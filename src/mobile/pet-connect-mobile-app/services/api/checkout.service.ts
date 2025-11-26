// Checkout service - orchestrates the order creation flow

import { basketService } from './basket.service';
import { ordersService } from './orders.service';
import {
  CreateOrderDraftRequest,
  CreateOrderRequest,
  OrderDraftResponse,
  OrderResponse,
  CheckoutFormData,
} from '@/types/order.types';

/**
 * Result of checkout process
 */
export interface CheckoutResult {
  success: boolean;
  order?: OrderResponse;
  error?: string;
}

/**
 * Service for handling checkout flow
 */
class CheckoutService {
  /**
   * Complete checkout process:
   * 1. Get basket items
   * 2. Create order draft
   * 3. Create order with payment details
   * 4. Clear basket on success
   */
  async checkout(formData: CheckoutFormData): Promise<CheckoutResult> {
    try {
      // 1. Get basket items
      const basketItems = await basketService.getItemsForOrderDraft();

      if (basketItems.length === 0) {
        return {
          success: false,
          error: 'Кошик порожній',
        };
      }

      // 2. Create order draft
      const draftRequest: CreateOrderDraftRequest = {
        isRecurring: formData.isRecurring,
        recurrenceInterval: formData.recurrenceInterval || null,
        items: basketItems,
      };

      const draft = await ordersService.createDraft(draftRequest);

      // 3. Create order from draft
      const orderRequest: CreateOrderRequest = {
        draftOrderId: draft.id,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipCode: formData.zipCode,
        cardNumber: formData.cardNumber,
        cardHolderName: formData.cardHolderName,
        cardExpiration: formData.cardExpiration.toISOString(),
        cardSecurityNumber: formData.cardSecurityNumber,
        cardTypeId: formData.cardTypeId,
      };

      const order = await ordersService.createOrder(orderRequest);

      // 4. Clear basket on success
      await basketService.clearBasket();

      return {
        success: true,
        order,
      };
    } catch (error) {
      console.error('Checkout failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Помилка оформлення замовлення',
      };
    }
  }

  /**
   * Create order draft without completing payment
   * Useful for previewing order totals
   */
  async createDraftPreview(isRecurring = false, recurrenceInterval?: string): Promise<OrderDraftResponse | null> {
    try {
      const basketItems = await basketService.getItemsForOrderDraft();

      if (basketItems.length === 0) {
        return null;
      }

      const draftRequest: CreateOrderDraftRequest = {
        isRecurring,
        recurrenceInterval: recurrenceInterval || null,
        items: basketItems,
      };

      return ordersService.createDraft(draftRequest);
    } catch (error) {
      console.error('Failed to create draft preview:', error);
      return null;
    }
  }
}

export const checkoutService = new CheckoutService();

