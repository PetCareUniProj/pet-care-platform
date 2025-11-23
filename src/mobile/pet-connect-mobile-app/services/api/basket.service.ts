// Basket service

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import { Basket, BasketItem } from '@/types/order.types';

class BasketService {
  async getBasket(): Promise<Basket> {
    return apiClient.get<Basket>(API_ENDPOINTS.BASKET.GET);
  }

  async addItem(productId: number, quantity: number): Promise<Basket> {
    return apiClient.post<Basket>(API_ENDPOINTS.BASKET.ADD_ITEM, {
      productId,
      quantity,
    });
  }

  async updateItem(itemId: string, quantity: number): Promise<Basket> {
    return apiClient.put<Basket>(API_ENDPOINTS.BASKET.UPDATE_ITEM, {
      itemId,
      quantity,
    });
  }

  async removeItem(itemId: string): Promise<Basket> {
    return apiClient.delete<Basket>(API_ENDPOINTS.BASKET.DELETE_ITEM, {
      data: { itemId },
    });
  }

  async clearBasket(): Promise<void> {
    // Implementation depends on backend API
    const basket = await this.getBasket();
    await Promise.all(basket.items.map((item) => this.removeItem(item.id)));
  }
}

export const basketService = new BasketService();


