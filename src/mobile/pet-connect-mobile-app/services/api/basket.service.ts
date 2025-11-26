// Basket service for local basket management
// Note: Our backend uses order drafts, so we manage basket locally
// and then create a draft when user proceeds to checkout

import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import {
  LocalBasket,
  LocalBasketItem,
  AddToBasketRequest,
  BasketSummary,
} from '@/types/basket.types';
import { BasketItem } from '@/types/order.types';

const BASKET_STORAGE_KEY = '@pet_connect_basket';

/**
 * Service for managing local basket
 * Basket is stored locally and converted to order draft when checking out
 */
class BasketService {
  /**
   * Get current basket from storage
   */
  async getBasket(): Promise<LocalBasket> {
    try {
      const data = await AsyncStorage.getItem(BASKET_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to get basket:', error);
    }
    return { items: [], updatedAt: new Date().toISOString() };
  }

  /**
   * Save basket to storage
   */
  private async saveBasket(basket: LocalBasket): Promise<void> {
    basket.updatedAt = new Date().toISOString();
    await AsyncStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(basket));
  }

  /**
   * Add item to basket
   */
  async addItem(request: AddToBasketRequest): Promise<LocalBasket> {
    const basket = await this.getBasket();

    // Check if item already exists
    const existingIndex = basket.items.findIndex(
      (item) => item.productId === request.productId
    );

    if (existingIndex >= 0) {
      // Update quantity
      basket.items[existingIndex].quantity += request.quantity;
    } else {
      // Add new item
      const newItem: LocalBasketItem = {
        id: uuidv4(),
        productId: request.productId,
        productName: request.productName,
        unitPrice: request.unitPrice,
        oldUnitPrice: request.unitPrice,
        quantity: request.quantity,
        pictureUrl: request.pictureUrl,
        addedAt: new Date().toISOString(),
      };
      basket.items.push(newItem);
    }

    await this.saveBasket(basket);
    return basket;
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(itemId: string, quantity: number): Promise<LocalBasket> {
    const basket = await this.getBasket();

    const itemIndex = basket.items.findIndex((item) => item.id === itemId);
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        basket.items.splice(itemIndex, 1);
      } else {
        basket.items[itemIndex].quantity = quantity;
      }
      await this.saveBasket(basket);
    }

    return basket;
  }

  /**
   * Remove item from basket
   */
  async removeItem(itemId: string): Promise<LocalBasket> {
    const basket = await this.getBasket();

    basket.items = basket.items.filter((item) => item.id !== itemId);
    await this.saveBasket(basket);

    return basket;
  }

  /**
   * Clear entire basket
   */
  async clearBasket(): Promise<void> {
    await AsyncStorage.removeItem(BASKET_STORAGE_KEY);
  }

  /**
   * Get basket summary for UI
   */
  async getBasketSummary(): Promise<BasketSummary> {
    const basket = await this.getBasket();

    return {
      itemsCount: basket.items.length,
      totalQuantity: basket.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: basket.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      ),
    };
  }

  /**
   * Convert local basket items to BasketItem[] for order draft creation
   */
  async getItemsForOrderDraft(): Promise<BasketItem[]> {
    const basket = await this.getBasket();

    return basket.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      unitPrice: item.unitPrice,
      oldUnitPrice: item.oldUnitPrice,
      quantity: item.quantity,
      pictureUrl: item.pictureUrl,
    }));
  }
}

export const basketService = new BasketService();
