import { create } from "zustand";
import type { Customer } from "@/types/customer";

interface CustomerStore {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
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
