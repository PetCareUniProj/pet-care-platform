// Orders service based on Ordering API OpenAPI spec

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import {
  CreateOrderDraftRequest,
  CreateOrderRequest,
  OrderDraftResponse,
  OrderResponse,
  CardType,
} from '@/types/order.types';
import { PaginatedResponse } from '@/types/api.types';

/**
 * Service for interacting with Ordering API
 */
class OrdersService {
  // ============ Order Draft ============

  /**
   * Create order draft from basket items
   * POST /api/orders/draft
   */
  async createDraft(data: CreateOrderDraftRequest): Promise<OrderDraftResponse> {
    return apiClient.post<OrderDraftResponse>(
      API_ENDPOINTS.ORDERS.CREATE_DRAFT,
      data
    );
  }

  // ============ Orders ============

  /**
   * Create order from draft
   * POST /api/orders
   */
  async createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
    return apiClient.post<OrderResponse>(
      API_ENDPOINTS.ORDERS.CREATE,
      data
    );
  }

  /**
   * Get order by ID
   * GET /api/orders/{id}
   */
  async getOrderById(id: number): Promise<OrderResponse> {
    return apiClient.get<OrderResponse>(
      API_ENDPOINTS.ORDERS.GET_BY_ID(id)
    );
  }

  /**
   * Get orders for authenticated user
   * GET /api/orders/user/me
   */
  async getUserOrders(): Promise<PaginatedResponse<OrderResponse>> {
    return apiClient.get<PaginatedResponse<OrderResponse>>(
      API_ENDPOINTS.ORDERS.GET_BY_USER
    );
  }

  /**
   * Cancel an order
   * POST /api/orders/cancel/{id}
   */
  async cancelOrder(id: number): Promise<void> {
    return apiClient.post<void>(
      API_ENDPOINTS.ORDERS.CANCEL(id)
    );
  }

  // ============ Card Types ============

  /**
   * Get available card types
   * GET /api/orders/cardtypes
   */
  async getCardTypes(): Promise<CardType[]> {
    return apiClient.get<CardType[]>(
      API_ENDPOINTS.ORDERS.GET_CARD_TYPES
    );
  }
}

export const ordersService = new OrdersService();
