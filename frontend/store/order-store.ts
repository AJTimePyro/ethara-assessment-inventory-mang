import { create } from "zustand";
import type { OrderResponse } from "@/types/order";

interface OrderStore {
  orders: OrderResponse[];
  setOrders: (orders: OrderResponse[]) => void;
  addOrder: (order: OrderResponse) => void;
  removeOrder: (id: number) => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
  addOrder: (order) =>
    set((state) => ({ orders: [...state.orders, order] })),
  removeOrder: (id) =>
    set((state) => ({ orders: state.orders.filter((o) => o.id !== id) })),
}));
