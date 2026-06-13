import type { ApiMessageResponse } from "./api";

interface CustomerBase {
  email: string;
  full_name: string;
  phone_no: number;
}

export type CustomerCreate = CustomerBase;

export interface Customer extends CustomerBase {
  id: number;
}

export type CustomerListResponse = Customer[];
export type CustomerDeleteResponse = ApiMessageResponse;
