import type { PagedResponse } from "./shared";

export interface AddressDto {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface OrderItemDto {
  productId: number;
  productName: string;
  unitPrice: number;
  oldUnitPrice?: number;
  discount: number;
  units: number;
  pictureUrl: string;
}

export interface BasketItemPayload {
  productId: number;
  productName: string;
  unitPrice: number;
  oldUnitPrice?: number;
  quantity: number;
  pictureUrl: string;
}

export interface CreateOrderDraftRequest {
  isRecurring: boolean;
  recurrenceInterval?: string | null;
  items: BasketItemPayload[];
}

export interface OrderDraftResponse {
  id: number;
  orderItems: OrderItemDto[];
  total: number;
  isRecurring: boolean;
  recurrenceInterval?: string | null;
}

export interface CreateOrderRequest {
  draftOrderId: number;
  city: string;
  street: string;
  state: string;
  country: string;
  zipCode: string;
  cardNumber: string;
  cardHolderName: string;
  cardExpiration?: string;
  cardSecurityNumber: string;
  cardTypeId?: number;
  paymentMethodId?: number;
}

export interface CardTypeResponse {
  id: number;
  name: string;
}

export interface OrderResponse {
  id: number;
  orderDate: string;
  orderStatus: string;
  description?: string | null;
  buyerId?: string | null;
  address: AddressDto;
  orderItems: OrderItemDto[];
  total: number;
  paymentId?: number | null;
  isRecurring: boolean;
  recurrenceInterval?: string | null;
  nextRecurrenceDate?: string | null;
  parentOrderId?: number | null;
  isDraft: boolean;
}

export type OrdersResponse = PagedResponse<OrderResponse>;

export const ORDER_STATUS_VALUES = [
  "Draft",
  "Submitted",
  "AwaitingValidation",
  "StockConfirmed",
  "Paid",
  "Shipped",
  "Cancelled",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUS_VALUES)[number];
