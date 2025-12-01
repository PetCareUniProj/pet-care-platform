// Orders service based on Ordering API OpenAPI spec

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import {
  CreateOrderDraftRequest,
  CreateOrderRequest,
  OrderDraftResponse,
  OrderResponse,
  CardType,
  OrderStatus,
} from '@/types/order.types';
import { PaginatedResponse, PaginationParams } from '@/types/api.types';

/**
 * Query parameters for getting user orders
 * Matches: GET /api/orders/user/me query params
 */
export interface GetUserOrdersParams extends PaginationParams {
  statuses?: OrderStatus[];
  isRecurring?: boolean;
}

/**
 * Build query string from params
 */
function buildQueryString(params?: GetUserOrdersParams): string {
  if (!params) return '';
  
  const searchParams = new URLSearchParams();
  
  if (params.page !== undefined) {
    searchParams.append('Page', params.page.toString());
  }
  if (params.pageSize !== undefined) {
    searchParams.append('PageSize', params.pageSize.toString());
  }
  if (params.sortBy) {
    searchParams.append('SortBy', params.sortBy);
  }
  if (params.isRecurring !== undefined) {
    searchParams.append('IsRecurring', params.isRecurring.toString());
  }
  // Statuses is an array - add each status as separate param
  if (params.statuses && params.statuses.length > 0) {
    params.statuses.forEach(status => {
      searchParams.append('Statuses', status);
    });
  }
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

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
      data,
      { service: 'ordering' }
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
      data,
      { service: 'ordering' }
    );
  }

  /**
   * Get order by ID
   * GET /api/orders/{id}
   */
  async getOrderById(id: number): Promise<OrderResponse> {
    return apiClient.get<OrderResponse>(
      API_ENDPOINTS.ORDERS.GET_BY_ID(id),
      { service: 'ordering' }
    );
  }

  /**
   * Get orders for authenticated user with optional filtering
   * GET /api/orders/user/me
   * @param params - Optional filtering parameters (statuses, isRecurring, pagination)
   */
  async getUserOrders(params?: GetUserOrdersParams): Promise<PaginatedResponse<OrderResponse>> {
    const queryString = buildQueryString(params);
    return apiClient.get<PaginatedResponse<OrderResponse>>(
      `${API_ENDPOINTS.ORDERS.GET_BY_USER}${queryString}`,
      { service: 'ordering' }
    );
  }

  /**
   * Get only regular orders (non-recurring) for authenticated user
   */
  async getRegularOrders(params?: Omit<GetUserOrdersParams, 'isRecurring'>): Promise<PaginatedResponse<OrderResponse>> {
    return this.getUserOrders({ ...params, isRecurring: false });
  }

  /**
   * Get only subscription orders (recurring) for authenticated user
   */
  async getSubscriptionOrders(params?: Omit<GetUserOrdersParams, 'isRecurring'>): Promise<PaginatedResponse<OrderResponse>> {
    return this.getUserOrders({ ...params, isRecurring: true });
  }

  /**
   * Cancel an order
   * POST /api/orders/cancel/{id}
   */
  async cancelOrder(id: number): Promise<void> {
    return apiClient.post<void>(
      API_ENDPOINTS.ORDERS.CANCEL(id),
      undefined,
      { service: 'ordering' }
    );
  }

  // ============ Card Types ============

  /**
   * Get available card types
   * GET /api/orders/cardtypes
   */
  async getCardTypes(): Promise<CardType[]> {
    return apiClient.get<CardType[]>(
      API_ENDPOINTS.ORDERS.GET_CARD_TYPES,
      { service: 'ordering' }
    );
  }
}

export const ordersService = new OrdersService();
