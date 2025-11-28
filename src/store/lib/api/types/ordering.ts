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
