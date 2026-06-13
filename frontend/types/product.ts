import type { ApiMessageResponse, DecimalString } from "./api";

interface ProductBase {
  sku_code: string;
  product_name: string;
  price: DecimalString;
  quantity: number;
}

export type ProductCreate = ProductBase;

export interface ProductUpdate {
  sku_code?: string;
  product_name?: string;
  price?: DecimalString;
  quantity?: number;
}

export interface ProductResponse extends ProductBase {
  id: number;
}

export type ProductListResponse = ProductResponse[];
export type ProductDeleteResponse = ApiMessageResponse;
