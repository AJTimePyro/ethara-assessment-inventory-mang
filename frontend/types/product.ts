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

export interface Product extends ProductBase {
  id: number;
}

export type ProductListResponse = Product[];
export type ProductDeleteResponse = ApiMessageResponse;
