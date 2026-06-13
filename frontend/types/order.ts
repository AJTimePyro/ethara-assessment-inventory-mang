import type { ApiMessageResponse, DecimalString } from "./api";

export interface OrderItemCreate {
  product_id: number;
  quantity: number;
}

export interface OrderCreate {
  customer_id: number;
  items: OrderItemCreate[];
}

export interface OrderItemResponse {
  id: number;
  product_id: number;
  quantity: number;
  purchased_price: DecimalString;
}

export interface OrderResponse {
  id: number;
  customer_id: number;
  items: OrderItemResponse[];
}

export type OrderListResponse = OrderResponse[];
export type OrderDeleteResponse = ApiMessageResponse;
