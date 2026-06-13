import { create } from "zustand";
import type { CustomerResponse } from "@/types/customer";

interface CustomerStore {
  customers: CustomerResponse[];
  setCustomers: (customers: CustomerResponse[]) => void;
  addCustomer: (customer: CustomerResponse) => void;
  removeCustomer: (id: number) => void;
}

export const useCustomerStore = create<CustomerStore>((set) => ({
  customers: [],
  setCustomers: (customers) => set({ customers }),
  addCustomer: (customer) =>
    set((state) => ({ customers: [...state.customers, customer] })),
  removeCustomer: (id) =>
    set((state) => ({ customers: state.customers.filter((c) => c.id !== id) })),
}));
