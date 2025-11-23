// Order types

export type OrderStatus =
  | 'Draft'
  | 'Submitted'
  | 'AwaitingValidation'
  | 'StockConfirmed'
  | 'Paid'
  | 'Shipped'
  | 'Cancelled';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  unitPrice: number;
  quantity: number;
  pictureUrl?: string;
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  buyerId: string;
  status: OrderStatus;
  orderDate: string;
  items: OrderItem[];
  shippingAddress: Address;
  total: number;
  subtotal: number;
  shippingCost: number;
  discount?: number;
  paymentMethod?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface CreateOrderDto {
  shippingAddress: Address;
  paymentMethod: string;
  promoCode?: string;
}

export interface BasketItem {
  id: string;
  productId: number;
  productName: string;
  productSlug: string;
  unitPrice: number;
  quantity: number;
  pictureUrl?: string;
}

export interface Basket {
  buyerId: string;
  items: BasketItem[];
  total: number;
}


