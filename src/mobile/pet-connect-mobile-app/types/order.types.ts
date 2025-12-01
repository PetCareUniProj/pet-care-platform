// Order types based on Ordering API OpenAPI spec

/**
 * Order status values from backend
 */
export type OrderStatus =
  | 'Draft'
  | 'Submitted'
  | 'AwaitingValidation'
  | 'StockConfirmed'
  | 'Paid'
  | 'Shipped'
  | 'Cancelled';

/**
 * Address DTO from Ordering API
 */
export interface AddressDTO {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

/**
 * Order item DTO from Ordering API
 * Used in order responses
 */
export interface OrderItemDTO {
  productId: number;
  productName: string;
  unitPrice: number;
  discount: number;
  units: number;
  pictureUrl: string;
}

/**
 * Basket item for creating order draft
 * Matches: BasketItem in CreateOrderDraftRequest
 */
export interface BasketItem {
  productId: number;
  productName: string;
  unitPrice: number;
  oldUnitPrice: number;
  quantity: number;
  pictureUrl: string;
}

/**
 * Card type response from Ordering API
 * Matches: GET /api/orders/cardtypes
 */
export interface CardType {
  id: number;
  name: string;
}

/**
 * Request to create order draft
 * Matches: POST /api/orders/draft
 */
export interface CreateOrderDraftRequest {
  isRecurring: boolean;
  recurrenceInterval?: string | null;
  items?: BasketItem[];
}

/**
 * Order draft response
 * Matches: POST /api/orders/draft response
 */
export interface OrderDraftResponse {
  id: number;
  orderItems?: OrderItemDTO[];
  total: number;
  isRecurring: boolean;
  recurrenceInterval?: string | null;
}

/**
 * Request to create order from draft
 * Matches: POST /api/orders
 */
export interface CreateOrderRequest {
  draftOrderId: number;
  city: string;
  street: string;
  state: string;
  country: string;
  zipCode: string;
  cardNumber: string;
  cardHolderName: string;
  cardExpiration: string; // ISO date-time
  cardSecurityNumber: string;
  cardTypeId?: number;
  paymentMethodId?: number;
}

/**
 * Full order response from Ordering API
 * Matches: GET /api/orders/{id}, POST /api/orders responses
 */
export interface OrderResponse {
  id: number;
  orderDate: string; // ISO date-time
  orderStatus: string;
  description?: string | null;
  buyerId?: string | null; // UUID
  address: AddressDTO;
  orderItems?: OrderItemDTO[];
  total: number;
  paymentId?: number | null;
  isRecurring: boolean;
  recurrenceInterval?: string | null;
  nextRecurrenceDate?: string | null; // ISO date-time
  parentOrderId?: number | null;
  isDraft: boolean;
}

// ============ UI Helper Types ============

/**
 * Simplified order for list display
 */
export interface OrderListItem {
  id: number;
  orderDate: string;
  status: OrderStatus;
  total: number;
  itemsCount: number;
  isRecurring: boolean;
}

/**
 * Checkout form data for UI
 */
export interface CheckoutFormData {
  // Address
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  // Payment
  cardNumber: string;
  cardHolderName: string;
  cardExpiration: Date;
  cardSecurityNumber: string;
  cardTypeId: number;
  // Options
  isRecurring: boolean;
  recurrenceInterval?: string;
}

/**
 * Recurrence interval options
 */
export type RecurrenceInterval =
  | '7.00:00:00'    // Weekly
  | '14.00:00:00'   // Bi-weekly
  | '30.00:00:00'   // Monthly
  | '60.00:00:00'   // Bi-monthly
  | '90.00:00:00';  // Quarterly

export const RECURRENCE_LABELS: Record<RecurrenceInterval, string> = {
  '7.00:00:00': 'Щотижня',
  '14.00:00:00': 'Кожні 2 тижні',
  '30.00:00:00': 'Щомісяця',
  '60.00:00:00': 'Кожні 2 місяці',
  '90.00:00:00': 'Щокварталу',
};
