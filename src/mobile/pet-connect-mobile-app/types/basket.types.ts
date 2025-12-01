// Basket types (for local basket management before creating order draft)

import { BasketItem } from './order.types';

/**
 * Local basket state for the mobile app
 * Since we use order draft API, we manage basket locally and then create a draft
 */
export interface LocalBasket {
  items: LocalBasketItem[];
  updatedAt: string;
}

/**
 * Local basket item with additional UI fields
 */
export interface LocalBasketItem extends BasketItem {
  id: string; // Local UUID for tracking
  addedAt: string;
}

/**
 * Add to basket request
 */
export interface AddToBasketRequest {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  pictureUrl: string;
}

/**
 * Update basket item request
 */
export interface UpdateBasketItemRequest {
  itemId: string;
  quantity: number;
}

/**
 * Basket summary for UI
 */
export interface BasketSummary {
  itemsCount: number;
  totalQuantity: number;
  subtotal: number;
}

