import type { ApiMessageResponse } from "./api";

interface CustomerBase {
  email: string;
  full_name: string;
  phone_no: number;
}

export type CustomerCreate = CustomerBase;

export interface CustomerResponse extends CustomerBase {
  id: number;
}

export type CustomerListResponse = CustomerResponse[];
export type CustomerDeleteResponse = ApiMessageResponse;
