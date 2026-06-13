import api from "./api";
import type {
  CustomerCreate,
  CustomerDeleteResponse,
  CustomerListResponse,
  Customer,
} from "@/types/customer";

const CUSTOMER_API_PATH = "customer";

const getAllCustomers = async (): Promise<CustomerListResponse> => {
  const response = await api.get<CustomerListResponse>(`${CUSTOMER_API_PATH}/`);
  return response.data;
};

const getCustomerById = async (customerId: number): Promise<Customer> => {
  const response = await api.get<Customer>(
    `${CUSTOMER_API_PATH}/${customerId}`,
  );
  return response.data;
};

const createCustomer = async (
  customerData: CustomerCreate,
): Promise<Customer> => {
  const response = await api.post<Customer>(
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
