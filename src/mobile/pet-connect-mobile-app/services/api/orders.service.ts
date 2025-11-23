// Orders service

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import { Order, CreateOrderDto, PaginatedResponse, PaginationParams } from '@/types/order.types';

class OrdersService {
  async createDraft(): Promise<Order> {
    return apiClient.post<Order>(API_ENDPOINTS.ORDERS.CREATE_DRAFT);
  }

  async createOrder(data: CreateOrderDto): Promise<Order> {
    return apiClient.post<Order>(API_ENDPOINTS.ORDERS.CREATE, data);
  }

  async getOrderById(id: number): Promise<Order> {
    return apiClient.get<Order>(API_ENDPOINTS.ORDERS.GET_BY_ID(id));
  }

  async getUserOrders(params?: PaginationParams): Promise<PaginatedResponse<Order>> {
    return apiClient.get<PaginatedResponse<Order>>(API_ENDPOINTS.ORDERS.GET_BY_USER, {
      params,
    });
  }

  async cancelOrder(id: number): Promise<Order> {
    return apiClient.post<Order>(API_ENDPOINTS.ORDERS.CANCEL(id));
  }

  async getCardTypes(): Promise<string[]> {
    return apiClient.get<string[]>(API_ENDPOINTS.ORDERS.GET_CARD_TYPES);
  }
}

export const ordersService = new OrdersService();


