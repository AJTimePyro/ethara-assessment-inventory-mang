import api from "./api";
import type {
  CustomerCreate,
  CustomerDeleteResponse,
  CustomerListResponse,
  CustomerResponse,
} from "@/types/customer";

const CUSTOMER_API_PATH = "customer";

const getAllCustomers = async (): Promise<CustomerListResponse> => {
  const response = await api.get<CustomerListResponse>(`${CUSTOMER_API_PATH}/`);
  return response.data;
};

const getCustomerById = async (
  customerId: number,
): Promise<CustomerResponse> => {
  const response = await api.get<CustomerResponse>(
    `${CUSTOMER_API_PATH}/${customerId}`,
  );
  return response.data;
};

const createCustomer = async (
  customerData: CustomerCreate,
): Promise<CustomerResponse> => {
  const response = await api.post<CustomerResponse>(
    `${CUSTOMER_API_PATH}/create`,
    customerData,
  );
  return response.data;
};

const deleteCustomer = async (
  customerId: number,
): Promise<CustomerDeleteResponse> => {
  const response = await api.delete<CustomerDeleteResponse>(
    `${CUSTOMER_API_PATH}/${customerId}`,
  );
  return response.data;
};

export const customerService = {
  getAllCustomers,
  getUsers: getAllCustomers,
  getCustomerById,
  createCustomer,
  deleteCustomer,
};
